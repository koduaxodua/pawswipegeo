import { Heart, Map, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CardFooterActionsProps {
  disabled?: boolean;
  onLike: () => void;
  onMap: () => void;
  onNope: () => void;
  labels: {
    like: string;
    map: string;
    nope: string;
  };
}

export function CardFooterActions({ disabled, onLike, onMap, onNope, labels }: CardFooterActionsProps) {
  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      <motion.div whileTap={{ scale: 0.94 }}>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={onNope}
          className="h-14 w-full rounded-2xl border-destructive/30 text-destructive"
          aria-label={labels.nope}
        >
          <X className="h-6 w-6" />
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.94 }}>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={onMap}
          className="h-14 w-full rounded-2xl"
          aria-label={labels.map}
        >
          <Map className="h-6 w-6 text-primary" />
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.94 }}>
        <Button
          type="button"
          disabled={disabled}
          onClick={onLike}
          className="h-14 w-full rounded-2xl bg-accent text-accent-foreground"
          aria-label={labels.like}
        >
          <Heart className="h-6 w-6" fill="currentColor" />
        </Button>
      </motion.div>
    </div>
  );
}
