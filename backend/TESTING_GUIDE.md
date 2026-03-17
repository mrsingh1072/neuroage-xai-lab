# 🧪 API Testing Guide

Complete guide for testing the Brain Age Prediction API with automatic image detection.

## 📋 Quick Start

### 1. Generate Test Images (Easiest)
```bash
cd backend
python generate_test_image.py
```

This creates 3 sample images in `backend/test_images/`:
- `test_image_simple.png` - Random noise image
- `test_image_gradient.png` - Gradient pattern
- `test_image_circular.png` - Circular pattern

### 2. Verify API is Running
```bash
# In new terminal
python app.py
```

### 3. Run Tests
```bash
# In another terminal
python test_api.py
```

Expected output:
```
✓ Found 3 test image(s) in the project
  1. test_image_simple.png (12.5 KB)
  2. test_image_gradient.png (12.8 KB)
  3. test_image_circular.png (13.2 KB)
Using: test_image_simple.png for prediction test

[PASS] Health Check
[PASS] Model Info
[PASS] Single Prediction
[PASS] Batch Prediction
[PASS] Error Handling

Results: 5/5 tests passed
```

---

## 🔍 How Image Detection Works

The test script automatically searches for images in:

```
backend/test_images/          ← Best: Put images here
backend/                       ← Also searched
../data/oasis/                ← OASIS dataset
../data/processed/            ← Processed data
../data/                       ← Data root
```

**Supported formats**: PNG, JPG, JPEG, GIF, BMP, TIFF

---

## 🛠️ Methods to Provide Test Images

### Method 1: Auto-Generate (Recommended for Quick Testing)
```bash
python generate_test_image.py
# Creates 3 sample images instantly
# No external dependencies needed if Pillow is installed
```

### Method 2: Copy Real MRI Scans
From the OASIS dataset in your project:
```bash
# Copy brain scans to test directory
cp ../data/oasis/OAS1_0001_MR1/RAW/*.nii.gz backend/test_images/

# Or extract and convert to PNG first
# (You may need to install nibabel and convert tools)
```

### Method 3: Add Your Own Images
```bash
# Copy your brain MRI images to the test directory
cp /path/to/your/mri_scans/*.png backend/test_images/
```

### Method 4: Let test_api.py Create Images
If no images found, `test_api.py` automatically attempts to create a sample image:
```
No test images found in the project
Attempting to create a sample test image...
✓ Sample image created: sample_test_image.png
Using: sample_test_image.png for prediction test
```

---

## 📊 Test Script Features

### Automatic Image Discovery ✅
```python
# The script now:
test_images = find_test_images()  # Searches multiple locations
# Returns ALL images found:
# ['/path/to/image1.png', '/path/to/image2.jpg', ...]
```

### Progress Logging ✅
```
Found 5 test image(s) in the project
  1. brain_scan_001.png (245.3 KB)
  2. brain_scan_002.png (223.1 KB)
  3. sample_image.png (12.5 KB)
  ...
Using: brain_scan_001.png for prediction test
```

### Flexible Test Execution ✅
Tests run based on available images:
- **0 images** → Create sample image automatically
- **1 image** → Single prediction test only
- **2+ images** → Single + Batch prediction tests

### Error Handling ✅
```json
{
  "error": "File type not allowed",
  "status": "error"
}
```

---

## 📖 Test Scenarios

### Scenario 1: Fresh Installation (No Images)
```bash
python test_api.py

# Output:
# ⚠ No test images found in the project
# ✓ Sample image created: sample_test_image.png
# [PASS] Single Prediction
# [PASS] Batch Prediction
```

### Scenario 2: With Generated Images
```bash
python generate_test_image.py
python test_api.py

# Output:
# ✓ Found 3 test image(s) in the project
# [PASS] Single Prediction
# [PASS] Batch Prediction (3 images)
```

### Scenario 3: With Real MRI Data
```bash
# Copy from OASIS dataset
cp ../data/oasis/*/RAW/*.nii backend/test_images/  # or convert to PNG

python test_api.py

# Output:
# ✓ Found 47 test image(s) in the project
# [PASS] Single Prediction
# [PASS] Batch Prediction
```

---

## 🔧 Troubleshooting

### Issue: "No test images found"
**Solution**: Run the generator
```bash
python generate_test_image.py
```

### Issue: "Pillow not installed"
**Solution**: Install required package
```bash
pip install Pillow numpy
python generate_test_image.py
```

### Issue: Tests still skip prediction
**Solution**: Check image detection
```bash
# Verify test images exist
ls backend/test_images/
ls backend/
ls ../data/oasis/

# Run with verbose output
python test_api.py -v  # (if verbose flag added)
```

