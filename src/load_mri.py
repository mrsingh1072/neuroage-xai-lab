import os
import nibabel as nib
import matplotlib.pyplot as plt

base_path = "data/oasis"

# Get subject folders
subjects = [f for f in os.listdir(base_path) if f.startswith("OAS1")]
first_subject = subjects[0]

subject_path = os.path.join(base_path, first_subject, "RAW")

# 🔍 Find .img file
img_file = None
for file in os.listdir(subject_path):
    if file.endswith(".img"):
        img_file = os.path.join(subject_path, file)
        break

if img_file is None:
    print("No .img file found!")
    exit()

print("Loading:", img_file)

# Load MRI (nibabel auto reads .hdr pair)
img = nib.load(img_file)
data = img.get_fdata()

print("Shape:", data.shape)

# Show middle slice
slice_idx = data.shape[2] // 2

plt.imshow(data[:, :, slice_idx], cmap="gray")
plt.title("MRI Slice")
plt.axis("off")
plt.show()