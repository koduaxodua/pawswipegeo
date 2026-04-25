import { motion } from 'framer-motion';
import { Sparkles, Trophy, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Missions() {
  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary-foreground">მისიები</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col items-center justify-center text-center px-2 -mt-8"
      >
        <div className="glass-strong rounded-[2rem] p-8 sm:p-10 max-w-md w-full relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent/20 blur-3xl" />

          <div className="relative flex flex-col items-center">
            <Badge variant="secondary" className="mb-5 border-primary/30 bg-primary/15 text-primary">
              <Wrench className="mr-1.5 h-3 w-3" />
              შემუშავება მიმდინარეობს
            </Badge>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30"
            >
              <Trophy className="h-10 w-10 text-primary" strokeWidth={1.75} />
            </motion.div>

            <h2 className="text-lg sm:text-xl font-semibold text-primary-foreground leading-snug mb-3">
              მისიების კატეგორია შემუშავების პროცესშია
            </h2>
            <p className="text-sm text-primary-foreground/65 leading-relaxed max-w-[28ch]">
              ჩელენჯები, XP და ლიდერბორდი მალე დაემატება. სვაიპი და მოწონებულები უკვე მუშაობს — მონაცემები ინახება მხოლოდ შენს მოწყობილობაზე.
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-primary-foreground/50">
              <Sparkles className="h-3.5 w-3.5 text-primary/80" />
              <span>მალე დაგიბრუნდები აქ</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
