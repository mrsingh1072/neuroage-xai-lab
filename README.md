# 🧠 NeuroAge XAI Lab  
## Explainable Brain Age Prediction using MRI (CNN vs Vision Transformer)

---

## 🚀 Project Overview

This project is a **complete end-to-end AI system** that predicts a person’s **brain age from MRI images** and explains the prediction using **Explainable AI (Grad-CAM)**.

It also includes a **comparative analysis between CNN and Vision Transformer (ViT)** models.

---

## 🌐 Full System (Frontend + Backend + AI Models)

This is a **full-stack AI application**:

- 🖥 Frontend UI for uploading MRI images
- ⚙️ Flask Backend API for processing
- 🧠 CNN + Vision Transformer (ViT) models
- 🔥 Grad-CAM explainability with heatmaps

---

### 🔄 End-to-End Flow

```
User Upload → Frontend → Flask API → CNN & ViT → Prediction → Grad-CAM → Heatmap → UI Display
```

---

## 🎯 Key Features

- 🧠 Brain age prediction from MRI scans  
- 🤖 CNN vs Vision Transformer (ViT) comparison  
- 🔥 Grad-CAM heatmap visualization  
- 🌐 Flask REST API (production-ready)  
- 🖥 Interactive frontend UI  
- 📊 Confidence score & interpretation  
- 🔁 Batch prediction support  

---

## 📦 Dataset & Model Setup (Required)

Due to large file sizes, dataset and model are **not included in this repository**.

---

### 🔗 Download Files

👉 Google Drive Link:  
https://drive.google.com/drive/folders/1xSuk70NEsU8-nQt1gIz4JCtOHM0kitO6?usp=sharing

---

### 📁 Contents

- `data/`
  - `oasis/` → Raw MRI data  
  - `processed/` → Preprocessed images  

- `model/`
  - `model.pth` → Trained model  

- `heatmaps/` *(optional)* → Sample outputs  

---

### ⚙️ Setup Instructions

#### 1️⃣ Download & Extract

Download all folders and extract if needed.

---

#### 2️⃣ Place in Project

```
neuroage-xai-lab/
├── data/
│   ├── oasis/
│   └── processed/
├── backend/
│   └── model/
│       └── model.pth
```

---

#### 3️⃣ Verify Setup

```bash
python backend/check_setup.py
```

---

#### 4️⃣ Test

```bash
python backend/test_api.py
```

---

## 🖥 Frontend Application

Interactive UI for real-time prediction and visualization.

---

### 🎯 Features

- Upload MRI image  
- Predict using CNN vs ViT  
- Show prediction + confidence  
- Compare models  
- Display Grad-CAM heatmap  

---

### ▶️ Run Frontend

```bash
python -m http.server 3000
```

Open:

```
http://127.0.0.1:3000
```

---

### ⚠️ Important

Backend must be running at:

```
http://127.0.0.1:5000
```

---

## 🚀 Backend Setup

### Install Dependencies

```bash
pip install -r backend/requirements.txt
```

---

### Run Server

```bash
python backend/app.py
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/health` | GET | Check API status |
| `/predict` | POST | Single prediction |
| `/predict/batch` | POST | Batch prediction |
| `/model/info` | GET | Model details |
| `/heatmap/<filename>` | GET | Serve heatmap |

---

## 📊 Example API Response

```json
{
  "cnn": {
    "predicted_age": 21.4,
    "confidence": "high"
  },
  "vit": {
    "predicted_age": 41.2,
    "confidence": "medium"
  },
  "comparison": {
    "difference": 19.8,
    "higher_confidence": "CNN"
  },
  "explanation": {
    "visualization": "heatmap/pred_21yr_comparison_xxx.png"
  }
}
```

---

## 🔍 Explainable AI (Grad-CAM)

Grad-CAM highlights important brain regions influencing prediction.

---

### 🖼 Output

- Original MRI  
- Raw Heatmap  
- Overlay Heatmap  

---

### 🎨 Color Meaning

| Color | Meaning |
|------|--------|
| 🔴 Red | High importance |
| 🟡 Yellow | Medium importance |
| 🔵 Blue | Low importance |

---

### 📂 Heatmap Access

```
http://127.0.0.1:5000/heatmap/<filename>
```

---

## 🏗 Project Structure

```
neuroage-xai-lab/
├── backend/
├── data/
├── src/
├── model/
├── uploads/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🧪 Testing

```bash
python backend/test_api.py
```

---

## 📈 Pipeline

```
MRI → Preprocessing → CNN / ViT → Prediction → Grad-CAM → Visualization
```

---

## ⚠️ Limitations

- Small dataset (~770 images)  
- Uses 2D slices instead of full 3D MRI  
- ViT needs further optimization  

---

## 🚀 Future Enhancements

- Improve ViT accuracy  
- Add SHAP explainability  
- Deploy on cloud  
- Build advanced UI (React/Streamlit)  
- Support 3D MRI  

---

## ⭐ Final Project Status

| Component | Status |
|----------|--------|
| CNN Model | ✅ Done |
| ViT Model | ✅ Done |
| Backend API | ✅ Done |
| Frontend UI | ✅ Done |
| Grad-CAM | ✅ Done |
| Heatmap Visualization | ✅ Done |
| End-to-End System | ✅ Done |

---

## 🧠 Conclusion

This project demonstrates:

- Medical image processing  
- Deep learning model comparison  
- Explainable AI integration  
- Full-stack deployment  

---

## 👨‍💻 Contributor

- Saurabh kumar 🚀

---

🔥 **Project Completed Successfully**