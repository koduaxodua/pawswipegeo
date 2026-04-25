import { useState } from 'react';

export function TopRightLogo() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  return (
    <a
      href="https://github.com/koduaxodua"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-3 right-3 z-30 group"
      aria-label="Made by KODUA"
    >
      <img
        src="/brand/kodua.jpg"
        alt="KODUA"
        onError={() => setHidden(true)}
        className="h-8 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-md"
        draggable={false}
      />
    </a>
  );
}
