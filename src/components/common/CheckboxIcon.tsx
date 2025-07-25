import styles from './CheckboxIcon.module.css';

interface CheckboxIconProps {
  checked: boolean;
  label: string;
}

export const CheckboxIcon: React.FC<CheckboxIconProps> = ({ checked, label }) => {
  return (
    <div className={styles.checkboxIcon}>
      <div className={`${styles.checkboxBox} ${checked ? styles.checked : ''}`}>
        {checked && (
          // biome-ignore lint/a11y/noSvgWithoutTitle: ignore
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={styles.checkboxLabel}>{label}</span>
    </div>
  );
};
