import sys
import os
import json
import re
import base64
import warnings

warnings.filterwarnings("ignore")

try:
    import pymupdf as fitz
    fitz.TOOLS.mupdf_display_errors(False)
except Exception:
    import fitz
    fitz.TOOLS.mupdf_display_errors(False)

def get_base64_image(pix):
    return "data:image/png;base64," + base64.b64encode(pix.tobytes("png")).decode("utf-8")

def parse_pdf(pdf_path, output_json_path):
    doc = fitz.open(pdf_path)

    # Гибкое регулярное выражение: находит QUESTION даже если перед ним нет перевода строки
    q_marker_regex = re.compile(
        r'(?:QUESTION|Question|Topic\s*\d*\s*Question)[\s\.:#-]*(\d+)',
        re.IGNORECASE
    )
    ans_regex = re.compile(
        r'(?:Correct\s*Answer|Answer|Correct\s*Aswer)\s*[:#\.\s-]*([A-F,\s]+)',
        re.IGNORECASE
    )
    exp_regex = re.compile(r'(?i)(?:Explanation|Reference)[\s\S]*?[:#\s-]\s*([\s\S]*)$')
    opt_regex = re.compile(r'^([A-F])[\.\)]\s+(.*)')

    parsed_questions = {}
    ordered_numbers = []

    # 1. Постраничный сбор: текст + координаты картинок
    for page_idx, page in enumerate(doc):
        page_h = page.rect.height
        page_images = []

        for img_info in page.get_images(full=True):
            xref = img_info[0]
            try:
                rects = page.get_image_rects(xref)
                if not rects:
                    continue
                r = rects[0]

                # Пропускаем значок EXPERT Verified на странице 0 и колонтитулы
                if page_idx == 0 and r.y0 < 220:
                    continue
                if r.y1 < 30 or r.y0 > (page_h - 30):
                    continue

                pix = fitz.Pixmap(doc, xref)
                if pix.n >= 5:
                    pix = fitz.Pixmap(fitz.csRGB, pix)

                if pix.width < 75 or pix.height < 45:
                    continue

                page_images.append({
                    "b64": get_base64_image(pix),
                    "y0": r.y0,
                    "y1": r.y1,
                    "ymid": (r.y0 + r.y1) / 2.0
                })
            except Exception:
                pass

        page_images.sort(key=lambda x: x["y0"])

        # Находим маркеры вопросов на текущей странице с точными координатами Y
        blocks = page.get_text("blocks")
        page_q_markers = []

        for b in blocks:
            b_text = b[4].strip()
            # Проверяем весь текст блока построчно
            for line in b_text.split("\n"):
                m = q_marker_regex.search(line)
                if m:
                    q_num = int(m.group(1))
                    page_q_markers.append({
                        "q_num": q_num,
                        "y0": b[1],
                        "y1": b[3]
                    })
                    if q_num not in parsed_questions:
                        ordered_numbers.append(q_num)
                        parsed_questions[q_num] = {
                            "number": q_num,
                            "orig_number": q_num,
                            "raw_text": "",
                            "images": []
                        }
                    break

        page_q_markers.sort(key=lambda x: x["y0"])

        # Пространственная привязка картинок текущей страницы
        if page_images:
            if not page_q_markers:
                if ordered_numbers:
                    last_q = parsed_questions[ordered_numbers[-1]]
                    for img in page_images:
                        if img["b64"] not in last_q["images"]:
                            last_q["images"].append(img["b64"])
            else:
                for img in page_images:
                    assigned_q = None
                    if img["ymid"] < page_q_markers[0]["y0"]:
                        if len(ordered_numbers) > len(page_q_markers):
                            cur_idx = ordered_numbers.index(page_q_markers[0]["q_num"])
                            if cur_idx > 0:
                                assigned_q = ordered_numbers[cur_idx - 1]
                        if not assigned_q:
                            assigned_q = page_q_markers[0]["q_num"]
                    else:
                        for i in range(len(page_q_markers)):
                            curr_y = page_q_markers[i]["y0"]
                            next_y = page_q_markers[i + 1]["y0"] if i + 1 < len(page_q_markers) else 999999.0
                            if curr_y <= img["ymid"] < next_y:
                                assigned_q = page_q_markers[i]["q_num"]
                                break

                    if assigned_q and assigned_q in parsed_questions:
                        if img["b64"] not in parsed_questions[assigned_q]["images"]:
                            parsed_questions[assigned_q]["images"].append(img["b64"])

    # 2. Извлекаем полный текст и делим на блоки с учетом склеек
    full_text = ""
    for page in doc:
        t = page.get_text("text").replace('\xa0', ' ').replace('\r', '')
        full_text += t + "\n"

    matches = list(q_marker_regex.finditer(full_text))

    for i in range(len(matches)):
        start = matches[i].start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        block = full_text[start:end]
        orig_q_num = int(matches[i].group(1))

        if orig_q_num in parsed_questions:
            parsed_questions[orig_q_num]["raw_text"] = block

    # 3. Формируем финальный массив вопросов
    final_questions = []

    for q_num in ordered_numbers:
        q_data = parsed_questions[q_num]
        block = q_data["raw_text"]
        if not block:
            continue

        # Ответы
        correct_answers = []
        ans_m = ans_regex.search(block)
        if ans_m:
            clean_ans = ans_m.group(1).replace(" ", "").replace(",", "").upper()
            for ch in clean_ans:
                if 'A' <= ch <= 'F':
                    correct_answers.append(ch)

        # Объяснение
        explanation = ""
        exp_m = exp_regex.search(block)
        if exp_m:
            explanation = exp_m.group(1).strip()

        # Тело вопроса
        parts = ans_regex.split(block, maxsplit=1)
        body = parts[0]
        body = q_marker_regex.sub("", body, count=1).strip()

        options = []
        lines = body.split("\n")
        curr_key = ""
        curr_text = ""
        q_lines = []

        for line in lines:
            trimmed = line.strip()
            opt_m = opt_regex.match(trimmed)
            if opt_m:
                if curr_key:
                    options.append({"key": curr_key, "text": curr_text.strip()})
                curr_key = opt_m.group(1)
                curr_text = opt_m.group(2)
            elif curr_key:
                curr_text += " " + trimmed
            else:
                q_lines.append(line)

        if curr_key:
            options.append({"key": curr_key, "text": curr_text.strip()})

        question_text = "\n".join(q_lines).strip()
        q_type = "multiple_choice" if len(correct_answers) > 1 or "choose" in question_text.lower() else "single_choice"

        final_questions.append({
            "number": q_num,
            "orig_number": q_num,
            "type": q_type,
            "question_text": question_text,
            "images": q_data["images"],
            "options": options,
            "correct_answers": correct_answers,
            "explanation": explanation
        })

    base_title = os.path.splitext(os.path.basename(pdf_path))[0]
    out_data = {
        "exam_title": base_title,
        "total_questions": len(final_questions),
        "passing_score_percentage": 80.0,
        "time_limit_minutes": len(final_questions) * 2,
        "questions": final_questions
    }

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, ensure_ascii=False, indent=2)

    print(f"Готово! Успешно извлечено вопросов: {len(final_questions)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(1)
    parse_pdf(sys.argv[1], sys.argv[2])