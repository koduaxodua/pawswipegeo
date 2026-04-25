import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Plus, ChevronRight, SkipForward } from 'lucide-react';
import { useT, type TKey } from '@/contexts/Locale';

const TUTORIAL_KEY = 'pawswipe_tutorial_seen_v1';

interface Step {
  titleKey: TKey;
  descKey: TKey;
  visual: 'welcome' | 'swipe-right' | 'swipe-left' | 'add';
}

const steps: Step[] = [
  { titleKey: 'tutorial.s1.title', descKey: 'tutorial.s1.desc', visual: 'welcome' },
  { titleKey: 'tutorial.s2.title', descKey: 'tutorial.s2.desc', visual: 'swipe-right' },
  { titleKey: 'tutorial.s3.title', descKey: 'tutorial.s3.desc', visual: 'swipe-left' },
  { titleKey: 'tutorial.s4.title', descKey: 'tutorial.s4.desc', visual: 'add' },
];

export function Tutorial() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(TUTORIAL_KEY)) {
      const t = setTimeout(() => setOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else close();
  };

  if (!open) return null;
  const current = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center px-6"
      >
        {/* Skip */}
        <button
          onClick={close}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm px-3 py-1.5 rounded-full transition"
        >
          {t('tutorial.skip')}
          <SkipForward className="h-4 w-4" />
        </button>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          {/* Visual */}
          <div className="mb-8 h-64 w-full flex items-center justify-center">
            <Visual variant={current.visual} />
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : i < step ? 'w-1.5 bg-primary/60' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">{t(current.titleKey)}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">{t(current.descKey)}</p>

          <button
            onClick={next}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98]"
          >
            {step === steps.length - 1 ? t('tutorial.start') : t('tutorial.next')}
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Visual({ variant }: { variant: Step['visual'] }) {
  const t = useT();
  if (variant === 'welcome') {
    return (
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl"
      >
        🐶🐱
      </motion.div>
    );
  }

  if (variant === 'swipe-right') {
    return (
      <div className="relative w-44 h-56">
        <motion.div
          animate={{ x: [0, 80, 80, 0], rotate: [0, 12, 12, 0], opacity: [1, 1, 0, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.5, 0.7, 1], ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-xl flex flex-col items-center justify-center gap-3"
        >
          <div className="text-5xl">🐶</div>
          <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border-2 border-green-500">
            {t('card.like')}
          </div>
        </motion.div>
        <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
          <Heart className="h-6 w-6 text-accent" fill="currentColor" />
        </div>
      </div>
    );
  }

  if (variant === 'swipe-left') {
    return (
      <div className="relative w-44 h-56">
        <motion.div
          animate={{ x: [0, -80, -80, 0], rotate: [0, -12, -12, 0], opacity: [1, 1, 0, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.5, 0.7, 1], ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-xl flex flex-col items-center justify-center gap-3"
        >
          <div className="text-5xl">🐱</div>
          <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border-2 border-red-500">
            {t('card.nope')}
          </div>
        </motion.div>
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
          <X className="h-6 w-6 text-destructive" />
        </div>
      </div>
    );
  }

  // 'add'
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"
      >
        <Plus className="h-10 w-10 text-primary-foreground" />
      </motion.div>
      <div className="text-xs text-muted-foreground">
        {t('nav.add')} ↓
      </div>
    </div>
  );
}
