# NeuroAge AI - Dashboard Component Roadmap

## 📋 Overview

The Dashboard is the core application interface where users:
- Upload brain MRI scans
- View predictions from CNN & ViT models
- Compare model results side-by-side
- See explainability via Grad-CAM heatmaps
- Download/export analysis results

---

## 🏗️ Architecture

### Routes
```
/dashboard          → Main dashboard (protected)
/dashboard/history  → Past analyses (protected)
/dashboard/profile  → User settings (protected)
/dashboard/results/:id  → Specific result detail view
```

### Protected Route Wrapper
All dashboard routes need authentication check:
```javascript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/auth" />;
  return children;
};
```

---

## 🎨 Dashboard Layout (Desktop)

### Header Area (Top 15%)
```
┌─────────────────────────────────────────────────────────┐
│  Logo   Dashboard    User Menu (Profile, Settings, Logout)  │
└─────────────────────────────────────────────────────────┘
```

### Two-Column Layout
```
Left Sidebar (20%)          Main Content Area (80%)
┌──────────┐              ┌──────────────────────┐
│ Upload   │              │  Current Upload      │
│ Section  │              │  or Results Display  │
│          │              │                      │
│ Upload   │              │  Model Results       │
│ History  │              │  Side-by-Side        │
│          │              │                      │
│ Settings │              │  Heatmap Comparison  │
│          │              │                      │
└──────────┘              └──────────────────────┘
```

### Mobile Layout
```
Header (Full Width)
┌──────────────────┐
│ Menu  Logo  User │
└──────────────────┘

Main Content (Full Width)
Stacked vertically:
- Upload Area
- Results
- Models
- Heatmaps
```

---

## 📦 Component Structure

### Dashboard.jsx (Main container)
```
Dashboard
├── DashboardHeader
│   ├── Logo
│   ├── Navigation
│   └── UserMenu
├── DashboardSidebar
│   ├── UploadSection
│   ├── HistoryList
│   └── QuickLinks
└── DashboardContent
    ├── UploadArea (or Results if file selected)
    ├── ModelResults
    ├── HeatmapComparison
    └── AnalysisDetails
```

---

## 🎯 Core Features

### 1. Upload Section
**UI Components**:
- Drag-and-drop zone
- File browser button
- File info display (size, format, date)
- Upload progress bar
- Cancel button

**State Management**:
```javascript
const [uploadedFile, setUploadedFile] = useState(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadError, setUploadError] = useState(null);
const [isUploading, setIsUploading] = useState(false);
```

**Validation**:
- File type: .nii, .nii.gz (MRI formats)
- File size: < 50MB
- Required DICOM or NIfTI format

**API Integration**:
```javascript
POST /api/upload
Body: FormData with file
Response: { 
  analysisId, 
  status: 'processing',
  estimatedTime: 45
}
```

### 2. Model Results Display
**Components**:
- **CNN Card**:
  - Predicted Age
  - Confidence score (percentage)
  - Inference time
  - Status indicator (✓ Complete)

- **ViT Card**:
  - Predicted Age
  - Confidence score (percentage)
  - Inference time
  - Status indicator (✓ Complete)

- **Comparison Card**:
  - Side-by-side results
  - Difference calculation
  - Best model indicator
  - Agreement metric

**State**:
```javascript
const [results, setResults] = useState({
  cnn: { age: null, confidence: null, time: null },
  vit: { age: null, confidence: null, time: null },
  actualAge: null  // User can input for comparison
});
```

### 3. Heatmap Visualization
**Display Format**:
```
Original MRI | Heatmap | Overlay
[Image]      | [Heat]  | [Combined]
```

**Three-column layout**:
- Left: Original MRI scan (grayscale)
- Center: Grad-CAM heatmap (colored)
- Right: Overlay (50% original + 50% heatmap)

**Interactive Features**:
- Hover to zoom
- Toggle heatmap on/off
- Adjust opacity slider
- Download heatmap image

**State**:
```javascript
const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
const [heatmapModel, setHeatmapModel] = useState('cnn');  // 'cnn' or 'vit'
const [showOriginal, setShowOriginal] = useState(true);
const [showHeatmap, setShowHeatmap] = useState(true);
const [showOverlay, setShowOverlay] = useState(true);
```

### 4. Analysis Details
**Cards to display**:
- Processing Time: Total analysis duration
- Upload Time: When analysis was started
- File Info: Filename, size, format
- Model Info: Version numbers, architectures
- Metrics: Accuracy, confidence, convergence
- Tags: User-added notes or categories

**Expandable sections**:
- Medical Information (age, diagnosis if available)
- Model Details (CNN vs ViT comparison)
- Confidence Metrics
- Processing Steps (Pipeline visualization)

---

## 🎬 Animations & Interactions

### Upload Animation
- File drop → Scale animation (1 → 1.05)
- Progress bar → Linear fill animation
- Result cards → Fade-in + slide-up (staggered)

### Model Results
- Cards slide in from bottom (0.6s stagger)
- Confidence percentage counter animation (0 → actual % over 1s)
- Comparison badge pulses

### Heatmap
- Fade-in when ready (0.8s opacity)
- Overlay slider smooth transition
- Zoom effect on hover (scale 1.05)

### Hover Effects
- Result cards: Glow shadow + elevation (y: -4)
- Heatmap images: Border glow effect
- Buttons: Scale 1.02 + glow
- History items: Highlight background

---

## 📊 Data Flow

