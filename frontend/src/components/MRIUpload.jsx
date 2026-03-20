import { motion } from 'framer-motion';
import { Upload, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function MRIUpload({ onImageUpload, isLoading, uploadedImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (['image/png', 'image/jpeg'].includes(file.type)) {
        onImageUpload(file);
      } else {
        alert('Please upload a PNG or JPG image');
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      onImageUpload(files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      {/* Upload Card */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
        className={`glass rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer group ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-white/20 hover:border-cyan-400/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          animate={isLoading ? { scale: 0.9, opacity: 0.7 } : { scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          {/* Upload Icon */}
          <motion.div
            animate={isDragging ? { y: -10 } : { y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-400/30 group-hover:to-purple-500/30 transition-colors">
              <Upload
                size={32}
                className="text-cyan-400 group-hover:text-cyan-300 transition-colors"
              />
            </div>
          </motion.div>

          {/* Text */}
          <div>
            <p className="text-white font-semibold text-lg">
              {isLoading ? 'Processing MRI...' : 'Drop your MRI scan here'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              or{' '}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ color: '#06b6d4' }}
                className="text-cyan-400 hover:underline font-medium"
              >
                browse your files
              </motion.button>
            </p>
            <p className="text-gray-500 text-xs mt-2">PNG or JPG up to 10MB</p>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Uploaded Image Preview */}
      {uploadedImage && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Image uploaded successfully</span>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass rounded-2xl p-4 overflow-hidden border border-white/10"
          >
            <img
              src={uploadedImage}
              alt="MRI Scan"
              className="w-full h-64 object-cover rounded-lg"
            />
          </motion.div>

          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 px-4 rounded-lg border border-white/20 text-gray-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors text-sm font-medium"
          >
            Upload Different Image
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
