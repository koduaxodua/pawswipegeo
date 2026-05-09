import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, PawPrint, Plus, FileText, Trophy } from 'lucide-react';
import { useT, type TKey } from '@/contexts/Locale';

const navItems: { path: string; icon: typeof PawPrint; labelKey: TKey }[] = [
  { path: '/', icon: PawPrint, labelKey: 'nav.swipe' },
  { path: '/favorites', icon: Heart, labelKey: 'nav.favorites' },
  { path: '/add', icon: Plus, labelKey: 'nav.add' },
  { path: '/missions', icon: Trophy, labelKey: 'nav.missions' },
  { path: '/terms', icon: FileText, labelKey: 'nav.terms' },
];

export function BottomNav() {
  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();
  const isPrivacyPage = location.pathname === '/ka/privacy';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-area-bottom">
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-2 border-b border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span className="truncate">{t('footer.copyright')}</span>
        <div className="flex items-center gap-2">
          <Link to="/terms" className="underline-offset-2 hover:text-foreground hover:underline">
            {t('footer.terms')}
          </Link>
          {!isPrivacyPage && (
            <Link to="/ka/privacy" className="underline-offset-2 hover:text-foreground hover:underline">
              {t('footer.privacy')}
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center justify-around max-w-lg mx-auto h-[58px] px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const handleClick = () => {
            navigate(item.path);
          };
          return (
            <button
              key={item.path}
              onClick={handleClick}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-11 min-w-11 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
