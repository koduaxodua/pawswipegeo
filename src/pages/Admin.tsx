import { useState } from 'react';
import { ShieldAlert, Trash2, Eye, LogOut, AlertCircle } from 'lucide-react';
import { useDogs } from '@/hooks/useDogs';
import { useDeleteRequests } from '@/hooks/useDeleteRequests';
import { useAdminMode } from '@/contexts/AdminMode';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/Locale';
import type { Dog } from '@/data/dogs';

export default function Admin() {
  const t = useT();
  const { dogs } = useDogs();
  const { requestedIds, cancelRequest, clearAll } = useDeleteRequests();
  const { exit } = useAdminMode();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const requestedDogs = dogs.filter(d => requestedIds.includes(d.id));

  const isUuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const handleRealDelete = async (dog: Dog) => {
    if (!confirm(t('admin.delete.confirm', { name: dog.name }))) return;
    setDeleting(dog.id);
    try {
      // Sample seed dogs have non-UUID IDs ('1', '2', ...) and aren't in DB.
      // Only attempt a Supabase delete for real (UUID) records.
      if (isSupabaseConfigured && supabase && isUuid(dog.id)) {
        const { error } = await supabase.from('pets').delete().eq('id', dog.id);
        if (error) {
          if (error.message.includes('row-level security') || error.code === '42501') {
            toast({
              title: t('admin.delete.rls'),
              description: t('admin.delete.rlsDesc'),
              variant: 'destructive',
            });
          } else {
            toast({ title: `Error: ${error.message}`, variant: 'destructive' });
          }
        } else {
          toast({ title: t('admin.deleted.db', { name: dog.name }) });
        }
      } else {
        toast({ title: t('admin.deleted.local', { name: dog.name }) });
      }
      cancelRequest(dog.id);
    } catch (e) {
      toast({ title: t('common.error'), description: String(e), variant: 'destructive' });
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
            <h1 className="text-base font-bold text-foreground">{t('admin.title')}</h1>
            <p className="text-[10px] text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={exit}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          {t('admin.exit')}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          {t('admin.heading', { n: requestedDogs.length })}
        </h2>
        {requestedIds.length > 0 && (
          <button
            onClick={() => {
              if (confirm(t('admin.clearAll.confirm'))) {
                clearAll();
                toast({ title: t('admin.cleared') });
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('admin.clearAll')}
          </button>
        )}
      </div>

      {requestedDogs.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {t('admin.empty.title')}
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            {t('admin.empty.sub')}
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
                    {t('admin.profile')}
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleRealDelete(dog)}
                disabled={deleting === dog.id}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting === dog.id ? t('admin.deleting') : t('admin.delete')}
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
