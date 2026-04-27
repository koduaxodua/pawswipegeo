import { motion } from 'framer-motion';
import { Sparkles, Trophy, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/contexts/Locale';

export default function Missions() {
  const t = useT();
  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('missions.title')}</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center text-center px-2 -mt-8"
      >
        <div className="glass-strong rounded-3xl p-8 sm:p-10 max-w-md w-full relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <Badge variant="secondary" className="mb-5 border-primary/30 bg-primary/15 text-primary">
              <Wrench className="mr-1.5 h-3 w-3" />
              {t('missions.soon.badge')}
            </Badge>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30"
            >
              <Trophy className="h-10 w-10 text-primary" strokeWidth={1.75} />
            </motion.div>

            <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-snug mb-3">
              {t('missions.soon.badge')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[28ch]">
              {t('missions.soon.text')}
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary/80" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
