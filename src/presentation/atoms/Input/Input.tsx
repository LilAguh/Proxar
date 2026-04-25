import './Input.scss';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string; // ← NUEVO
  fullWidth?: boolean;
}

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error, // ← NUEVO
  fullWidth,
}: InputProps) => {
  return (
    <div className={`input ${fullWidth ? 'input--full-width' : ''} ${error ? 'input--error' : ''}`}>
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input__field"
      />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
};