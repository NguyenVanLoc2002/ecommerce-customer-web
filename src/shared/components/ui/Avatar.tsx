type AvatarProps = {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'xl';
};

const sizeClasses = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  xl: 'h-24 w-24 text-2xl',
} as const;

const sizeDimensions = { sm: 40, md: 48, xl: 96 } as const;

export const Avatar = ({ name, size = 'md', src }: AvatarProps) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  if (src) {
    return <img alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} height={sizeDimensions[size]} loading="lazy" src={src} width={sizeDimensions[size]} />;
  }

  return (
    <span
      aria-label={name}
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded-full bg-brand-subtle font-semibold text-brand-primary`}
      role="img"
    >
      {initials}
    </span>
  );
};
