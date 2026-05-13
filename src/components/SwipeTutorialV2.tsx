import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Map, X } from 'lucide-react';

const TUTORIAL_KEY = 'pawswipe_tutorial_seen_v2';

export function SwipeTutorialV2() {
  const [open, setOpen] = useState(() =>
    typeof window !== 'undefined' && !localStorage.getItem(TUTORIAL_KEY)
  );

  const close = () => {
    localStorage.setItem(TUTORIAL_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/75 px-5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={close}
    >
      <div className="flex h-full items-center justify-center">
        <motion.div
          className="max-w-sm rounded-3xl border border-white/15 bg-background/90 p-5 text-center shadow-2xl"
          initial={{ y: 20, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          onPointerDown={event => event.stopPropagation()}
        >
          <h2 className="text-xl font-bold">გადასვი ან გამოიყენე ღილაკები</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            მარჯვნივ მოწონებაა, მარცხნივ გამოტოვება, რუკა კი ცხოველის მიახლოებით ადგილს გაჩვენებს.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-secondary p-3">
              <X className="mx-auto mb-1 h-5 w-5 text-destructive" />
              გამოტოვება
            </div>
            <div className="rounded-2xl bg-secondary p-3">
              <Map className="mx-auto mb-1 h-5 w-5 text-primary" />
              რუკა
            </div>
            <div className="rounded-2xl bg-secondary p-3">
              <Heart className="mx-auto mb-1 h-5 w-5 text-accent" fill="currentColor" />
              მოწონება
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="mt-5 h-11 w-full rounded-full bg-primary font-semibold text-primary-foreground"
          >
            გასაგებია
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
