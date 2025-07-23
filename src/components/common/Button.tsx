import type { ButtonProps } from '@/types';
import styles from './Button.module.css';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick,
  type = 'button',
}) => {
  const className = [styles.button, styles[variant], styles[size], disabled && styles.disabled]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
