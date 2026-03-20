import { motion } from 'framer-motion';
import { Upload, Zap, BarChart3, Lightbulb } from 'lucide-react';

const stages = [
  { label: 'Upload', icon: Upload, number: '01' },
  { label: 'Preprocess', icon: Zap, number: '02' },
  { label: 'Predict', icon: BarChart3, number: '03' },
  { label: 'Explain', icon: Lightbulb, number: '04' },
];

export default function LivePreview() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Live Preview</span>
          </h2>
          <p className="text-gray-400 text-lg">See how NeuroAge AI analyzes brain MRI in real-time</p>
        </motion.div>

        {/* Main Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass p-8 md:p-12 mb-12 relative overflow-hidden"
        >
          {/* Gradient background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          {/* Demo Content */}
          <div className="relative z-10">
            {/* Top Row - Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-hover p-6"
              >
                <div className="text-sm text-gray-400 mb-3">Predicted Age</div>
                <div className="text-4xl font-bold text-gradient">21.4</div>
                <div className="text-xs text-gray-500 mt-2">years old</div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="glass-hover p-6"
              >
                <div className="text-sm text-gray-400 mb-3">CNN Confidence</div>
                <div className="text-lg font-bold text-cyan-400 mb-2">High</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: '95%' }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="glass-hover p-6"
              >
                <div className="text-sm text-gray-400 mb-3">ViT Confidence</div>
                <div className="text-lg font-bold text-amber-400 mb-2">Medium</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: 0 }}
                    whileInView={{ width: '75%' }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Model Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-hover p-6 border-l-2 border-cyan-400"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">CNN Model</h3>
                    <p className="text-sm text-gray-400 mt-1">Convolutional Neural Network</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/50">
                    <span className="text-xs text-emerald-300">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-cyan-400 font-bold">95.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Inference Time</span>
                    <span className="text-cyan-400 font-bold">142ms</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="glass-hover p-6 border-l-2 border-purple-400"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">ViT Model</h3>
                    <p className="text-sm text-gray-400 mt-1">Vision Transformer</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-400/50">
                    <span className="text-xs text-emerald-300">Active</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accuracy</span>
                    <span className="text-purple-400 font-bold">92.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Inference Time</span>
                    <span className="text-purple-400 font-bold">178ms</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Explainability Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Grad-CAM Heatmap Explanation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Original MRI</span>
                  </div>
                </div>
                <div className="relative aspect-square bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl overflow-hidden border border-purple-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Heatmap</span>
                  </div>
                </div>
                <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-cyan-500/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm text-gray-500">Overlay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pipeline Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="glass p-8"
        >
          <h3 className="text-lg font-bold text-white mb-8 text-center">Analysis Pipeline</h3>

          {/* Desktop Pipeline */}
          <div className="hidden md:flex items-center justify-between">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isLast = index === stages.length - 1;

              return (
                <div key={stage.label} className="flex items-center flex-1">
                  {/* Stage */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex flex-col items-center w-32"
                  >
                    <motion.div
                      whileInView={{ scale: [0, 1], rotate: 360 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border-2 border-cyan-400/50 flex items-center justify-center mb-3 relative"
                    >
                      <Icon className="text-cyan-400" size={24} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {stage.number}
                      </div>
                    </motion.div>
                    <div className="text-sm font-semibold text-white text-center">{stage.label}</div>
                  </motion.div>

                  {/* Arrow */}
                  {!isLast && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: (index + 0.5) * 0.1 }}
                      viewport={{ once: true }}
                      className="flex-1 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-transparent mx-4 origin-left"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Pipeline */}
          <div className="md:hidden space-y-6">
            {stages.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border border-cyan-400/50 flex items-center justify-center flex-shrink-0 relative">
                    <Icon className="text-cyan-400" size={20} />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {stage.number}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white">{stage.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
