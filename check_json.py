import json

with open("test_word.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for q in data["questions"]:
    if q["number"] == 6:
        print("QUESTION TEXT:\n", repr(q["question_text"]))
        print("\nOPTIONS:")
        for opt in q["options"]:
            print(opt)
        print("\nCORRECT ANSWERS:\n", q["correct_answers"])
        print("\nIMAGES COUNT:\n", len(q["images"]))
        break