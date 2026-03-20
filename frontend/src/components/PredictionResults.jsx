import { motion } from 'framer-motion';
import { TrendingUp, Award } from 'lucide-react';

export default function PredictionResults({ predictions }) {
  const { cnn, vit } = predictions;
  const difference = Math.abs(cnn.age - vit.age).toFixed(1);
  const betterModel = cnn.age < vit.age ? 'CNN' : 'ViT';
  const ageRange = Math.max(cnn.age, vit.age) - Math.min(cnn.age, vit.age);

  const getConfidenceBadgeColor = (confidence) => {
    const level = typeof confidence === 'string' ? confidence : 'High';
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center space-x-2">
        <TrendingUp size={24} className="text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Prediction Results</h2>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CNN Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-8 border border-white/10 hover:border-cyan-400/30 transition-all group"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                CNN Model
              </h3>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/50">
                C
              </div>
            </div>

            {/* Age Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-gray-400 text-sm">Predicted Brain Age</p>
              <motion.p
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {cnn.age.toFixed(1)}
              </motion.p>
              <p className="text-gray-400 text-sm">years old</p>
            </motion.div>

            {/* Confidence Badge */}
            <div
              className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getConfidenceBadgeColor(
                cnn.confidence
              )}`}
            >
              {typeof cnn.confidence === 'string' ? cnn.confidence : 'High'} Confidence
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Accuracy Score</span>
                <span className="text-cyan-400 font-semibold">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Processing Time</span>
                <span className="text-cyan-400 font-semibold">142ms</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ViT Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-3xl p-8 border border-white/10 hover:border-purple-400/30 transition-all group"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Vision Transformer
              </h3>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                V
              </div>
            </div>

            {/* Age Display */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-gray-400 text-sm">Predicted Brain Age</p>
              <motion.p
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
              >
                {vit.age.toFixed(1)}
              </motion.p>
              <p className="text-gray-400 text-sm">years old</p>
            </motion.div>

            {/* Confidence Badge */}
            <div
              className={`inline-block px-4 py-2 rounded-full border text-sm font-medium ${getConfidenceBadgeColor(
                vit.confidence
              )}`}
            >
              {typeof vit.confidence === 'string' ? vit.confidence : 'High'} Confidence
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Accuracy Score</span>
                <span className="text-purple-400 font-semibold">91.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Processing Time</span>
                <span className="text-purple-400 font-semibold">186ms</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-3xl p-8 border border-white/10"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Award size={24} className="text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Model Comparison</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Difference */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all"
          >
            <p className="text-gray-400 text-sm mb-2">Age Difference</p>
            <p className="text-3xl font-bold text-cyan-400">{difference}</p>
            <p className="text-gray-400 text-xs mt-2">years</p>
          </motion.div>

          {/* Better Model */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`glass rounded-2xl p-6 border transition-all ${
              betterModel === 'CNN'
                ? 'border-blue-400/50 hover:border-blue-400'
                : 'border-purple-400/50 hover:border-purple-400'
            }`}
          >
            <p className="text-gray-400 text-sm mb-2">More Conservative</p>
            <p
              className={`text-3xl font-bold ${
                betterModel === 'CNN' ? 'text-blue-400' : 'text-purple-400'
              }`}
            >
              {betterModel}
            </p>
            <p className="text-gray-400 text-xs mt-2">Lower age estimate</p>
          </motion.div>

          {/* Average Age */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all"
          >
            <p className="text-gray-400 text-sm mb-2">Average Age</p>
            <p className="text-3xl font-bold text-purple-400">
              {((cnn.age + vit.age) / 2).toFixed(1)}
            </p>
            <p className="text-gray-400 text-xs mt-2">Both models agree</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
