import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import SocialLogin from './SocialLogin';

export default function SignupForm({ onSwitchToSignin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2) newErrors.fullName = 'Name must be at least 2 characters';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!agreeToTerms) newErrors.terms = 'You must agree to terms';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
      setSubmitMessage('✓ Account created! Signing you in...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setSubmitMessage('✗ Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name Input */}
      <FormInput
        label="Full Name"
        type="text"
        name="fullName"
        placeholder="John Doe"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
        autoComplete="name"
        icon={User}
      />

      {/* Email Input */}
      <FormInput
        label="Email Address"
        type="email"
        name="email"
        placeholder="your@email.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        autoComplete="email"
        icon={Mail}
      />

      {/* Password Input */}
      <div>
        <FormInput
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          autoComplete="new-password"
          icon={Lock}
        />
        <p className="text-xs text-gray-500 mt-1">
          At least 8 characters with uppercase, lowercase, and numbers
        </p>
      </div>

      {/* Confirm Password Input */}
      <FormInput
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
        icon={Lock}
      />

      {/* Terms Checkbox */}
      <motion.label
        whileHover={{ scale: 1.01 }}
        className="flex items-start space-x-3 cursor-pointer group text-sm"
      >
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => {
            setAgreeToTerms(e.target.checked);
            setErrors((prev) => ({ ...prev, terms: '' }));
          }}
          className="w-4 h-4 mt-0.5 rounded border border-white/20 bg-white/5 cursor-pointer accent-cyan-400 transition-colors hover:border-cyan-400/50 flex-shrink-0"
        />
        <span className="text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
          I agree to the{' '}
          <motion.a
            href="#"
            whileHover={{ color: '#06b6d4' }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Terms of Service
          </motion.a>{' '}
          and{' '}
          <motion.a
            href="#"
            whileHover={{ color: '#06b6d4' }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Privacy Policy
          </motion.a>
        </span>
      </motion.label>

      {errors.terms && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 -mt-2"
        >
          {errors.terms}
        </motion.p>
      )}

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

      {/* Create Account Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: !isLoading ? 1.02 : 1 }}
        whileTap={{ scale: !isLoading ? 0.98 : 1 }}
        className="w-full btn-gradient flex items-center justify-center space-x-2 py-3 mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            <span>Create Account</span>
          </>
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
        Already have an account?{' '}
        <motion.span
          onClick={onSwitchToSignin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
        >
          Sign in
        </motion.span>
      </p>
    </form>
  );
}
