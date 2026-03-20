import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function Auth() {
  const location = useLocation();
  
  const [isSignup, setIsSignup] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') === 'signup';
  });
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    
    // DEBUG: Log URL changes
    console.log('🔍 AUTH URL:', location.search);
    console.log('🔍 Mode detected:', mode);
    
    if (mode === 'signup') {
      setIsSignup(true);
      console.log('✅ Switched to Sign Up');
    } else if (mode === 'signin' || mode === null) {
      setIsSignup(false);
      console.log('✅ Switched to Sign In');
    }
    
    window.scrollTo(0, 0);
  }, [location.search])

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden relative flex">
      {/* Background animated elements */}
      <div className="absolute inset-0 -z-10">
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
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-conic from-purple-500/30 to-cyan-500/20 rounded-full blur-3xl opacity-40"
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
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-conic from-cyan-500/30 to-blue-500/20 rounded-full blur-3xl opacity-40"
        />
      </div>

      {/* LEFT SIDE - BRANDING */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            N
          </div>
          <div>
            <div className="font-bold text-2xl text-white">NeuroAge</div>
            <div className="text-sm text-cyan-400">AI Research Platform</div>
          </div>
        </motion.div>

        {/* Main heading & subtext */}
        <div className="max-w-md space-y-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl font-bold mb-4"
            >
              <span className="text-gradient">
                Understand Your Brain with AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-gray-300 text-lg leading-relaxed"
            >
              Upload MRI scans and get brain age prediction, CNN vs ViT comparison, and explainable insights powered by advanced deep learning.
            </motion.p>
          </div>

          {/* Features list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            {[
              '🧠 Dual Model Analysis (CNN + Vision Transformer)',
              '💡 Explainable AI with Grad-CAM Heatmaps',
              '⚡ <200ms Prediction Time',
              '🔒 Research-Grade Security',
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-3 text-gray-200"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs text-gray-400 border-t border-white/10 pt-6"
        >
          ✓ This AI system is for research and educational purposes. Always consult medical professionals.
        </motion.p>
      </motion.div>

      {/* RIGHT SIDE - AUTH CARD */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="glass rounded-3xl p-8 md:p-10">
            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl border border-white/10">
              {[
                { label: 'Sign In', value: false },
                { label: 'Sign Up', value: true },
              ].map((tab) => (
                <motion.button
                  key={tab.label}
                  onClick={() => setIsSignup(tab.value)}
                  className="relative flex-1 py-3 font-semibold text-sm rounded-lg transition-colors duration-300"
                >
                  {isSignup === tab.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg border border-cyan-400/50"
                      transition={{ type: 'spring', bounce: 0.2 }}
                    />
                  )}
                  <span className={`relative z-10 block ${isSignup === tab.value ? 'text-cyan-300' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Form content with animation */}
            <motion.div
              key={isSignup ? 'signup' : 'login'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {!isSignup ? <LoginForm onSwitchToSignup={() => setIsSignup(true)} /> : <SignupForm onSwitchToSignin={() => setIsSignup(false)} />}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
