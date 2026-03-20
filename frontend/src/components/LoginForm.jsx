import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import SocialLogin from './SocialLogin';

export default function LoginForm({ onSwitchToSignup }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitMessage('✓ Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setSubmitMessage('✗ Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Input */}
      <FormInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors({ ...errors, email: '' });
        }}
        error={errors.email}
        required
        autoComplete="email"
        icon={Mail}
      />

      {/* Password Input */}
      <FormInput
        label="Password"
        type="password"
        name="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors({ ...errors, password: '' });
        }}
        error={errors.password}
        required
        autoComplete="current-password"
        icon={Lock}
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <motion.label
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border border-white/20 bg-white/5 cursor-pointer accent-cyan-400 transition-colors hover:border-cyan-400/50"
          />
          <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
            Remember me
          </span>
        </motion.label>

        <motion.a
          href="#"
          whileHover={{ color: '#06b6d4' }}
          className="text-gray-400 hover:text-cyan-400 transition-colors"
        >
          Forgot password?
        </motion.a>
      </div>

      {/* Submit Message */}
      {submitMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm text-center py-2 rounded-lg ${
            submitMessage.includes('✓')
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {submitMessage}
        </motion.div>
      )}

      {/* Sign In Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: !isLoading ? 1.02 : 1 }}
        whileTap={{ scale: !isLoading ? 0.98 : 1 }}
        className="w-full btn-gradient flex items-center justify-center space-x-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </motion.button>

      {/* Divider */}
      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-white/10" />
        <span className="px-3 text-xs text-gray-400">or continue with</span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      {/* Social Login */}
      <SocialLogin />

      {/* Footer */}
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <motion.span
          onClick={onSwitchToSignup}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
        >
          Create one
        </motion.span>
      </p>
    </form>
  );
}
