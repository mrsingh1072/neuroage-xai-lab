import { motion } from 'framer-motion';
import { Brain, Columns3, Lightbulb, Cog } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Brain Age Prediction',
    description: 'Deep learning using CNN to accurately predict brain age from MRI scans',
    gradient: 'from-cyan-400 to-blue-500',
    highlight: 'text-cyan-400',
  },
  {
    icon: Columns3,
    title: 'Model Comparison',
    description: 'Compare CNN vs Vision Transformer outputs side-by-side'
    + ' to understand model behavior',
    gradient: 'from-purple-400 to-pink-500',
    highlight: 'text-purple-400',
  },
  {
    icon: Lightbulb,
    title: 'Explainable AI',
    description: 'Grad-CAM heatmaps visualize which brain regions the model focuses on',
    gradient: 'from-amber-400 to-orange-500',
    highlight: 'text-amber-400',
  },
  {
    icon: Cog,
    title: 'Automated Pipeline',
    description: 'Full MRI preprocessing, inference, and explanation generation in one click',
    gradient: 'from-emerald-400 to-teal-500',
    highlight: 'text-emerald-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-conic from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-full blur-3xl opacity-20"
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
            <span className="text-gradient">Powerful Features</span>
          </h2>
          <p className="text-gray-400 text-lg">Everything you need for comprehensive brain MRI analysis</p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="glass-hover p-8 h-full rounded-2xl relative overflow-hidden">
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10`}
                  />

                  {/* Icon with animated background */}
                  <div className="mb-6 relative inline-block">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.3,
                      }}
                      className={`absolute -inset-4 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`}
                    />
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                      <Icon size={32} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                    style={{
                      backgroundImage: `linear-gradient(135deg, var(--color1), var(--color2))`,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-6">{feature.description}</p>

                  {/* Bottom accent bar */}
                  <div className="relative pt-4 border-t border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                      viewport={{ once: true }}
                      className={`h-0.5 bg-gradient-to-r ${feature.gradient}`}
                    />
                  </div>

                  {/* Arrow on hover */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 text-white"
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      className={`group-hover:stroke-current transition-colors duration-300`}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-16"
        />
      </div>
    </section>
  );
}
