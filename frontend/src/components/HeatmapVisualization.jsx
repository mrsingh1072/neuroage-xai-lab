import { motion } from 'framer-motion';
import { Eye, HelpCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function HeatmapVisualization({ imageUrl, heatmapUrl, explanation }) {
  const [viewMode, setViewMode] = useState('comparison'); // 'original', 'heatmap', 'overlay', 'comparison'
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Get regions from backend explanation or use defaults
  const backendRegions = explanation?.important_regions || [];
  const defaultRegions = [
    {
      name: 'Frontal regions',
      description: 'Executive function indicator',
      importance: 'High',
      color: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
    },
    {
      name: 'Temporal lobes',
      description: 'Memory processing',
      importance: 'High',
      color: 'bg-orange-500/20',
      borderColor: 'border-orange-500/50',
    },
    {
      name: 'Parietal regions',
      description: 'Sensory integration',
      importance: 'Medium',
      color: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
    },
    {
      name: 'Ventricular system',
      description: 'Brain size reference',
      importance: 'Medium',
      color: 'bg-blue-500/20',
      borderColor: 'border-blue-500/50',
    },
  ];

  // Convert backend regions to card format
  const regions = backendRegions.map((region, idx) => {
    const defaultCard = defaultRegions[idx] || defaultRegions[0];
    return {
      name: region,
      description: defaultCard.description,
      importance: defaultCard.importance,
      color: defaultCard.color,
      borderColor: defaultCard.borderColor,
    };
  }).length > 0 ? backendRegions.map((region, idx) => {
    const defaultCard = defaultRegions[idx] || defaultRegions[0];
    return {
      name: region,
      description: defaultCard.description,
      importance: idx < 2 ? 'High' : 'Medium',
      color: defaultCard.color,
      borderColor: defaultCard.borderColor,
    };
  }) : defaultRegions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center space-x-2">
        <Eye size={24} className="text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Explainable Insights</h2>
      </div>

      {/* Debug Panel - Show if heatmapUrl is missing */}
      {!heatmapUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-4 text-yellow-300 text-sm space-y-2"
        >
          <div className="flex items-start space-x-2">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Heatmap Status:</p>
              <p className="text-xs mt-1">
                {explanation?.visualization_path ? 'Path found but URL failed to load' : 'No heatmap path in explanation'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass rounded-3xl p-8 border border-white/10 space-y-6"
      >
        {/* View Mode Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit flex-wrap">
          {[
            { id: 'comparison', label: 'Comparison View', icon: '⊕' },
            { id: 'original', label: 'Original', icon: '📷' },
            { id: 'heatmap', label: 'Heatmap', icon: '🔥' },
            { id: 'overlay', label: 'Overlay', icon: '🎯' },
          ].map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={
                viewMode === mode.id
                  ? { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
                  : { backgroundColor: 'transparent' }
              }
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                viewMode === mode.id
                  ? 'text-cyan-300 border border-cyan-400/50'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{mode.icon}</span>
              <span className="hidden sm:inline">{mode.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-b from-white/5 to-white/0 rounded-2xl p-6 border border-white/10 min-h-96">
          {/* Original Image */}
          {(viewMode === 'original' || viewMode === 'comparison') && imageUrl && (
            <motion.div
              key="original"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h4 className="text-white font-semibold text-sm">Original MRI</h4>
              <div className="rounded-xl overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-colors">
                <img
                  src={imageUrl}
                  alt="Original MRI"
                  className="w-full h-64 md:h-72 object-cover"
                  onError={(e) => console.error('Original image failed:', imageUrl)}
                />
              </div>
            </motion.div>
          )}

          {/* Heatmap */}
          {(viewMode === 'heatmap' || viewMode === 'comparison') && (
            <motion.div
              key="heatmap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h4 className="text-white font-semibold text-sm">Grad-CAM Heatmap</h4>
              <div className="rounded-xl overflow-hidden border border-white/20 hover:border-purple-400/50 transition-colors bg-gray-900 flex items-center justify-center min-h-64 md:min-h-72">
                {heatmapUrl ? (
                  <img
                    src={heatmapUrl}
                    alt="Grad-CAM Heatmap"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Heatmap failed to load:', heatmapUrl);
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML += '<div class="text-gray-400 text-sm">Heatmap failed to load</div>';
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    <p>No heatmap available</p>
                    <p className="text-xs mt-2">Check backend response</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Overlay View */}
          {viewMode === 'overlay' && imageUrl && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 col-span-1 md:col-span-2"
            >
              <h4 className="text-white font-semibold text-sm">Heatmap Overlay</h4>
              <div className="rounded-xl overflow-hidden border border-white/20 relative max-w-2xl mx-auto bg-gray-900 flex items-center justify-center min-h-72">
                <img
                  src={imageUrl}
                  alt="Original"
                  className="w-full h-72 object-cover"
                  onError={(e) => console.error('Original overlay image failed:', imageUrl)}
                />
                {heatmapUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={heatmapUrl}
                      alt="Heatmap Overlay"
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => {
                        console.error('Overlay heatmap failed:', heatmapUrl);
                        e.style.display = 'none';
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Heatmap Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-red-500/60" />
            <div>
              <p className="text-white font-medium text-sm">High Importance</p>
              <p className="text-gray-400 text-xs">Major age indicators</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-yellow-500/60" />
            <div>
              <p className="text-white font-medium text-sm">Medium Importance</p>
              <p className="text-gray-400 text-xs">Moderate influence</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded bg-blue-500/60" />
            <div>
              <p className="text-white font-medium text-sm">Low Importance</p>
              <p className="text-gray-400 text-xs">Minor contribution</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Key Regions - From Backend Data */}
      {regions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <HelpCircle size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Most Important Brain Regions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions.map((region, index) => (
              <motion.div
                key={region.name || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                onMouseEnter={() => setHoveredRegion(region.name)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`glass rounded-2xl p-4 border transition-all cursor-pointer ${region.borderColor} ${
                  hoveredRegion === region.name ? 'bg-purple-500/10 scale-105' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white text-sm">{region.name}</h4>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      region.importance === 'High'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {region.importance}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{region.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Debug Panel */}
      {showDebug && explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 rounded-2xl p-4 border border-white/10 overflow-auto max-h-96"
        >
          <p className="text-xs text-gray-400 mb-2">
            <strong>Backend Response (explanation):</strong>
          </p>
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(explanation, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Debug Toggle */}
      <motion.button
        onClick={() => setShowDebug(!showDebug)}
        whileHover={{ scale: 1.05 }}
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center space-x-1"
      >
        <span>{showDebug ? '▼' : '▶'}</span>
        <span>Debug Panel</span>
      </motion.button>
    </motion.div>
  );
}
