import { useState, ChangeEvent } from 'react';
import './Textarea.scss';

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  error?: string;
  className?: string;
}

export const Textarea = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  error,
  className = '',
}: TextareaProps) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && (
        <label className="textarea-label">
          {label}
          {required && <span className="textarea-label__required">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`textarea ${focused ? 'textarea--focused' : ''} ${error ? 'textarea--error' : ''}`}
      />
      {error && <span className="textarea-error">{error}</span>}
    </div>
  );
};
