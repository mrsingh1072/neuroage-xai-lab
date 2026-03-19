# 🧠 Brain Age Prediction Backend API

## 🚀 Overview

A **Flask-based REST API** for predicting brain age from MRI images using deep learning models.

This backend is part of a **full-stack Explainable AI system**, supporting:

- 🧠 CNN model for prediction  
- 🤖 Vision Transformer (ViT) integration  
- 🔥 Grad-CAM explainability  
- 🌐 Frontend visualization  

---

## 🎯 Project

**Explainable Brain Age Prediction and Comparative Analysis Using CNN and Vision Transformer Models on MRI Images**

---

## ✨ Features

### 🧠 Core Functionality
- Load pre-trained PyTorch models (CNN + ViT ready)
- Accept MRI image input (multiple formats)
- Automatic preprocessing (grayscale, resize, normalize)
- Brain age prediction (regression)
- JSON REST API responses

---

### 🔍 Explainability
- Grad-CAM heatmap generation
- Confidence scoring (Low / Medium / High)
- Brain region interpretation
- Feature importance extraction

---

### ⚙️ Production Ready
- Robust error handling
- Logging & debugging
- Batch prediction support
- Model health monitoring
- Scalable architecture

---

## 🏗 Project Structure

```
backend/
├── app.py                 # Flask API
├── model_loader.py        # Model loading
├── utils.py               # Preprocessing + inference
├── explainability.py      # Grad-CAM
├── requirements.txt
└── README.md

model/
└── model.pth

uploads/
heatmaps/
```

---

## ⚙️ Installation

### 🔧 Requirements
- Python 3.8+
- 4GB RAM (8GB recommended)
- Optional: GPU (CUDA)

---

### ▶️ Setup

```bash
cd backend
pip install -r requirements.txt
```

---

### ▶️ Run Server

```bash
python app.py
```

Server:

```
http://127.0.0.1:5000
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/health` | GET | API status |
| `/predict` | POST | Single prediction |
| `/predict/batch` | POST | Batch prediction |
| `/model/info` | GET | Model details |
| `/heatmap/<filename>` | GET | Serve heatmap |

---

## 📊 Example Response

```json
{
  "predicted_age": 21.4,
  "status": "success",
  "explanation": {
    "confidence": {
      "score": 0.85,
      "level": "high"
    },
    "visualization": "heatmap/pred_21yr_comparison_xxx.png"
  }
}
```

---

## 🖼 Image Processing Pipeline

```
Input → Grayscale → Resize (224x224) → Normalize → Tensor → Model → Output
```

---

## 🔍 Explainable AI (Grad-CAM)

Grad-CAM highlights **important brain regions** influencing prediction.

---

### 🎨 Heatmap Interpretation

| Color | Meaning |
|------|--------|
| 🔴 Red | High importance |
| 🟡 Yellow | Medium |
| 🔵 Blue | Low |

---

### 📂 Heatmap Access

```
http://127.0.0.1:5000/heatmap/<filename>
```

---

## 🧪 Testing

```bash
python test_api.py
```

✔ Health  
✔ Prediction  
✔ Batch  
✔ Error handling  

---

## 📈 Performance

| Step | Time |
|-----|------|
| Preprocessing | 10–20ms |
| Inference | 50–100ms |
| Grad-CAM | 100–150ms |
| Total | ~200–300ms |

---

## ⚠️ Limitations

- Uses 2D MRI slices (not full 3D)
- Small dataset (~770 images)
- ViT still under improvement

---

## 🚀 Future Enhancements

- Improve ViT accuracy
- Add SHAP explainability
- Ensemble CNN + ViT
- Cloud deployment
- Database integration

---

## 🧠 Conclusion

This backend enables:

- AI-based medical prediction  
- Explainable AI (Grad-CAM)  
- REST API deployment  
- Integration with frontend UI  

---

## 📄 Version

**v1.0.0 – Production Ready**

---

🔥 **Backend Successfully Completed**