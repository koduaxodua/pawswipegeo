import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
}

export function Logo({ className, showWordmark = false, variant = 'dark' }: LogoProps) {
  const src = variant === 'dark' ? '/brand/logo-dark.png' : '/brand/logo-light.jpg';
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={src}
        alt="Pet Rescue Georgia"
        className="h-9 w-9 rounded-lg object-cover"
        draggable={false}
      />
      {showWordmark && (
        <span className="text-base font-bold tracking-tight text-foreground">
          Pet Rescue Georgia
        </span>
      )}
    </div>
  );
}
