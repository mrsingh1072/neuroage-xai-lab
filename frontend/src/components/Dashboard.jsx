import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Cloud, X } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MRIUpload from './MRIUpload';
import PredictionResults from './PredictionResults';
import HeatmapVisualization from './HeatmapVisualization';
import InsightsPanel from './InsightsPanel';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const ACCEPTED_FORMATS = ['image/png', 'image/jpeg'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Upload preview validation
  const validateFile = (file) => {
    setUploadError('');
    
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setUploadError('Please upload a PNG or JPG image');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImagePreview(e.target.result);
        setSelectedFile(file);
        setUploadSuccess('');
        // Automatically trigger prediction after showing preview
        setTimeout(() => {
          handleImageUpload(file);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClearImage = () => {
    setUploadedImagePreview(null);
    setSelectedFile(null);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleImageUpload = async (imageFile) => {
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // API call to backend
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      
      // 🎯 DEBUG: Log full API response
      console.log('📡 FULL API RESPONSE:', data);
      console.log('📡 EXPLANATION:', data.explanation);
      console.log('📡 VISUALIZATION PATH:', data.explanation?.visualization_path);
      
      // Extract visualization path and build full URL
      const vizPath = data.explanation?.visualization_path;
      const heatmapUrl = vizPath ? `http://127.0.0.1:5000${vizPath}` : null;
      console.log('🔗 CONSTRUCTED HEATMAP URL:', heatmapUrl);
      
      setUploadedImage(URL.createObjectURL(imageFile));
      setUploadSuccess('✓ Image uploaded successfully');
      setPredictions({
        cnn: {
          age: data.cnn.predicted_age,
          confidence: data.cnn.confidence || 'High',
        },
        vit: {
          age: data.vit.predicted_age,
          confidence: data.vit.confidence || 'High',
        },
        explanation: data.explanation,
        heatmapUrl: heatmapUrl,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      setError(err.message || 'Error processing image. Please try again.');
      console.error('❌ Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-hero overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-8">
            {activeTab === 'dashboard' ? (
              <>
                {/* Dashboard View */}
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-2"
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Brain Age Analysis
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Upload MRI scans and get AI-powered predictions with explainable insights
                  </p>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Upload & Upload Status */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-1"
                  >
                    <MRIUpload 
                      onImageUpload={handleImageUpload}
                      isLoading={isLoading}
                      uploadedImage={uploadedImage}
                    />
                  </motion.div>

                  {/* Right Column - Results & Visualizations */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="lg:col-span-2 space-y-8"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-300"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    {isLoading ? (
                      // Processing UI
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="glass rounded-3xl p-12 min-h-96 flex flex-col items-center justify-center space-y-8"
                      >
                        {/* Title */}
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="text-center space-y-2"
                        >
                          <h2 className="text-2xl font-bold text-white">Processing MRI Scan</h2>
                          <p className="text-gray-400">Running advanced AI analysis...</p>
                        </motion.div>

                        {/* Animated Loader */}
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="relative w-20 h-20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-30 blur-lg" />
                          <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/40 to-purple-600/40 rounded-full border border-cyan-400/50" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 border-2 border-transparent border-t-cyan-400 border-r-purple-600 rounded-full"
                          />
                        </motion.div>

                        {/* Processing Steps */}
                        <div className="w-full max-w-md space-y-3">
                          {[
                            { step: 'Upload received', duration: 0 },
                            { step: 'Extracting features', duration: 0.2 },
                            { step: 'Running AI models', duration: 0.4 },
                            { step: 'Generating insights', duration: 0.6 },
                          ].map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.5, delay: item.duration }}
                              className="flex items-center space-x-3"
                            >
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: item.duration }}
                                className="flex-shrink-0"
                              >
                                {index < 1 ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-400/30 border border-emerald-400 flex items-center justify-center">
                                    <span className="text-emerald-400 text-xs">✓</span>
                                  </div>
                                ) : (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-6 h-6 rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
                                  />
                                )}
                              </motion.div>
                              <span className="text-gray-300 text-sm font-medium">
                                {item.step}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                          className="w-full max-w-md h-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ['0%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full w-1/3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
                          />
                        </motion.div>

                        {/* Subtext */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="text-gray-400 text-sm text-center"
                        >
                          Running CNN and Vision Transformer models
                        </motion.p>
                      </motion.div>
                    ) : predictions ? (
                      <>
                        {/* Prediction Results */}
                        <PredictionResults predictions={predictions} />

                        {/* Heatmap Visualization */}
                        <HeatmapVisualization 
                          imageUrl={uploadedImage}
                          heatmapUrl={predictions.heatmapUrl}
                          explanation={predictions.explanation}
                        />

                        {/* Insights */}
                        <InsightsPanel predictions={predictions} explanation={predictions.explanation} />
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-3xl p-12 text-center min-h-96 flex items-center justify-center"
                      >
                        <div className="space-y-4">
                          <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full opacity-20"
                          />
                          <p className="text-gray-400 text-lg">
                            Upload an MRI scan to get started
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </>
            ) : (
              <>
                {/* Upload View */}
                {/* Header Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-2"
                >
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Upload MRI Scan
                  </h1>
                  <p className="text-gray-400 text-lg">
                    Upload your MRI image for brain age analysis
                  </p>
                </motion.div>

                {/* Success Message */}
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl p-4 text-emerald-300"
                  >
                    {uploadSuccess}
                  </motion.div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass rounded-3xl p-12 min-h-96 flex flex-col items-center justify-center space-y-8"
                  >
                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center space-y-2"
                    >
                      <h2 className="text-2xl font-bold text-white">Processing MRI Scan</h2>
                      <p className="text-gray-400">Running advanced AI analysis...</p>
                    </motion.div>

                    {/* Animated Loader */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative w-20 h-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-30 blur-lg" />
                      <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/40 to-purple-600/40 rounded-full border border-cyan-400/50" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-2 border-transparent border-t-cyan-400 border-r-purple-600 rounded-full"
                      />
                    </motion.div>

                    {/* Processing Steps */}
                    <div className="w-full max-w-md space-y-3">
                      {[
                        { step: 'Upload received', duration: 0 },
                        { step: 'Extracting features', duration: 0.2 },
                        { step: 'Running AI models', duration: 0.4 },
                        { step: 'Generating insights', duration: 0.6 },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: item.duration }}
                          className="flex items-center space-x-3"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: item.duration }}
                            className="flex-shrink-0"
                          >
                            {index < 1 ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-400/30 border border-emerald-400 flex items-center justify-center">
                                <span className="text-emerald-400 text-xs">✓</span>
                              </div>
                            ) : (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-6 h-6 rounded-full border-2 border-cyan-400/30 border-t-cyan-400"
                              />
                            )}
                          </motion.div>
                          <span className="text-gray-300 text-sm font-medium">
                            {item.step}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="w-full max-w-md h-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full w-1/3 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full"
                      />
                    </motion.div>

                    {/* Subtext */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-gray-400 text-sm text-center"
                    >
                      Running CNN and Vision Transformer models
                    </motion.p>
                  </motion.div>
                )}

                {/* Upload Section */}
                {!predictions && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative min-h-96 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                      isDragging
                        ? 'bg-cyan-400/10'
                        : 'bg-slate-800/30'
                    }`}
                    style={{
                      border: isDragging 
                        ? '2px dashed rgb(34, 211, 238)' 
                        : '2px dashed rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Glow Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
                      }}
                    />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleInputChange}
                      className="hidden"
                    />

                    {!uploadedImagePreview ? (
                      <div className="w-full flex flex-col items-center justify-center space-y-6 relative z-10">
                        {/* Cloud Icon */}
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-20 blur-xl" />
                          <Cloud size={64} className="text-cyan-400 relative" strokeWidth={1.5} />
                        </motion.div>

                        {/* Main Text */}
                        <div className="text-center space-y-3">
                          <h3 className="text-2xl font-bold text-white">
                            Upload MRI Image
                          </h3>
                          <p className="text-gray-400 text-base">
                            Click the button below or drag & drop your file here
                          </p>
                        </div>

                        {/* Upload Button */}
                        <motion.button
                          onClick={() => fileInputRef.current?.click()}
                          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)' }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-cyan-400/50"
                        >
                          <Upload size={20} />
                          <span>Choose File</span>
                        </motion.button>

                        {/* Helper Text */}
                        <p className="text-gray-500 text-sm">
                          PNG, JPG • Max 10MB
                        </p>

                        {/* Error Message */}
                        {uploadError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2"
                          >
                            {uploadError}
                          </motion.p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center space-y-6 relative z-10">
                        {/* Image Preview */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center space-y-4"
                        >
                          <div className="relative">
                            <img
                              src={uploadedImagePreview}
                              alt="Uploaded MRI"
                              className="max-h-64 max-w-full rounded-lg object-contain border border-cyan-400/30"
                            />
                            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-lg bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none" />
                          </div>

                          {/* File Info */}
                          <div className="text-center space-y-1">
                            <p className="text-green-400 font-semibold flex items-center justify-center space-x-2">
                              <span className="text-lg">✓</span>
                              <span>File uploaded successfully</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                              {selectedFile?.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                            </p>
                          </div>
                        </motion.div>

                        {/* Change Image Button */}
                        <motion.button
                          onClick={handleClearImage}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-6 py-2 bg-cyan-400/20 border border-cyan-400/50 text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-400/30 transition-colors"
                        >
                          <X size={16} />
                          <span>Change Image</span>
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Results Section */}
                {predictions && !isLoading && (
                  <>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-300"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    {/* Prediction Results */}
                    <PredictionResults predictions={predictions} />

                    {/* Heatmap Visualization */}
                    <HeatmapVisualization 
                      imageUrl={uploadedImage}
                      heatmapUrl={predictions.heatmapUrl}
                      explanation={predictions.explanation}
                    />

                    {/* Insights */}
                    <InsightsPanel predictions={predictions} explanation={predictions.explanation} />

                    {/* Upload Another Button */}
                    <motion.button
                      onClick={() => {
                        setUploadedImagePreview(null);
                        setSelectedFile(null);
                        setPredictions(null);
                        setUploadSuccess('');
                        setError('');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 border border-cyan-400/50 text-cyan-300 rounded-lg font-medium hover:from-cyan-400/30 hover:to-purple-600/30 transition-all"
                    >
                      Upload Another MRI
                    </motion.button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
