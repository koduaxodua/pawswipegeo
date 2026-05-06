import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast({ title: 'პაროლი არასწორია', variant: 'destructive' });
        return;
      }
      navigate('/admin', { replace: true });
    } catch {
      toast({ title: 'შესვლა ვერ მოხერხდა', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-24 px-4 max-w-sm mx-auto">
      <form onSubmit={submit} className="glass-strong rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Admin Login</h1>
        </div>

        <label className="block">
          <span className="block text-sm text-muted-foreground mb-2">პაროლი</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          შესვლა
        </button>
      </form>
    </div>
  );
}
