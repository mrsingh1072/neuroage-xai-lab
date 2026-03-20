import { motion } from 'framer-motion';
import { Zap, BarChart3, Code2, Eye } from 'lucide-react';

const stats = [
  {
    icon: Zap,
    value: '<200ms',
    label: 'Prediction Time',
    description: 'Lightning-fast inference for real-time analysis',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    icon: BarChart3,
    value: '95%+',
    label: 'Model Accuracy',
    description: 'State-of-the-art precision on brain age datasets',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Code2,
    value: '2X',
    label: 'Model Comparison',
    description: 'CNN and Vision Transformers side-by-side',
    color: 'from-emerald-400 to-cyan-500',
  },
  {
    icon: Eye,
    value: '100%',
    label: 'Explainable AI',
    description: 'Grad-CAM heatmaps show exactly what the model sees',
    color: 'from-amber-400 to-orange-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Stats() {
  return (
    <section id="results" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-conic from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl opacity-20"
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Powerful Performance</span>
          </h2>
          <p className="text-gray-400 text-lg">Industry-leading accuracy and speed for brain MRI analysis</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative glass p-8 rounded-2xl overflow-hidden"
              >
                {/* Gradient background glow on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`}
                />

                {/* Icon with glow */}
                <div className="relative mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20 + index * 5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} opacity-20 absolute -inset-2`}
                  />
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center relative`}>
                    <Icon size={28} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{stat.label}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{stat.description}</p>
                </div>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ width: '0%' }}>
                  <motion.div
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
