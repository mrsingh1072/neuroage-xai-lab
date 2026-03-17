# Test Images Directory

This directory stores test images for the API testing script.

## 🖼️ How to add test images:

### Option 1: Use the Generator Script
Generate synthetic test images automatically:

```bash
python generate_test_image.py
```

This creates:
- `test_image_simple.png` - Random grayscale image
- `test_image_gradient.png` - Gradient pattern (tissue variation)
- `test_image_circular.png` - Circular pattern (brain cross-section)

### Option 2: Add Real Brain MRI Images
Place actual MRI brain scan images (in .png, .jpg, etc.) in this directory:

```bash
# Copy from OASIS dataset
cp ../data/oasis/OAS1_0001_MR1/*/*.png ./

# Or place your own scans
cp /path/to/your/brain_mri.png ./
```

### Option 3: Use OASIS Dataset
The test script automatically searches the OASIS dataset in `../data/oasis/`

## 📋 Supported Formats

- ✅ PNG
- ✅ JPG / JPEG
- ✅ GIF
- ✅ BMP
- ✅ TIFF

## 🧪 Running Tests

Once images are in place:

```bash
# Run the test suite
python test_api.py
```

The script will automatically:
1. Search for images in multiple locations
2. Use found images for `/predict` endpoint testing
3. Test batch predictions with multiple images
4. Validate API responses

## 📊 Test Query Results

After running tests, check results:
- ✓ Single Prediction Test
- ✓ Batch Prediction Test
- ✓ Prediction validation

## 🔍 Image Requirements

- **Size**: Recommended 224×224 minimum (will be resized)
- **Format**: Grayscale or color (will be converted to grayscale)
- **File Size**: Minimum 1KB, Maximum 50MB
- **Color Depth**: Any

## 💡 Tips

- For **quick testing**: Use `generate_test_image.py` (no external data needed)
- For **realistic testing**: Use actual MRI scans from OASIS dataset
- For **batch testing**: Add 2-3 different images to this directory
- For **large-scale testing**: Use all images from `../data/oasis/`

## 📖 Related Files

- `generate_test_image.py` - Auto-generate synthetic test images
- `test_api.py` - Main API testing script
- `../check_setup.py` - Setup verification
