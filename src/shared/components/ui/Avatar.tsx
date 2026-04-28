type AvatarProps = {
  name: string;
  src?: string;
  size?: 'sm' | 'md';
};

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
} as const;

export const Avatar = ({ name, size = 'md', src }: AvatarProps) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return <img alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} height={48} src={src} width={48} />;
  }

  return (
    <span
      aria-label={name}
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-brand-subtle font-semibold text-brand-primary`}
    >
      {initials}
    </span>
  );
};

