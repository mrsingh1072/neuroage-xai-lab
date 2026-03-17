# API Reference Guide

## Base URL
```
http://localhost:5000
```

## Response Format
All responses are JSON format.

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Purpose**: Verify API is running and model is loaded

**Request**:
```bash
curl http://localhost:5000/health
```

**Response** (200 OK):
```json
{
  "status": "running",
  "timestamp": "2024-03-17T10:30:45.123456",
  "model_loaded": true,
  "device": "cuda"
}
```

**Response Fields**:
- `status`: "running" if API is operational
- `timestamp`: ISO 8601 timestamp of response
- `model_loaded`: Boolean, true if model successfully loaded
- `device`: "cuda" or "cpu" indicating compute device

**Status Code**: 200

---

### 2. Single Image Prediction

**Endpoint**: `POST /predict`

**Purpose**: Predict brain age from a single MRI image

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | file | Yes | MRI scan image (PNG, JPG, GIF, BMP, TIFF) |

**Request Examples**:

```bash
# Using cURL
curl -X POST -F "image=@mri_scan.png" http://localhost:5000/predict

# Using cURL with output to file
curl -X POST -F "image=@mri_scan.png" http://localhost:5000/predict > prediction.json

# Using Python requests
import requests
with open("mri_scan.png", "rb") as f:
    files = {"image": f}
    response = requests.post("http://localhost:5000/predict", files=files)
    print(response.json())
```

**Response Success** (200 OK):
```json
{
  "predicted_age": 65.42,
  "status": "success",
  "timestamp": "2024-03-17T10:30:45.123456",
  "explanation": {
    "predicted_age": 65.42,
    "confidence_score": 0.6542,
    "interpretation": {
      "raw_output": 0.6542,
      "predicted_age": 65.42,
      "confidence": "medium",
      "interpretation": "Brain age prediction based on MRI structural patterns"
    },
    "heatmap_path": "backend/heatmaps/placeholder_heatmap.png"
  }
}
```

**Response Fields**:
- `predicted_age`: Float, predicted brain age in years
- `status`: "success" for successful predictions
- `timestamp`: ISO 8601 timestamp
- `explanation`: Object containing interpretability features
  - `confidence_score`: Float [0, 1], prediction confidence
  - `interpretation`: Detailed explanation object
  - `heatmap_path`: Path to Grad-CAM visualization

**Response Error - Invalid File** (400 Bad Request):
```json
{
  "error": "File type not allowed. Allowed types: png, jpg, jpeg, gif, bmp, tiff",
  "status": "error"
}
```

**Response Error - No File** (400 Bad Request):
```json
{
  "error": "No image file provided in request",
  "status": "error"
}
```

**Response Error - Model Not Loaded** (503 Service Unavailable):
```json
{
  "error": "Model not loaded. Cannot process prediction.",
  "status": "error"
}
```

**Response Error - File Too Large** (413 Payload Too Large):
```json
{
  "error": "File too large. Maximum size: 50 MB",
  "status": "error"
}
```

**Status Codes**:
- 200: Success
- 400: Bad request (invalid file, missing parameter)
- 413: Payload too large
- 503: Service unavailable (model not loaded)

**Image Requirements**:
- **Format**: PNG, JPG, JPEG, GIF, BMP, TIFF
- **Size**: Max 50 MB
- **Resolution**: Minimum 224×224 recommended
- **Color**: Any (will be converted to grayscale)

**Processing**:
1. Image loaded
2. Converted to grayscale
3. Resized to 224×224
4. Normalized to [0, 1]
5. Preprocessed to tensor
6. Model prediction
7. Denormalized to age range

---

### 3. Batch Image Prediction

**Endpoint**: `POST /predict/batch`

**Purpose**: Predict brain age for multiple images in one request

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `images` | files | Yes | Multiple MRI scan images |

**Request Examples**:

