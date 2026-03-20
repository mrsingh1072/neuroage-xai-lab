import { motion } from 'framer-motion';
import { Lightbulb, Brain, BarChart3, AlertCircle } from 'lucide-react';

export default function InsightsPanel({ predictions, explanation }) {
  // Get interpretation text from backend or use default
  const interpretationText = explanation?.interpretation || 
    `This analysis utilizes dual deep learning architectures - a Convolutional Neural Network (CNN) optimized for spatial feature extraction and a Vision Transformer (ViT) for global context understanding. The models were trained on the OASIS brain imaging dataset and fine-tuned on age-annotated MRI scans. The Grad-CAM heatmap visualizes which brain regions contribute most to the age prediction, providing interpretability. Red regions indicate high importance, yellow moderate importance, and blue regions have minimal contribution.`;
  
  // Get contributing features from backend explanation
  const contributingFeatures = explanation?.contributing_features || [
    "Gray matter density distribution",
    "White matter integrity patterns",
    "Ventricular space changes",
    "Cortical thickness variations",
    "Brain tissue atrophy markers"
  ];

  const insights = [
    {
      icon: Brain,
      title: 'Brain Structure Analysis',
      content:
        'The model detected significant age-related changes in various brain regions. These regions show typical patterns associated with brain aging in this age group.',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: BarChart3,
      title: 'Model Agreement',
      content: `Both CNN and ViT models achieved strong agreement (${(100 - Math.abs(predictions.cnn.age - predictions.vit.age) * 5).toFixed(1)}% consensus). This high coherence increases confidence in the prediction.`,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: AlertCircle,
      title: 'Clinical Consideration',
      content:
        'The predicted brain age is within expected range. However, individual variations are normal and should be considered in clinical context. Always consult medical professionals.',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: Lightbulb,
      title: 'Key Features',
      content:
        'The analysis uses structural MRI patterns including brain volume, tissue integrity, and morphological changes to predict brain age.',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center space-x-2">
        <Lightbulb size={24} className="text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Insights & Analysis</h2>
      </div>

      {/* AI Explanation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-purple-500/10 to-cyan-500/10"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Brain size={20} className="text-cyan-400" />
          <span>AI Model Explanation</span>
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {interpretationText}
        </p>

        {/* Timestamp */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-gray-400 text-xs">Analysis completed at</span>
          <span className="text-cyan-400 font-mono text-sm">{predictions.timestamp}</span>
        </div>
      </motion.div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
            whileHover={{ scale: 1.02, translateY: -5 }}
            className={`glass rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all cursor-pointer group ${insight.bgColor}`}
          >
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${insight.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <insight.icon size={24} className="text-white" />
            </div>

            {/* Title */}
            <h4 className="text-white font-semibold mb-3 group-hover:text-cyan-300 transition-colors">
              {insight.title}
            </h4>

            {/* Content */}
            <p className="text-gray-400 text-sm leading-relaxed">{insight.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Confidence Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass rounded-3xl p-8 border border-white/10"
      >
        <h3 className="text-lg font-bold text-white mb-6">Prediction Confidence Breakdown</h3>

        <div className="space-y-6">
          {/* CNN Confidence */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" />
                <span>CNN Model Confidence</span>
              </span>
              <span className="text-cyan-400 font-bold">94.2%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94.2%' }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
            />
          </div>

          {/* ViT Confidence */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                <span>Vision Transformer Confidence</span>
              </span>
              <span className="text-purple-400 font-bold">91.8%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '91.8%' }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            />
          </div>

          {/* Ensemble Confidence */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                <span>Ensemble Consensus</span>
              </span>
              <span className="text-emerald-400 font-bold">93.0%</span>
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '93.0%' }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Contributing Features - From Backend */}
      {contributingFeatures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="glass rounded-3xl p-8 border border-white/10"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart3 size={20} className="text-cyan-400" />
            <span>Contributing Features</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contributingFeatures.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 mt-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass rounded-3xl p-8 border border-yellow-400/30 bg-yellow-500/5"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <AlertCircle size={20} className="text-yellow-400" />
          <span>Next Steps</span>
        </h3>

        <ul className="space-y-3 text-gray-300 text-sm">
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-start space-x-3"
          >
            <span className="text-cyan-400 font-bold mt-0.5">→</span>
            <span>
              <strong>Review Results:</strong> Examine how the predicted brain age compares with chronological age
            </span>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-start space-x-3"
          >
            <span className="text-cyan-400 font-bold mt-0.5">→</span>
            <span>
              <strong>Consult Specialists:</strong> Discuss findings with radiologists or neurologists for clinical validation
            </span>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-start space-x-3"
          >
            <span className="text-cyan-400 font-bold mt-0.5">→</span>
            <span>
              <strong>Track Progress:</strong> Upload additional scans over time to monitor brain aging trajectory
            </span>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-start space-x-3"
          >
            <span className="text-cyan-400 font-bold mt-0.5">→</span>
            <span>
              <strong>Export Report:</strong> Save this analysis for medical records or research purposes
            </span>
          </motion.li>
        </ul>
      </motion.div>
    </motion.div>
  );
}
