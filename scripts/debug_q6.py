import sys
import os
from docx import Document

docx_path = r"C:\Users\Progr\Downloads\NSE 4 - FortiOS _AD-7.6_ 137 Questions & Answers. Last Update Apr 10, 2026.docx"

if not os.path.exists(docx_path):
    print(f"Файл не найден по пути: {docx_path}")
    sys.exit(1)

doc = Document(docx_path)

found = False
count = 0

print("=== НАЧАЛО ДИАГНОСТИКИ ВОПРОСА 6 ===")
for p in doc.paragraphs:
    txt = p.text.strip()
    if "QUESTION 6" in txt.upper():
        found = True
    if found:
        print(f"[{count}] {repr(txt)}")
        count += 1
        if "QUESTION 7" in txt.upper() or count > 25:
            break

print("\n=== ПРОВЕРКА ТАБЛИЦ ДОКУМЕНТА ===")
for t_idx, table in enumerate(doc.tables):
    for r_idx, row in enumerate(table.rows):
        for c_idx, cell in enumerate(row.cells):
            c_text = cell.text.strip()
            if "NOC" in c_text or "QUESTION 6" in c_text or "admintimeout" in c_text:
                print(f"В ТАБЛИЦЕ #{t_idx} (ряд {r_idx}, ячейка {c_idx}): {repr(c_text)}")