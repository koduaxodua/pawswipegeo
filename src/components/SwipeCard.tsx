import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { Dog } from '@/data/dogs';
import { MapPin } from 'lucide-react';
import { DogDetailSheet } from './DogDetailSheet';

interface SwipeCardProps {
  dog: Dog;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export function SwipeCard({ dog, onSwipe, isTop }: SwipeCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <>
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
        onClick={() => isTop && setShowDetail(true)}
      >
        <div className="relative h-full w-full overflow-hidden rounded-3xl glass-strong">
          <img
            src={dog.photo}
            alt={dog.name}
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Like/Nope indicators */}
          {isTop && (
            <>
              <motion.div
                className="absolute top-8 right-8 rounded-xl border-4 border-green-500 px-4 py-2 rotate-12"
                style={{ opacity: likeOpacity }}
              >
                <span className="text-3xl font-bold text-green-500">მომწონს ❤️</span>
              </motion.div>
              <motion.div
                className="absolute top-8 left-8 rounded-xl border-4 border-red-400 px-4 py-2 -rotate-12"
                style={{ opacity: nopeOpacity }}
              >
                <span className="text-3xl font-bold text-red-400">შემდეგი ✕</span>
              </motion.div>
            </>
          )}

          {/* Dog info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white">{dog.name}, <span className="text-2xl font-normal">{dog.age}</span></h2>
            <p className="text-white/80 text-lg mt-1">{dog.breed}</p>
            <div className="flex items-center gap-1 mt-2 text-white/70">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{dog.location}</span>
            </div>
            <p className="text-white/60 text-sm mt-2">შეეხე დეტალებისთვის</p>
          </div>
        </div>
      </motion.div>

      <DogDetailSheet dog={dog} open={showDetail} onOpenChange={setShowDetail} />
    </>
  );
}