### Polling for Results
```javascript
const pollForResults = async (analysisId) => {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/analysis/${analysisId}`);
    const data = await response.json();
    
    setResults(data);
    
    if (data.status === 'complete') {
      clearInterval(interval);  // Stop polling
    }
  }, 2000);  // Check every 2 seconds
};
```

### WebSocket Alternative (Future)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/analysis/{id}');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setResults(data);
};
```

---

## 🎨 Design System

### Color Coding
- **CNN Results**: Cyan/Blue gradient
- **ViT Results**: Purple gradient  
- **Grad-CAM**: Hot colormap (blue → yellow → red)
- **Status**: Green (complete), Yellow (processing), Red (error)

### Card Styling
```css
- Background: rgba(255, 255, 255, 0.05) + backdrop-blur-md
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Hover: glow shadow + border-white/20
- Padding: p-6 md:p-8
- Rounded: rounded-lg
```

### Typography
- **Headers**: text-2xl font-bold text-white
- **Labels**: text-sm font-medium text-gray-300
- **Values**: text-lg font-semibold text-cyan-300
- **Captions**: text-xs text-gray-400

---

## 🚀 Implementation Phase 1

### Files to Create
```
frontend/src/components/
├── Dashboard.jsx (Main container)
├── DashboardHeader.jsx (Header + nav)
├── DashboardSidebar.jsx (Left sidebar)
├── UploadSection.jsx (File upload area)
├── ModelResultCard.jsx (CNN/ViT result display)
├── HeatmapComparison.jsx (Three-column heatmap view)
├── AnalysisDetails.jsx (Metadata display)
├── AnalysisHistory.jsx (List of past analyses)
└── UserMenu.jsx (Profile/settings dropdown)
```

### Routes to Add
```javascript
// App.jsx additions
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
<Route path="/dashboard/history" element={
  <ProtectedRoute>
    <AnalysisHistory />
  </ProtectedRoute>
} />
```

### Navigation Update
- Update navbar to show Dashboard link (when authenticated)
- Update auth redirect to go to /dashboard (not home)
- Add logout button to DashboardHeader

---

## 🔌 API Endpoints Needed

### Upload
```
POST /api/upload
- Body: FormData(file)
- Response: { analysisId, status }
```

### Get Analysis
```
GET /api/analysis/{analysisId}
- Response: { 
    analysisId,
    status,
    cnn: { age, confidence, time },
    vit: { age, confidence, time },
    heatmapUrl,
    timestamp
  }
```

### Get History
```
GET /api/analyses
- Response: [ { id, timestamp, status, preview }, ... ]
```

### Get Heatmap
```
GET /api/analysis/{analysisId}/heatmap
- Response: Image binary data
```

### Save Analysis
```
POST /api/analysis/{analysisId}/save
- Body: { notes, tags }
- Response: { success }
```

---

## 🧪 Testing Checklist

### Upload Functionality
- [ ] Drag and drop file
- [ ] Click to browse files
- [ ] Show upload progress bar
- [ ] Show file size validation error
- [ ] Show file type validation error
- [ ] Cancel upload midway
- [ ] Display loading state

### Results Display
- [ ] CNN results appear correctly
- [ ] ViT results appear correctly
- [ ] Results animate on arrival
- [ ] Comparison shows correct difference
- [ ] Age displays with decimal precision
- [ ] Confidence shows as percentage
- [ ] Inference time displays

### Heatmap Viewer
- [ ] Original image displays
- [ ] Heatmap displays correctly
- [ ] Overlay shows both layers
- [ ] Opacity slider works smoothly
- [ ] Toggle buttons work
- [ ] Zoom on hover works
- [ ] Download heatmap works

### Mobile Responsiveness
- [ ] Upload area full-width on mobile
- [ ] Results stack vertically
- [ ] Heatmap shows as three rows on mobile
- [ ] Sidebar collapses to hamburger menu
- [ ] All text readable on small screens
- [ ] Buttons touch-friendly (44px+)

### Interactions
- [ ] Hover effects visible
- [ ] Button clicks trigger actions
- [ ] Loading spinners appear
- [ ] Error messages display properly
- [ ] Success feedback shown
- [ ] History list loads and updates

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Dashboard load time | < 2s |
| File upload | Real-time progress |
| Results display | < 0.5s animation |
| Heatmap render | < 1s |
| Lazy load history | On-demand |

---

## 🔐 Security Considerations

- ✅ Authenticate all requests with JWT token
- ✅ Validate file uploads (type, size)
- ✅ Sanitize file names
- ✅ Rate limit file uploads
- ✅ Encrypt file storage
- ✅ Validate API responses
- ✅ CORS headers configured

---

## 📝 Next Steps

### Immediate (Today)
1. Create Dashboard.jsx skeleton
2. Create sidebar with upload area
3. Create header with navigation
4. Add routes to App.jsx

### Short-term (This week)
1. Implement file upload UI
2. Create model result cards
3. Create heatmap viewer
4. Connect to backend API (mock first)

### Medium-term (This sprint)
1. Add real file upload
2. Implement polling/WebSocket for results
3. Add analysis history page
4. Add user profile page

### Long-term (Future)
1. Batch analysis processing
2. Advanced filtering/searching
3. Export capabilities (PDF, CSV)
4. Collaboration features

---

## 🎓 Reference Docs

- [Framer Motion Animations](https://www.framer.com/motion/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React Hook Form](https://react-hook-form.com/)
- [Axios for API Calls](https://axios-http.com/)

---

**Status**: 📋 Planning Phase  
**Complexity**: Medium-High  
**Estimated Dev Time**: 3-4 hours  
**Dependencies**: Backend API endpoints  
**Priority**: 🔴 High (Core feature)
