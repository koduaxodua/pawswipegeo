import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, EyeOff, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AdaptivePetPhoto } from '@/components/AdaptivePetPhoto';

interface AdminDeletionRequest {
  id: string;
  pet_id: string;
  requester_contact: string | null;
  reason: string | null;
  status: 'pending' | 'reviewed' | 'completed' | 'rejected';
  created_at: string;
  pets: {
    id: string;
    name: string;
    age: string | null;
    location: string | null;
    photo_url: string | null;
    caretaker_name: string | null;
    caretaker_phone: string | null;
    status: string;
  } | null;
}

export default function Admin() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdminDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiding, setHiding] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deletion-requests', { credentials: 'include' });
      if (res.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setRequests(data.requests ?? []);
    } catch {
      toast({ title: 'ადმინის მონაცემები ვერ ჩაიტვირთა', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const hidePet = async (petId: string) => {
    if (!confirm('დაიმალოს ცხოველის პროფილი საჯარო საიტიდან?')) return;
    setHiding(petId);
    try {
      const res = await fetch('/api/admin/hide-pet', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId }),
      });
      if (res.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      if (!res.ok) throw new Error('hide_failed');
      toast({ title: 'პროფილი დაიმალა' });
      await loadRequests();
    } catch {
      toast({ title: 'დამალვა ვერ მოხერხდა', variant: 'destructive' });
    } finally {
      setHiding(null);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    navigate('/admin-login', { replace: true });
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4 mt-12 sm:mt-0 glass-strong rounded-3xl px-4 py-3 border border-primary/30">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-base font-bold text-foreground">Admin</h1>
            <p className="text-[10px] text-muted-foreground">Server-side session required</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          გასვლა
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">
          წაშლის მოთხოვნები ({requests.length})
        </h2>
        <button onClick={loadRequests} className="text-xs text-muted-foreground hover:text-foreground">
          განახლება
        </button>
      </div>

      {loading ? (
        <div className="glass rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">წაშლის მოთხოვნები არ არის.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(request => {
            const pet = request.pets;
            return (
              <div key={request.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <AdaptivePetPhoto
                  src={pet?.photo_url || '/brand/logo-dark.png'}
                  alt={pet?.name || 'pet'}
                  mode="adminThumb"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {pet?.name || 'უცნობი'}, {pet?.age || ''}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {pet?.location || 'ლოკაცია მითითებული არ არის'}
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                    სტატუსი: {request.status} · {new Date(request.created_at).toLocaleString()}
                  </div>
                </div>
                {request.status !== 'completed' && pet?.id && pet.status !== 'hidden' && (
                  <button
                    onClick={() => hidePet(pet.id)}
                    disabled={hiding === pet.id}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    {hiding === pet.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                    დამალვა
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
