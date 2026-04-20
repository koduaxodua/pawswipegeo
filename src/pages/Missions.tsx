import { Trophy, Target, Sparkles, Crown, Flame } from 'lucide-react';
import { useLikedDogs } from '@/hooks/useLikedDogs';
import { useMissions } from '@/hooks/useMissions';

export default function Missions() {
  const { likedDogs } = useLikedDogs();
  const { missions, state, leaderboard } = useMissions(likedDogs);

  const xpToNext = state.level * 300;
  const xpInLevel = state.totalXp - (state.level - 1) * 300;
  const pct = Math.min(100, (xpInLevel / 300) * 100);

  const activeMissions = missions.filter(m => !m.done);
  const completedMissions = missions.filter(m => m.done);

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary-foreground">მისიები</h1>
      </div>

      {/* Player card */}
      <div className="glass-strong rounded-3xl p-5 mb-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">შენი რანგი</div>
              <div className="text-xl font-bold text-primary-foreground">{state.rank}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-primary-foreground/60 uppercase tracking-wider">დონე</div>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <Crown className="h-5 w-5" />
                {state.level}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-primary-foreground/70">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {state.totalXp} XP
              </span>
              <span>შემდეგ დონემდე: {xpToNext - state.totalXp} XP</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4 text-center">
            <div className="flex-1 bg-background/40 rounded-xl py-2">
              <div className="text-lg font-bold text-primary-foreground">{likedDogs.length}</div>
              <div className="text-[10px] text-primary-foreground/60 uppercase">შეგროვებული</div>
            </div>
            <div className="flex-1 bg-background/40 rounded-xl py-2">
              <div className="text-lg font-bold text-primary-foreground">{completedMissions.length}</div>
              <div className="text-[10px] text-primary-foreground/60 uppercase">დასრულებული</div>
            </div>
            <div className="flex-1 bg-background/40 rounded-xl py-2">
              <div className="text-lg font-bold text-primary-foreground">{missions.length - completedMissions.length}</div>
              <div className="text-[10px] text-primary-foreground/60 uppercase">აქტიური</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active missions */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
            აქტიური ჩელენჯები
          </h2>
        </div>
        <div className="space-y-2.5">
          {activeMissions.length === 0 && (
            <div className="glass rounded-2xl p-6 text-center text-primary-foreground/60 text-sm">
              ყველა მისია დასრულებულია! 🎉
            </div>
          )}
          {activeMissions.map(m => {
            const pct = (m.current / m.goal) * 100;
            return (
              <div key={m.id} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-primary-foreground text-sm">{m.title}</h3>
                      <span className="text-xs font-medium text-primary flex-shrink-0">+{m.xp} XP</span>
                    </div>
                    <p className="text-xs text-primary-foreground/60 mb-2">{m.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-primary-foreground/80 tabular-nums">
                        {m.current}/{m.goal}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed */}
      {completedMissions.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
              მოპოვებული ნიშნები
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {completedMissions.map(m => (
              <div
                key={m.id}
                className="glass rounded-2xl p-3 flex flex-col items-center text-center aspect-square justify-center"
                title={m.title}
              >
                <div className="text-3xl mb-1">{m.badge}</div>
                <div className="text-[10px] text-primary-foreground/70 leading-tight line-clamp-2">
                  {m.title}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80">
            ლიდერბორდი
          </h2>
        </div>
        <div className="glass-strong rounded-2xl overflow-hidden">
          {leaderboard.map((p, i) => (
            <div
              key={p.name + i}
              className={`flex items-center gap-3 px-4 py-3 ${
                i < leaderboard.length - 1 ? 'border-b border-border/30' : ''
              } ${p.isYou ? 'bg-primary/15' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0
                    ? 'bg-yellow-400 text-yellow-900'
                    : i === 1
                    ? 'bg-gray-300 text-gray-800'
                    : i === 2
                    ? 'bg-orange-400 text-orange-900'
                    : 'bg-secondary text-primary-foreground/70'
                }`}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-primary-foreground truncate">
                  {p.name} {p.isYou && <span className="text-xs text-primary">(შენ)</span>}
                </div>
                <div className="text-xs text-primary-foreground/60">{p.rank}</div>
              </div>
              <div className="text-sm font-bold text-primary tabular-nums flex-shrink-0">
                {p.xp.toLocaleString()} XP
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
