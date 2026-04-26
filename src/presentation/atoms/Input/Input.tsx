import { useState } from 'react';
import './Input.scss';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'datetime-local';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  icon?: React.ReactNode;
}

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required,
  disabled,
  error,
  hint,
  fullWidth,
  autoComplete,
  min,
  max,
  step,
  icon,
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`
      input 
      ${fullWidth ? 'input--full-width' : ''} 
      ${error ? 'input--error' : ''}
      ${isFocused ? 'input--focused' : ''}
      ${disabled ? 'input--disabled' : ''}
      ${value ? 'input--has-value' : ''}
    `.trim()}>
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className="input__wrapper">
        {icon && <span className="input__icon">{icon}</span>}
        
        <input
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="input__field"
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
        />

        {type === 'password' && (
          <button
            type="button"
            className="input__toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>

      {error && <span className="input__error">⚠️ {error}</span>}
      {hint && !error && <span className="input__hint">{hint}</span>}
    </div>
  );
};