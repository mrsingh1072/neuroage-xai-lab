import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MRIUpload from './MRIUpload';
import PredictionResults from './PredictionResults';
import HeatmapVisualization from './HeatmapVisualization';
import InsightsPanel from './InsightsPanel';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dashboard Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 space-y-8">
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

                {predictions ? (
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
          </div>
        </div>
      </div>
    </div>
  );
}
