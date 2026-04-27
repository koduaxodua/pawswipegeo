import { useState } from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';

/**
 * Fixed top-right bar — visible on every page.
 * Contains the KODUA logo (link) and the EN/KA language toggle stacked vertically.
 */
export function TopRightLogo() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="fixed top-4 right-3 z-30 flex flex-col items-end gap-1.5 safe-area-top pointer-events-none">
      {!imgFailed && (
        <a
          href="https://www.instagram.com/1kodua/"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto"
          aria-label="KODUA on Instagram (@1kodua)"
        >
          <img
            src="/brand/kodua.jpg"
            alt="KODUA"
            onError={() => setImgFailed(true)}
            className="h-5 w-auto max-w-[80px] object-contain opacity-80 hover:opacity-100 transition-opacity drop-shadow-md"
            draggable={false}
          />
        </a>
      )}
      <div className="pointer-events-auto">
        <LanguageToggle />
      </div>
    </div>
  );
}