```bash
# Using cURL with multiple files
curl -X POST \
  -F "images=@scan1.png" \
  -F "images=@scan2.png" \
  -F "images=@scan3.png" \
  http://localhost:5000/predict/batch

# Using Python requests
import requests
with open("scan1.png", "rb") as f1, \
     open("scan2.png", "rb") as f2, \
     open("scan3.png", "rb") as f3:
    files = [('images', f1), ('images', f2), ('images', f3)]
    response = requests.post("http://localhost:5000/predict/batch", files=files)
    print(response.json())
```

**Response Success** (200 OK):
```json
{
  "total_files": 3,
  "successful_predictions": 3,
  "failed_predictions": 0,
  "predictions": [
    {
      "file_index": 0,
      "filename": "scan1.png",
      "predicted_age": 65.42,
      "status": "success"
    },
    {
      "file_index": 1,
      "filename": "scan2.png",
      "predicted_age": 58.17,
      "status": "success"
    },
    {
      "file_index": 2,
      "filename": "scan3.png",
      "predicted_age": 72.85,
      "status": "success"
    }
  ],
  "errors": null,
  "timestamp": "2024-03-17T10:30:45.123456"
}
```

**Response with Errors** (200 OK):
```json
{
  "total_files": 3,
  "successful_predictions": 2,
  "failed_predictions": 1,
  "predictions": [
    {
      "file_index": 0,
      "filename": "scan1.png",
      "predicted_age": 65.42,
      "status": "success"
    },
    {
      "file_index": 1,
      "filename": "scan2.png",
      "predicted_age": 58.17,
      "status": "success"
    }
  ],
  "errors": [
    {
      "file_index": 2,
      "filename": "invalid.txt",
      "error": "Invalid file type"
    }
  ],
  "timestamp": "2024-03-17T10:30:45.123456"
}
```

**Response Fields**:
- `total_files`: Integer, total files submitted
- `successful_predictions`: Integer, successful predictions count
- `failed_predictions`: Integer, failed predictions count
- `predictions`: Array of successful predictions
  - `file_index`: Index in request (0-based)
  - `filename`: Original filename
  - `predicted_age`: Predicted age in years
  - `status`: "success" for successful predictions
- `errors`: Array of errors (null if no errors)
  - `file_index`: Index in request
  - `filename`: Original filename
  - `error`: Error message

**Response Error - No Images** (400 Bad Request):
```json
{
  "error": "No images provided",
  "status": "error"
}
```

**Status Codes**:
- 200: Completed (may include partial failures)
- 400: Bad request (no files provided)
- 503: Service unavailable

**Constraints**:
- Maximum recommended batch size: 20 images
- Each image max 50 MB
- Same format requirements as single prediction

---

### 4. Model Information

**Endpoint**: `GET /model/info`

**Purpose**: Get metadata about the loaded model

**Request**:
```bash
curl http://localhost:5000/model/info
```

**Response** (200 OK):
```json
{
  "model_loaded": true,
  "model_path": "d:\\neuroage-xai-lab\\model\\model.pth",
  "device": "cuda",
  "model_file_exists": true,
  "input_shape": [1, 1, 224, 224],
  "output_shape": [1, 1],
  "expected_input": "Grayscale MRI image (224x224)",
  "output_range": "0.0 to 1.0 (normalized age)",
  "age_range": "20 to 90 years",
  "timestamp": "2024-03-17T10:30:45.123456"
}
```

**Response Fields**:
- `model_loaded`: Boolean, true if model is available
- `model_path`: String, file path to model weights
- `device`: "cuda" or "cpu"
- `model_file_exists`: Boolean, file exists on disk
- `input_shape`: Array [batch, channels, height, width]
- `output_shape`: Array [batch, output_channels]
- `expected_input`: String description of input format
- `output_range`: String description of raw output
- `age_range`: String description of age range
- `timestamp`: ISO 8601 timestamp

**Status Codes**:
- 200: Success

---

## Error Handling

### Standard Error Response Format

**400 Bad Request**:
```json
{
  "error": "Descriptive error message",
  "status": "error"
}
```

**413 Payload Too Large**:
```json
{
  "error": "File too large. Maximum size: 50 MB",
  "status": "error"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "status": "error"
}
```

