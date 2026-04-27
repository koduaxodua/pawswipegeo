import { useState } from 'react';
import { ShieldAlert, EyeOff, Eye, LogOut, AlertCircle } from 'lucide-react';
import { useDogs } from '@/hooks/useDogs';
import { useDeleteRequests } from '@/hooks/useDeleteRequests';
import { useAdminMode } from '@/contexts/AdminMode';
import { DogDetailSheet } from '@/components/DogDetailSheet';
import { supabase, isSupabaseConfigured, ensureAnonAuth } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useT } from '@/contexts/Locale';
import type { Dog } from '@/data/dogs';

export default function Admin() {
  const t = useT();
  const { dogs } = useDogs();
  const { requestedIds, cancelRequest, clearAll } = useDeleteRequests();
  const { exit } = useAdminMode();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [hiding, setHiding] = useState<string | null>(null);

  const requestedDogs = dogs.filter(d => requestedIds.includes(d.id));

  const isUuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  /**
   * Soft-delete: sets status='hidden' so the pet vanishes from the public feed
   * (`pets_public_read` policy filters by status='available').
   *
   * Critical: must call ensureAnonAuth() FIRST. The pets_authed_update RLS
   * policy requires auth.role()='authenticated', and we don't get that role
   * until a Supabase session exists. Anonymous users that never uploaded a
   * pet have no session yet, so updates silently match 0 rows.
   *
   * We also use { count: 'exact' } to reliably detect 0-row updates — without
   * it, Supabase returns success even when RLS filtered everything out.
   */
  const handleHide = async (dog: Dog) => {
    if (!confirm(t('admin.hide.confirm', { name: dog.name }))) return;
    setHiding(dog.id);
    try {
      if (isSupabaseConfigured && supabase && isUuid(dog.id)) {
        // Establish (or reuse) an anonymous session so auth.role()='authenticated'
        const userId = await ensureAnonAuth();
        if (!userId) {
          toast({
            title: t('admin.hide.failed'),
            description: 'auth',
            variant: 'destructive',
          });
          return;
        }

        const { error, count } = await supabase
          .from('pets')
          .update({ status: 'hidden' }, { count: 'exact' })
          .eq('id', dog.id);

        if (error) {
          console.error('[admin] hide failed:', error);
          toast({
            title: t('admin.hide.failed'),
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        if (count === 0) {
          console.warn('[admin] update affected 0 rows — RLS or pet missing');
          toast({
            title: t('admin.hide.rlsBlocked'),
            description: t('admin.hide.rlsBlockedDesc'),
            variant: 'destructive',
          });
          return;
        }
        toast({ title: t('admin.hidden.db', { name: dog.name }) });
      } else {
        toast({ title: t('admin.hidden.local', { name: dog.name }) });
      }
      cancelRequest(dog.id);
    } catch (e) {
      toast({ title: t('common.error'), description: String(e), variant: 'destructive' });
    } finally {
      setHiding(null);
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
                onClick={() => handleHide(dog)}
                disabled={hiding === dog.id}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                <EyeOff className="h-3.5 w-3.5" />
                {hiding === dog.id ? t('admin.hiding') : t('admin.hide')}
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
