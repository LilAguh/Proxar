import { useState, ChangeEvent } from 'react';
import './Select.scss';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Select = ({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  error,
  className = '',
}: SelectProps) => {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`select-wrapper ${className}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-label__required">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={`select ${focused ? 'select--focused' : ''} ${error ? 'select--error' : ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
};