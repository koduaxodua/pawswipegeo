import { useEffect, useMemo, useState } from 'react';
import type { Dog } from '@/data/dogs';

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  goal: number;
  xp: number;
  badge: string;
  category: 'collector' | 'explorer' | 'hero' | 'social';
  /** Returns current progress (0..goal) for the user given their liked dogs */
  progress: (liked: Dog[]) => number;
}

export const MISSIONS: Mission[] = [
  {
    id: 'first_paw',
    emoji: '🐾',
    title: 'პირველი ნაბიჯი',
    description: 'მოიწონე შენი პირველი ძაღლი',
    goal: 1,
    xp: 50,
    badge: '🥉',
    category: 'collector',
    progress: liked => Math.min(liked.length, 1),
  },
  {
    id: 'collector_5',
    emoji: '📦',
    title: 'კოლექციონერი',
    description: 'შეაგროვე 5 ძაღლი',
    goal: 5,
    xp: 150,
    badge: '🎖️',
    category: 'collector',
    progress: liked => Math.min(liked.length, 5),
  },
  {
    id: 'master_10',
    emoji: '🏆',
    title: 'ძაღლების ოსტატი',
    description: 'შეაგროვე 10 ძაღლი',
    goal: 10,
    xp: 400,
    badge: '🥇',
    category: 'collector',
    progress: liked => Math.min(liked.length, 10),
  },
  {
    id: 'explorer_districts',
    emoji: '🗺️',
    title: 'თბილისის მკვლევარი',
    description: 'მოიწონე ძაღლები 3 სხვადასხვა უბნიდან',
    goal: 3,
    xp: 200,
    badge: '🧭',
    category: 'explorer',
    progress: liked => {
      const districts = new Set<string>();
      const known = ['ვაკე', 'საბურთალო', 'დიდუბე', 'ისანი', 'გლდანი', 'ნაძალადევი', 'ვარკეთილი', 'მთაწმინდა', 'ჩუღურეთი'];
      for (const d of liked) {
        for (const k of known) {
          if (d.location?.includes(k)) {
            districts.add(k);
            break;
          }
        }
      }
      return Math.min(districts.size, 3);
    },
  },
  {
    id: 'breed_hunter',
    emoji: '🧬',
    title: 'ჯიშების მონადირე',
    description: 'შეაგროვე 4 სხვადასხვა ჯიშის ძაღლი',
    goal: 4,
    xp: 250,
    badge: '🎯',
    category: 'explorer',
    progress: liked => {
      const breeds = new Set(liked.map(d => d.breed.split('(')[0].trim()));
      return Math.min(breeds.size, 4);
    },
  },
  {
    id: 'gender_balance',
    emoji: '⚖️',
    title: 'ბალანსის დამცველი',
    description: 'მოიწონე მინიმუმ 2 მამრი და 2 მდედრი',
    goal: 4,
    xp: 200,
    badge: '☯️',
    category: 'social',
    progress: liked => {
      const m = liked.filter(d => d.gender === 'მამრობითი').length;
      const f = liked.filter(d => d.gender === 'მდედრობითი').length;
      return Math.min(m, 2) + Math.min(f, 2);
    },
  },
  {
    id: 'puppy_lover',
    emoji: '🐶',
    title: 'ლეკვების მფარველი',
    description: 'მოიწონე 2 ლეკვი (1 წლამდე)',
    goal: 2,
    xp: 150,
    badge: '💛',
    category: 'hero',
    progress: liked => {
      const pups = liked.filter(d => /თვე|^0|^1 წელ/.test(d.age));
      return Math.min(pups.length, 2);
    },
  },
  {
    id: 'senior_hero',
    emoji: '👴',
    title: 'ხნიერების გმირი',
    description: 'მოიწონე ძაღლი 4+ წლის',
    goal: 1,
    xp: 200,
    badge: '❤️‍🔥',
    category: 'hero',
    progress: liked => {
      const seniors = liked.filter(d => {
        const m = d.age.match(/(\d+(?:\.\d+)?)/);
        return m && parseFloat(m[1]) >= 4 && d.age.includes('წელ');
      });
      return Math.min(seniors.length, 1);
    },
  },
  {
    id: 'legend_15',
    emoji: '👑',
    title: 'ლეგენდარული მცველი',
    description: 'შეაგროვე 15 ძაღლი',
    goal: 15,
    xp: 1000,
    badge: '💎',
    category: 'collector',
    progress: liked => Math.min(liked.length, 15),
  },
];

export interface MissionState {
  totalXp: number;
  level: number;
  completed: string[];
  rank: string;
}

const xpToLevel = (xp: number) => Math.floor(xp / 300) + 1;
const rankFor = (level: number) => {
  if (level >= 8) return 'ლეგენდა 👑';
  if (level >= 6) return 'ჩემპიონი 🏆';
  if (level >= 4) return 'გმირი 🦸';
  if (level >= 2) return 'მკვლევარი 🧭';
  return 'დამწყები 🐾';
};

const STORAGE_KEY = 'pawswipe_missions_completed';

export function useMissions(likedDogs: Dog[]): {
  missions: (Mission & { current: number; done: boolean })[];
  state: MissionState;
  leaderboard: { name: string; xp: number; rank: string; isYou?: boolean }[];
} {
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const enriched = useMemo(
    () =>
      MISSIONS.map(m => {
        const current = m.progress(likedDogs);
        return { ...m, current, done: current >= m.goal };
      }),
    [likedDogs]
  );

  // Auto-complete missions reaching goal
  useEffect(() => {
    const newlyDone = enriched.filter(m => m.done).map(m => m.id);
    const merged = Array.from(new Set([...completed, ...newlyDone]));
    if (merged.length !== completed.length) {
      setCompleted(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }, [enriched, completed]);

  const totalXp = enriched.filter(m => m.done).reduce((s, m) => s + m.xp, 0);
  const level = xpToLevel(totalXp);
  const rank = rankFor(level);

  const leaderboard = [
    { name: 'ნინო ბ.', xp: 2400, rank: rankFor(xpToLevel(2400)) },
    { name: 'გიორგი მ.', xp: 1850, rank: rankFor(xpToLevel(1850)) },
    { name: 'მარიამ კ.', xp: 1200, rank: rankFor(xpToLevel(1200)) },
    { name: 'შენ', xp: totalXp, rank, isYou: true },
    { name: 'დავითი ლ.', xp: 850, rank: rankFor(xpToLevel(850)) },
    { name: 'სოფო ჯ.', xp: 600, rank: rankFor(xpToLevel(600)) },
    { name: 'ლევანი ც.', xp: 350, rank: rankFor(xpToLevel(350)) },
  ].sort((a, b) => b.xp - a.xp);

  return {
    missions: enriched,
    state: { totalXp, level, completed, rank },
    leaderboard,
  };
}
