interface PauseIconProps {
  className?: string;
  size?: number;
}

export const PauseIcon: React.FC<PauseIconProps> = ({ className, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);