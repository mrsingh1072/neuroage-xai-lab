import { motion } from 'framer-motion';
import { Upload, Wand2, BarChart3, Lightbulb } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Upload MRI',
    description: 'Simply upload your brain MRI scan in standard medical imaging formats (NIFTI, DICOM)',
    icon: Upload,
    color: 'from-cyan-400 to-blue-500',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our CNN and Vision Transformer models process the MRI with automated preprocessing',
    icon: Wand2,
    color: 'from-purple-400 to-pink-500',
  },
  {
    number: '03',
    title: 'Get Prediction',
    description: 'Receive accurate brain age prediction with confidence metrics from both models',
    icon: BarChart3,
    color: 'from-amber-400 to-orange-500',
  },
  {
    number: '04',
    title: 'View Heatmap',
    description: 'Explore Grad-CAM visual explanations showing which brain regions influenced the prediction',
    icon: Lightbulb,
    color: 'from-emerald-400 to-teal-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7 },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden">
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
            className="absolute top-1/4 right-1/3 w-96 h-96 bg-gradient-conic from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl opacity-20"
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
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-gray-400 text-lg">Simple 4-step process to analyze brain MRI with AI</p>
        </motion.div>

        {/* Desktop View - Vertical Timeline */}
        <div className="hidden md:block">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEvenIndex = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className={`flex items-center ${isEvenIndex ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Left Content */}
                    <div className="flex-1">
                      <motion.div
                        whileHover={{ x: isEvenIndex ? 20 : -20 }}
                        className="glass-hover p-8 rounded-2xl relative group"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl -z-10`} />
                        <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-400 leading-relaxed">{step.description}</p>
                      </motion.div>
                    </div>

                    {/* Center Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0 mx-8 relative z-10"
                    >
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center ring-4 ring-slate-900 shadow-2xl`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <div className="absolute -top-6 -left-6 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-900">
                        {step.number}
                      </div>
                    </motion.div>

                    {/* Right Content - Empty for alternation */}
                    <div className="flex-1" />
                  </div>

                  {/* Connector line */}
                  {index !== steps.length - 1 && (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: 96 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      viewport={{ once: true }}
                      className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent mt-12`}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile View - Vertical Stack */}
        <div className="md:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Content Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-hover p-6 rounded-2xl relative group ml-16"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl -z-10`} />
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute -left-6 top-0 flex-shrink-0 relative z-10"
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center ring-4 ring-slate-900 shadow-xl`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-slate-900">
                      {index + 1}
                    </div>
                  </motion.div>

                  {/* Connector */}
                  {index !== steps.length - 1 && (
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: 70 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="absolute left-0 top-full w-0.5 h-16 bg-gradient-to-b from-cyan-500 to-transparent ml-6"
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
