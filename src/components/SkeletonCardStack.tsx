import { motion } from 'framer-motion';

export function SkeletonCardStack() {
  return (
    <div className="relative h-[52vh] max-h-[420px] w-full max-w-sm sm:max-w-md lg:max-w-lg">
      {[2, 1, 0].map(index => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-3xl border border-border/60 bg-card/70 p-5 shadow-xl"
          style={{
            transform: `translateY(${index * 10}px) scale(${1 - index * 0.035})`,
            opacity: 1 - index * 0.18,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-2/3 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-5 h-5 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
        </motion.div>
      ))}
    </div>
  );
}
