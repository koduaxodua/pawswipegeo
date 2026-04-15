import { useState } from 'react';
import { useDogs } from '@/hooks/useDogs';
import { toast } from '@/hooks/use-toast';
import { Plus, PawPrint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddDog() {
  const { addDog } = useDogs();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    breed: '',
    gender: 'მამრობითი' as 'მამრობითი' | 'მდედრობითი',
    personality: '',
    health: '',
    location: '',
    photo: '',
    caretakerPhone: '',
    caretakerName: '',
    description: '',
  });

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.photo || !form.caretakerPhone || !form.location) {
      toast({ title: 'გთხოვთ შეავსოთ სავალდებულო ველები', variant: 'destructive' });
      return;
    }
    addDog(form);
    toast({ title: `${form.name} წარმატებით დაემატა! 🐾` });
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">ძაღლის დამატება</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="ფოტოს URL *" value={form.photo} onChange={v => update('photo', v)} placeholder="https://example.com/photo.jpg" />

        {form.photo && (
          <img src={form.photo} alt="preview" className="w-full h-48 sm:h-64 object-cover rounded-2xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
        )}

        {/* Two-column grid on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="სახელი *" value={form.name} onChange={v => update('name', v)} placeholder="მაგ: ბობი" />
          <FormField label="ასაკი" value={form.age} onChange={v => update('age', v)} placeholder="მაგ: 2 წელი" />
          <FormField label="ჯიში" value={form.breed} onChange={v => update('breed', v)} placeholder="მაგ: ნარევი" />
          <FormField label="ლოკაცია *" value={form.location} onChange={v => update('location', v)} placeholder="მაგ: ვაკე, თბილისი" />
        </div>

        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-medium text-foreground mb-2">სქესი</label>
          <div className="flex gap-3">
            {(['მამრობითი', 'მდედრობითი'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('gender', g)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  form.gender === g
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {g === 'მამრობითი' ? '♂ მამრობითი' : '♀ მდედრობითი'}
              </button>
            ))}
          </div>
        </div>

        <FormField label="ხასიათი" value={form.personality} onChange={v => update('personality', v)} placeholder="მაგ: მეგობრული, მშვიდი" multiline />
        <FormField label="ჯანმრთელობა" value={form.health} onChange={v => update('health', v)} placeholder="მაგ: აცრილი, ჯანმრთელი" />
        <FormField label="აღწერა" value={form.description} onChange={v => update('description', v)} placeholder="მოკლე აღწერა ძაღლის შესახებ..." multiline />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="თქვენი სახელი" value={form.caretakerName} onChange={v => update('caretakerName', v)} placeholder="მაგ: ნინო" />
          <FormField label="საკონტაქტო ნომერი *" value={form.caretakerPhone} onChange={v => update('caretakerPhone', v)} placeholder="+995 5XX XX XX XX" />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98]"
        >
          <PawPrint className="h-5 w-5" />
          ძაღლის დამატება
        </button>
      </form>
    </div>
  );
}

function FormField({
  label, value, onChange, placeholder, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[80px]"
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      )}
    </div>
  );
}
