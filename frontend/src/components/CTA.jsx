import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-20">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-conic from-purple-500/30 to-cyan-500/20 rounded-full blur-3xl opacity-40"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-conic from-cyan-500/30 to-blue-500/20 rounded-full blur-3xl opacity-40"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass p-8 md:p-16 rounded-3xl text-center relative overflow-hidden group"
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 mb-6 bg-white/5 border border-white/20 rounded-full px-4 py-2"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Get Started Today</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Analyze Brain MRI
            <br />
            <span className="text-gradient">with Explainable AI?</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Join researchers and clinicians who are leveraging NeuroAge AI for advanced brain age analysis and medical insights.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate('/auth?mode=signup')}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)',
              }}
              whileTap={{ scale: 0.95 }}
              className="btn-gradient flex items-center space-x-3 group text-lg px-8 py-4"
            >
              <span>Create Free Account</span>
              <ArrowRight
                size={24}
                className="group-hover:translate-x-2 transition-transform duration-300"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-lg font-semibold text-white border border-white/20 transition-all duration-300 hover:border-cyan-400/50 text-lg"
            >
              Schedule Demo
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-gray-400 mb-6">Trusted by research institutions and medical centers</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['ISO 13485', 'HIPAA Ready', 'Academic Research', 'FDA Compliant'].map((badge, index) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2 text-sm text-gray-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                  <span>{badge}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
