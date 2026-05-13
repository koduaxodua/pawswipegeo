import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ADMIN_TAP_COUNT = 10;
const ADMIN_TAP_WINDOW_MS = 4000;

export function TopLeftBrand() {
  const navigate = useNavigate();
  const tapTimesRef = useRef<number[]>([]);

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const now = Date.now();
    tapTimesRef.current = [
      ...tapTimesRef.current.filter(tapTime => now - tapTime <= ADMIN_TAP_WINDOW_MS),
      now,
    ];

    if (tapTimesRef.current.length >= ADMIN_TAP_COUNT) {
      event.preventDefault();
      tapTimesRef.current = [];
      navigate('/admin-login');
    }
  };

  return (
    <div className="fixed left-3 top-5 z-30 safe-area-top pointer-events-none sm:top-4">
      <Link
        to="/app"
        onClick={handleBrandClick}
        className="pointer-events-auto block rounded-2xl bg-background/45 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
        aria-label="mipove.me home"
      >
        <img
          src="/brand/logo-dark.png"
          alt="mipove.me"
          className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12"
          draggable={false}
        />
      </Link>
    </div>
  );
}
