import { useState } from 'react';
import { ShieldAlert, Trash2, Eye, LogOut, AlertCircle } from 'lucide-react';
import { useDogs } from '@/hooks/useDogs';
import { useDeleteRequests } from '@/hooks/useDeleteRequests';
import { useAdminMode } from '@/contexts/AdminMode';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { Dog } from '@/data/dogs';

export default function Admin() {
  const { dogs } = useDogs();
  const { requestedIds, cancelRequest, clearAll } = useDeleteRequests();
  const { exit } = useAdminMode();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const requestedDogs = dogs.filter(d => requestedIds.includes(d.id));

  const handleRealDelete = async (dog: Dog) => {
    if (!confirm(`დარწმუნებული ხარ რომ გინდა "${dog.name}"-ის სამუდამოდ წაშლა?`)) return;
    setDeleting(dog.id);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('pets').delete().eq('id', dog.id);
        if (error) {
          if (error.message.includes('row-level security') || error.code === '42501') {
            toast({
              title: 'წაშლა DB-დან ვერ მოხერხდა',
              description: 'RLS პოლისი მხოლოდ ატვირთვის ავტორს უშვებს. გამოიყენე Supabase Studio.',
              variant: 'destructive',
            });
          } else {
            toast({ title: `Error: ${error.message}`, variant: 'destructive' });
          }
        } else {
          toast({ title: `${dog.name} წაშლილია DB-დან ✓` });
        }
      } else {
        toast({ title: `${dog.name} წაშლილია (ლოკალურად)` });
      }
      cancelRequest(dog.id);
    } catch (e) {
      toast({ title: 'Error', description: String(e), variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 glass-strong rounded-2xl px-4 py-3 border border-destructive/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <div>
            <h1 className="text-base font-bold text-foreground">ადმინ რეჟიმი</h1>
            <p className="text-[10px] text-muted-foreground">გვერდის რეფრეშზე გაქრება</p>
          </div>
        </div>
        <button
          onClick={exit}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          გასვლა
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          წაშლის თხოვნები ({requestedDogs.length})
        </h2>
        {requestedIds.length > 0 && (
          <button
            onClick={() => {
              if (confirm('ყველა თხოვნის გასუფთავება?')) {
                clearAll();
                toast({ title: 'სია გასუფთავდა' });
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            სიის გასუფთავება
          </button>
        )}
      </div>

      {requestedDogs.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            წაშლის თხოვნები არ არის.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            მომხმარებლები ცხოველის პროფილიდან გზავნიან თხოვნებს.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {requestedDogs.map(dog => (
            <div
              key={dog.id}
              className="glass rounded-2xl p-3 flex items-center gap-3"
            >
              <button
                onClick={() => setSelectedDog(dog)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <img
                  src={dog.photo}
                  alt={dog.name}
                  className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {dog.name}, {dog.age}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {dog.location}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] text-primary mt-0.5">
                    <Eye className="h-3 w-3" />
                    პროფილი
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleRealDelete(dog)}
                disabled={deleting === dog.id}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting === dog.id ? 'იშლება...' : 'წაშლა'}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDog && (
        <DogDetailSheet
          dog={selectedDog}
          open={!!selectedDog}
          onOpenChange={(o) => !o && setSelectedDog(null)}
        />
      )}
    </div>
  );
}
