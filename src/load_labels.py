import pandas as pd
import os

# ✅ Correct file path
file_path = file_path = "data/oasis/oasis_labels.xlsx"

df = pd.read_excel(file_path)
df.columns = df.columns.str.strip()

print("Columns:", df.columns)

# Create mapping
age_map = dict(zip(df["ID"], df["Age"]))

# Match with folders
base_path = "data/oasis"
subjects = [f for f in os.listdir(base_path) if f.startswith("OAS1")]

print("\nMatching MRI with Age:\n")

for subject in subjects[:10]:
    age = age_map.get(subject, "Not Found")
    print(f"{subject} → Age: {age}")