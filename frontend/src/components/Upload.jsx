import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';



export default function Upload() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const ACCEPTED_FORMATS = ['image/png', 'image/jpeg'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    setError('');
    
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      setError('Please upload a PNG or JPG image');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
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
    setUploadedImage(null);
    setError('');
  };

  return (
    <div className="flex h-screen bg-gradient-hero overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Upload Content - Scrollable */}
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
                Upload MRI Scan
              </h1>
              <p className="text-gray-400 text-lg">
                Upload your MRI image for brain age analysis
              </p>
            </motion.div>

            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`glass rounded-3xl p-12 border min-h-96 flex items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-white/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleInputChange}
                className="hidden"
              />

              {!uploadedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="text-center space-y-4"
                >
                  <p className="text-gray-400 text-lg">
                    Drag and drop your MRI image here or click to select
                  </p>
                  <p className="text-gray-500 text-sm">
                    Supported formats: PNG, JPG (Max 10MB)
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded MRI"
                    className="max-h-64 max-w-full rounded-lg object-contain"
                  />
                  <motion.button
                    onClick={handleClearImage}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Clear Image
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