**503 Service Unavailable**:
```json
{
  "error": "Model not loaded. Cannot process prediction.",
  "status": "error"
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No image file provided" | Missing image parameter | Include `image` field |
| "File type not allowed" | Wrong format | Use PNG, JPG, GIF, BMP, TIFF |
| "File too large" | Exceeds 50 MB | Reduce file size |
| "Model not loaded" | Model missing/failed | Check model/model.pth |
| "Image preprocessing failed" | Invalid image | Use valid image file |
| "Model prediction failed" | Inference error | Check model compatibility |

---

## Request/Response Examples

### Example 1: Health Check
```bash
# Request
curl -X GET http://localhost:5000/health

# Response (200)
{
  "status": "running",
  "timestamp": "2024-03-17T10:30:45.123456",
  "model_loaded": true,
  "device": "cuda"
}
```

### Example 2: Single Prediction
```bash
# Request
curl -X POST \
  -F "image=@brain_mri.png" \
  http://localhost:5000/predict

# Response (200)
{
  "predicted_age": 65.42,
  "status": "success",
  "timestamp": "2024-03-17T10:30:46.456789",
  "explanation": {
    "predicted_age": 65.42,
    "confidence_score": 0.6542,
    ...
  }
}
```

### Example 3: Batch Prediction
```bash
# Request
curl -X POST \
  -F "images=@scan1.png" \
  -F "images=@scan2.png" \
  http://localhost:5000/predict/batch

# Response (200)
{
  "total_files": 2,
  "successful_predictions": 2,
  "failed_predictions": 0,
  "predictions": [
    {"file_index": 0, "filename": "scan1.png", ...},
    {"file_index": 1, "filename": "scan2.png", ...}
  ],
  ...
}
```

### Example 4: Model Info
```bash
# Request
curl -X GET http://localhost:5000/model/info

# Response (200)
{
  "model_loaded": true,
  "device": "cuda",
  "input_shape": [1, 1, 224, 224],
  ...
}
```

---

## Rate Limiting

Currently: **No rate limiting implemented**

Future versions may include:
- Requests per minute per IP
- Batch size constraints
- File size limits

---

## Authentication

**Currently**: No authentication required

For production deployment, consider:
- API key authentication
- JWT tokens
- OAuth 2.0

---

## CORS Support

**Currently**: CORS can be enabled in `app.py`

```python
from flask_cors import CORS
CORS(app)
```

---

## Timeout Handling

- **Request timeout**: 30 seconds (configurable)
- **Prediction timeout**: Per-image processing time ~200ms

---

## Version Information

- **API Version**: 1.0.0
- **Last Updated**: March 17, 2024
- **Framework**: Flask 3.0.0
- **Python**: 3.8+

---

## Quick Reference

| Endpoint | Method | Purpose | Status Code |
|----------|--------|---------|-------------|
| `/health` | GET | Check API status | 200 |
| `/predict` | POST | Single prediction | 200/400/413/503 |
| `/predict/batch` | POST | Batch prediction | 200/400/503 |
| `/model/info` | GET | Model metadata | 200 |

---

## Implementation Notes

### Image Size Limits
- Maximum: 50 MB per file
- Recommended: < 5 MB
- All images resized to 224×224

### Processing Time
- Typical: 200-300ms per image (GPU)
- Slow: 1-2s per image (CPU)

### Memory Usage
- Per process: ~500 MB
- Per inference: ~100-200 MB
- Batch of 10: ~1.5 GB

### Device Support
- GPU: CUDA-enabled NVIDIA GPUs
- CPU: All systems (slower)
- Auto-detection: Implemented

---

## Troubleshooting

### 503 Service Unavailable
**Issue**: Model not loaded
**Solution**: Check `model/model.pth` exists

### 400 Bad Request
**Issue**: File format not supported
**Solution**: Use PNG, JPG, GIF, BMP, or TIFF

### 413 Payload Too Large
**Issue**: File exceeds 50 MB
**Solution**: Compress or resize image

### Slow Response
**Issue**: Using CPU instead of GPU
**Solution**: Install CUDA and compatible PyTorch

---

For detailed documentation, see:
- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Getting started guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

**Version**: 1.0.0 | **Updated**: March 17, 2024