### Issue: Connection refused
**Solution**: Start the Flask server first
```bash
# Terminal 1
python backend/app.py

# Terminal 2 (new window)
python backend/test_api.py
```

---

## 📂 Directory Structure

```
backend/
├── app.py                 # Flask API
├── test_api.py           # Testing script (improved)
├── generate_test_image.py # Image generator (NEW)
├── test_images/          # Test images directory (NEW)
│   ├── README.md
│   ├── .gitkeep
│   ├── test_image_simple.png (if generated)
│   ├── test_image_gradient.png (if generated)
│   └── test_image_circular.png (if generated)
└── ...
```

---

## 📝 Usage Examples

### Run Complete Test Suite
```bash
cd backend
python app.py &  # Start server in background
python test_api.py
```

### Generate Images First
```bash
cd backend
python generate_test_image.py
python test_api.py
```

### Test with Specific Image
```bash
# Manual test (without test_api.py)
curl -X POST -F "image=@test_images/test_image_simple.png" \
  http://localhost:5000/predict | jq
```

### Python Testing
```python
import requests
from pathlib import Path

# Auto-find images
images = list(Path("backend/test_images").glob("*.png"))

for img in images:
    with open(img, 'rb') as f:
        response = requests.post(
            "http://localhost:5000/predict",
            files={"image": f}
        )
        print(f"{img.name}: {response.json()['predicted_age']} years")
```

---

## ✅ Checklist for Testing

- [ ] Flask server running: `python app.py`
- [ ] Images available in `backend/test_images/` (or generated)
- [ ] Run: `python test_api.py`
- [ ] Verify all tests pass ✓
- [ ] Check prediction results make sense
- [ ] Review any error messages

---

## 🎯 What Gets Tested

| Test | Status | Details |
|------|--------|---------|
| Health Check | ✅ Always | Verifies API is running |
| Model Info | ✅ Always | Checks model loaded correctly |
| Single Prediction | ✅ If images | Tests `/predict` endpoint |
| Batch Prediction | ✅ If 2+ images | Tests `/predict/batch` endpoint |
| Error Handling | ✅ Always | Tests invalid file rejection |

---

## 📊 Sample Output

```
╔══════════════════════════════════════════╗
║     Brain Age Prediction API Tester      ║
║   Testing Flask Backend Functionality    ║
╚══════════════════════════════════════════╝

ℹ API Base URL: http://localhost:5000
ℹ Timeout: 30 seconds

═══════════════════════════════════════════════════════════════
TEST 1: Health Check
═══════════════════════════════════════════════════════════════

ℹ Requesting: GET http://localhost:5000/health

Status Code: 200
Response Body:
{
  "device": "cuda",
  "model_loaded": true,
  "status": "running",
  "timestamp": "2026-03-17T22:40:12.639317"
}

✓ Health check passed! API is running.

═══════════════════════════════════════════════════════════════
SEARCHING FOR TEST IMAGES
═══════════════════════════════════════════════════════════════

✓ Found 3 test image(s) in the project
  1. test_image_simple.png (12.5 KB)
  2. test_image_gradient.png (12.8 KB)
  3. test_image_circular.png (13.2 KB)
ℹ Using: test_image_simple.png for prediction test

═══════════════════════════════════════════════════════════════
TEST 3: Single Image Prediction
═══════════════════════════════════════════════════════════════

ℹ Image path: /backend/test_images/test_image_simple.png
ℹ Image size: 12.50 KB
ℹ Sending: POST http://localhost:5000/predict

Status Code: 200
Response Body:
{
  "explanation": {...},
  "predicted_age": 65.42,
  "status": "success",
  "timestamp": "2026-03-17T22:40:13.123456"
}

✓ Prediction successful! Predicted age: 65.42 years

════════════════════════════════════════════════════════════════
TEST SUMMARY
════════════════════════════════════════════════════════════════

[PASS] Health Check
[PASS] Model Info
[PASS] Single Prediction
[PASS] Batch Prediction
[PASS] Error Handling

Results: 5/5 tests passed

✓ All tests passed! API is working correctly.
```

---

## 🚀 Next Steps After Testing

1. ✅ Confirmed API is working
2. ✅ Verified model loads correctly
3. ✅ Tested prediction endpoint
4. ✅ Validated error handling

**Now you can**:
- Deploy to production
- Build a frontend UI
- Integrate with medical applications
- Scale to larger datasets

---

**For more details**, see:
- [API Reference](API_REFERENCE.md)
- [README](README.md)
- [Quick Start](QUICKSTART.md)

---

**Version**: 1.0.1 | **Date**: March 17, 2026 | **Status**: Enhanced Testing
