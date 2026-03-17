import os
import nibabel as nib
import pandas as pd
import cv2

# -----------------------------
# LOAD EXCEL
# -----------------------------
df = pd.read_excel("data/oasis/oasis_labels.xlsx")
df.columns = df.columns.str.strip()

# mapping: ID → Age
age_map = dict(zip(df["ID"], df["Age"]))

# -----------------------------
# PATHS
# -----------------------------
base_path = "data/oasis"
output_path = "data/processed"

os.makedirs(output_path, exist_ok=True)

subjects = [f for f in os.listdir(base_path) if f.startswith("OAS1")]

count = 0

# -----------------------------
# PROCESS DATA
# -----------------------------
for subject in subjects:
    subject_path = os.path.join(base_path, subject, "RAW")

    age = age_map.get(subject)
    if age is None:
        continue

    for file in os.listdir(subject_path):
        if file.endswith(".img"):
            img_path = os.path.join(subject_path, file)

            img = nib.load(img_path)
            data = img.get_fdata()

            mid = data.shape[2] // 2

            # 🔥 TAKE MULTIPLE SLICES (5 slices)
            for i in range(mid - 2, mid + 3):

                slice_img = data[:, :, i, 0]

                # normalize
                slice_img = (slice_img - slice_img.min()) / (slice_img.max() - slice_img.min())
                slice_img = (slice_img * 255).astype("uint8")

                # resize
                slice_img = cv2.resize(slice_img, (224, 224))

                # -----------------------------
                # SAVE ORIGINAL
                # -----------------------------
                filename = f"{subject}_slice_{i}_age_{age}.png"
                cv2.imwrite(os.path.join(output_path, filename), slice_img)

                count += 1
                print(f"Saved: {filename}")

                # -----------------------------
                # 🔥 DATA AUGMENTATION (FLIP)
                # -----------------------------
                flipped = cv2.flip(slice_img, 1)

                filename_flip = f"{subject}_slice_{i}_flip_age_{age}.png"
                cv2.imwrite(os.path.join(output_path, filename_flip), flipped)

                count += 1
                print(f"Saved: {filename_flip}")

            break

print(f"\nTotal images saved: {count}")