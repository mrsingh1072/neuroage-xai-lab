import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';



export default function FormInput({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  autoComplete,
  disabled,
  icon: Icon,
  name,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Focus glow effect background */}
        <motion.div
          animate={{
            opacity: isFocused ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-xl blur-lg pointer-events-none"
        />

        {/* Input container with icon */}
        <div className="relative">
          {/* Icon - left side */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Icon size={20} className={isFocused ? 'text-cyan-400' : 'text-cyan-400/60'} />
            </div>
          )}

          {/* Input field */}
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`
              w-full py-3 rounded-xl text-white placeholder-gray-400
              border transition-all duration-300
              bg-white/8 backdrop-blur-md
              focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-12 pr-4' : 'px-4'}
              ${
                isPassword ? 'pr-12' : ''
              }
              ${
                error
                  ? 'border-red-500/50 focus:border-red-400/80 focus:ring-2 focus:ring-red-400/50 focus:bg-white/10'
                  : isFocused
                  ? 'border-cyan-400/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:bg-white/10'
                  : 'border-white/15 hover:border-white/25'
              }
            `}
          />

          {/* Password toggle button - right side */}
          {isPassword && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors z-10"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xs text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
