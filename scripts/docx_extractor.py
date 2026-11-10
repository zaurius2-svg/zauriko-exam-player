import sys
import os
import json
import re
import base64
from docx import Document

def get_base64_image(image_bytes):
    return "data:image/png;base64," + base64.b64encode(image_bytes).decode("utf-8")

def parse_docx(docx_path, output_json_path):
    doc = Document(docx_path)

    q_pattern = re.compile(r'^\s*(?:QUESTION|Question|Topic\s*\d*\s*Question)[\s\.:#-]*(\d+)\s*$', re.IGNORECASE)
    ans_pattern = re.compile(r'^\s*(?:Correct\s*Answer|Answer|Correct\s*Aswer)\s*[:#\.\s-]*([A-F,\s]+)', re.IGNORECASE)
    exp_pattern = re.compile(r'(?i)(?:Explanation|Reference)[\s\S]*?[:#\s-]\s*([\s\S]*)$')
    opt_explicit_pattern = re.compile(r'^([A-F])[\.\)]\s*(.*)', re.IGNORECASE)

    raw_items = []
    current_q = None

    # Поабзацный сбор текста и картинок
    for p in doc.paragraphs:
        p_text = p.text.strip()

        p_images = []
        for rId in p._p.xpath('.//a:blip/@r:embed'):
            try:
                rel = p.part.rels[rId]
                if "image" in rel.target_ref:
                    blob = rel.target_part.blob
                    if len(blob) > 2000:
                        p_images.append(get_base64_image(blob))
            except Exception:
                pass

        m = q_pattern.match(p_text) if p_text else None
        if m:
            if current_q:
                raw_items.append(current_q)
            q_num = int(m.group(1))
            current_q = {
                "number": q_num,
                "elements": []
            }
        else:
            if current_q:
                if p_text or p_images:
                    current_q["elements"].append({
                        "text": p_text,
                        "images": p_images
                    })

    if current_q:
        raw_items.append(current_q)

    questions = []

    for item in raw_items:
        elements = item["elements"]
        q_num = item["number"]

        ans_idx = -1
        correct_answers = []
        explanation = ""

        # Ищем Correct Answer
        for idx, el in enumerate(elements):
            t = el["text"]
            ans_m = ans_pattern.search(t)
            if ans_m:
                ans_idx = idx
                clean_ans = ans_m.group(1).replace(" ", "").replace(",", "").upper()
                for ch in clean_ans:
                    if 'A' <= ch <= 'F':
                        correct_answers.append(ch)
                break

        # Объяснение
        if ans_idx != -1 and ans_idx + 1 < len(elements):
            exp_lines = [el["text"] for el in elements[ans_idx + 1:] if el["text"]]
            exp_text = "\n".join(exp_lines).strip()
            exp_m = exp_pattern.search(exp_text)
            explanation = exp_m.group(1).strip() if exp_m else exp_text

        content_elements = elements[:ans_idx] if ans_idx != -1 else elements

        # Проверяем, есть ли явные буквы (A., B., C., D.)
        has_explicit = any(opt_explicit_pattern.match(el["text"]) for el in content_elements if el["text"])

        options = []
        q_lines = []
        q_images = []

        if has_explicit:
            curr_opt = None
            in_options = False

            for el in content_elements:
                t = el["text"]
                imgs = el["images"]
                m_opt = opt_explicit_pattern.match(t) if t else None

                if m_opt:
                    in_options = True
                    if curr_opt:
                        options.append(curr_opt)
                    curr_opt = {
                        "key": m_opt.group(1).upper(),
                        "text": m_opt.group(2).strip(),
                        "image": imgs[0] if imgs else ""
                    }
                elif in_options and curr_opt:
                    if t:
                        curr_opt["text"] = (curr_opt["text"] + " " + t).strip()
                    if imgs and not curr_opt["image"]:
                        curr_opt["image"] = imgs[0]
                else:
                    if t:
                        q_lines.append(t)
                    if imgs:
                        q_images.extend(imgs)

            if curr_opt:
                options.append(curr_opt)
        else:
            # Текстовые варианты без букв
            num_opts = 4
            if 'F' in correct_answers:
                num_opts = 6
            elif 'E' in correct_answers:
                num_opts = 5

            text_elements = [el for el in content_elements if el["text"]]
            for el in content_elements:
                if el["images"]:
                    q_images.extend(el["images"])

            if len(text_elements) > num_opts:
                q_lines = [el["text"] for el in text_elements[:-num_opts]]
                raw_opts = text_elements[-num_opts:]
            elif len(text_elements) > 1:
                q_lines = [text_elements[0]["text"]]
                raw_opts = text_elements[1:]
            else:
                q_lines = [el["text"] for el in text_elements]
                raw_opts = []

            letters = ['A', 'B', 'C', 'D', 'E', 'F']
            for opt_idx, el in enumerate(raw_opts):
                key = letters[opt_idx] if opt_idx < len(letters) else str(opt_idx + 1)
                options.append({
                    "key": key,
                    "text": el["text"],
                    "image": el["images"][0] if el["images"] else ""
                })

        # Фильтруем "Refer to the exhibit" из формулировки вопроса при наличии текста
        filtered_q_lines = [ql for ql in q_lines if not re.match(r'^refer to the exhibit[\.:]?', ql, re.IGNORECASE)]
        question_text = " ".join(filtered_q_lines if filtered_q_lines else q_lines).strip()

        q_type = "multiple_choice" if len(correct_answers) > 1 or "choose" in question_text.lower() else "single_choice"

        questions.append({
            "number": q_num,
            "orig_number": q_num,
            "type": q_type,
            "question_text": question_text,
            "images": q_images,
            "options": options,
            "correct_answers": correct_answers,
            "explanation": explanation
        })

    base_title = os.path.splitext(os.path.basename(docx_path))[0]
    out_data = {
        "exam_title": base_title,
        "total_questions": len(questions),
        "passing_score_percentage": 80.0,
        "time_limit_minutes": len(questions) * 2,
        "questions": questions
    }

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)

    print(f"Готово! Извлечено {len(questions)} вопросов с поддержкой картинок внутри вариантов.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)
    parse_docx(sys.argv[1], sys.argv[2])