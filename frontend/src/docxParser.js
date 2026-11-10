import JSZip from "jszip";

// ==================== МОЩНЫЙ КЛИЕНТСКИЙ ПАРСЕР DOCX С СОХРАНЕНИЕМ ПРОБЕЛОВ ====================
export async function parseDocxOnClient(file) {
    const zip = await JSZip.loadAsync(file);
    const docXmlFile = zip.file("word/document.xml");
    if (!docXmlFile) throw new Error("Неверный формат DOCX: отсутствует word/document.xml");

    const xmlText = await docXmlFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    // 1. Извлекаем медиа-файлы (изображения)
    const imagesMap = {};
    const relsFile = zip.file("word/_rels/document.xml.rels");
    if (relsFile) {
        try {
            const relsText = await relsFile.async("text");
            const relsDoc = parser.parseFromString(relsText, "application/xml");
            const relationships = relsDoc.getElementsByTagName("Relationship");
            for (let rel of relationships) {
                const rId = rel.getAttribute("Id");
                const target = rel.getAttribute("Target");
                if (target && target.startsWith("media/")) {
                    const imgZipEntry = zip.file(`word/${target}`);
                    if (imgZipEntry) {
                        const base64 = await imgZipEntry.async("base64");
                        const ext = target.split('.').pop().toLowerCase();
                        const mime = ext === "png" ? "image/png" : "image/jpeg";
                        imagesMap[rId] = `data:${mime};base64,${base64}`;
                    }
                }
            }
        } catch (e) {
            console.warn("Media rels error:", e);
        }
    }

    // 2. Извлекаем параграфы с ГАРАНТИРОВАННЫМ сохранением пробелов
    const pNodes = xmlDoc.getElementsByTagName("w:p");
    const paragraphs = [];

    for (let p of pNodes) {
        let pText = "";
        
        // В Word внутри <w:p> идут блоки <w:r> (runs)
        const runs = p.querySelectorAll("w\\:r, r");
        
        if (runs.length > 0) {
            for (let r of runs) {
                let runText = "";
                // Читаем текст внутри <w:t>
                const tNodes = r.querySelectorAll("w\\:t, t");
                for (let t of tNodes) {
                    runText += t.textContent;
                }
                
                // Табуляции и разрывы строк
                if (r.querySelector("w\\:tab, tab")) runText += " ";
                if (r.querySelector("w\\:br, br")) runText += "\n";

                // Если предыдущий текст не кончался пробелом и новый не начинается,
                // но они в разных <w:r>, разделяем пробелом при необходимости
                if (pText.length > 0 && runText.length > 0) {
                    const lastChar = pText[pText.length - 1];
                    const firstChar = runText[0];
                    if (!/\s/.test(lastChar) && !/\s/.test(firstChar)) {
                        pText += " ";
                    }
                }
                pText += runText;
            }
        } else {
            const allT = p.querySelectorAll("w\\:t, t");
            for (let t of allT) {
                pText += (pText && !pText.endsWith(" ") ? " " : "") + t.textContent;
            }
        }

        const hasNumPr = p.getElementsByTagName("w:numPr").length > 0 || p.getElementsByTagName("numPr").length > 0;

        const embeddedImages = [];
        const blips = p.querySelectorAll("a\\:blip, blip");
        for (let blip of blips) {
            const embedId = blip.getAttribute("r:embed");
            if (embedId && imagesMap[embedId]) {
                embeddedImages.push(imagesMap[embedId]);
            }
        }

        // Нормализуем пробелы
        pText = pText.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, " ")
                     .replace(/[ \t]+/g, " ")
                     .trim();

        if (pText || embeddedImages.length > 0) {
            paragraphs.push({ text: pText, images: embeddedImages, isListItem: hasNumPr });
        }
    }

    // 3. Структурный разбор вопросов по блокам
    const rawQuestions = [];
    let curBlock = null;

    for (let item of paragraphs) {
        const text = item.text;

        const qMatch = text.match(/^(?:QUESTION|ВОПРОС|Вопрос)\s*(\d+)[:.]?\s*(.*)/i);
        if (qMatch) {
            if (curBlock) rawQuestions.push(curBlock);
            curBlock = {
                number: parseInt(qMatch[1], 10),
                rawLines: [],
                images: [...item.images]
            };
            if (qMatch[2] && qMatch[2].trim()) {
                curBlock.rawLines.push({ text: qMatch[2].trim(), isListItem: item.isListItem });
            }
            continue;
        }

        if (!curBlock) continue;

        if (item.images.length > 0) {
            curBlock.images.push(...item.images);
        }

        if (text) {
            curBlock.rawLines.push({ text: text, isListItem: item.isListItem });
        }
    }

    if (curBlock) rawQuestions.push(curBlock);

    // 4. Построение объектов вопросов с отделением вариантов
    const questions = [];
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    rawQuestions.forEach((block, bIdx) => {
        let correctAnswers = [];
        let explanation = "";
        let inExplanation = false;

        const preLines = [];

        for (let lineObj of block.rawLines) {
            const line = lineObj.text;

            const ansMatch = line.match(/(?:Correct\s*Answer|Ответ|Правильный\s*ответ)[:\s]*([A-F,\s]+)/i);
            if (ansMatch) {
                const rawAns = ansMatch[1].toUpperCase();
                correctAnswers = rawAns.match(/[A-F]/g) || [];
                continue;
            }

            const expMatch = line.match(/(?:Explanation|Пояснение|Объяснение)[:\s]*(.*)/i);
            if (expMatch) {
                inExplanation = true;
                explanation = expMatch[1] ? expMatch[1].trim() : "";
                continue;
            }

            if (inExplanation) {
                explanation += (explanation ? "\n" : "") + line;
                continue;
            }

            preLines.push(lineObj);
        }

        const options = [];
        let questionTextLines = [];

        const hasExplicitLetters = preLines.some(l => /^(?:[\u2022\-\*]\s*)?\[?([A-F])\]?[\.\):\-]\s+/i.test(l.text));

        if (hasExplicitLetters) {
            for (let lineObj of preLines) {
                const line = lineObj.text;
                const optMatch = line.match(/^(?:[\u2022\-\*]\s*)?\[?([A-F])\]?[\.\):\-]\s*(.*)/i);
                if (optMatch) {
                    options.push({
                        key: optMatch[1].toUpperCase(),
                        text: optMatch[2].trim(),
                        image: ""
                    });
                } else if (options.length > 0) {
                    options[options.length - 1].text += " " + line;
                } else {
                    questionTextLines.push(line);
                }
            }
        } else {
            const expectedCount = (correctAnswers.length > 0) 
                ? Math.max(...correctAnswers.map(c => alphabet.indexOf(c) + 1), 4) 
                : 4;

            if (preLines.length > expectedCount) {
                const qLines = preLines.slice(0, preLines.length - expectedCount);
                const optLines = preLines.slice(preLines.length - expectedCount);

                questionTextLines = qLines.map(l => l.text);
                optLines.forEach((l, idx) => {
                    options.push({
                        key: alphabet[idx] || String(idx + 1),
                        text: l.text,
                        image: ""
                    });
                });
            } else {
                questionTextLines = preLines.map(l => l.text);
            }
        }

        questions.push({
            number: block.number || (bIdx + 1),
            question_text: questionTextLines.join("\n\n"),
            options: options,
            correct_answers: correctAnswers,
            explanation: explanation,
            images: block.images,
            type: (correctAnswers.length > 1) ? "multiple_choice" : "single_choice"
        });
    });

    return {
        exam_title: file.name.replace(/\.[^/.]+$/, ""),
        total_questions: questions.length,
        passing_score_percentage: 70.0,
        time_limit_minutes: Math.max(questions.length * 2, 60),
        questions: questions
    };
}
