import type { CheckboxProps } from '@/types';
import styles from './Checkbox.module.css';

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.input}
      />
      <label htmlFor={id} className={styles.label}>
        <span className={styles.checkmark}>
          {checked && (
            <svg
              className={styles.checkIcon}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 4.5L6 12L2.5 8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.labelText}>{label}</span>
      </label>
    </div>
  );
};
