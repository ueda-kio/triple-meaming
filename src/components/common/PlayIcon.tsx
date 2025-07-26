interface PlayIconProps {
  className?: string;
  size?: number;
}

export const PlayIcon: React.FC<PlayIconProps> = ({ className, size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);