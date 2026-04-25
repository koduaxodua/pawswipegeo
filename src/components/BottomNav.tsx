import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, PawPrint, Plus, FileText, Trophy } from 'lucide-react';
import { useAdminMode } from '@/contexts/AdminMode';

const navItems = [
  { path: '/', icon: PawPrint, label: 'სვაიპი' },
  { path: '/favorites', icon: Heart, label: 'მოწონებული' },
  { path: '/add', icon: Plus, label: 'დამატება' },
  { path: '/missions', icon: Trophy, label: 'მისიები' },
  { path: '/terms', icon: FileText, label: 'პირობები' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerTermsTap } = useAdminMode();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const handleClick = () => {
            if (item.path === '/terms') {
              registerTermsTap();
            }
            navigate(item.path);
          };
          return (
            <button
              key={item.path}
              onClick={handleClick}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary scale-110'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
