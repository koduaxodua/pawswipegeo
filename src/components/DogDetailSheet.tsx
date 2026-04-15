import { Dog } from '@/data/dogs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MapPin, Phone, Heart, Calendar, Shield } from 'lucide-react';

interface Props {
  dog: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DogDetailSheet({ dog, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl glass-strong overflow-y-auto px-5 pb-8 max-w-lg mx-auto">
        <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mt-2 mb-4" />
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-foreground">{dog.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-3 space-y-3">
          <img
            src={dog.photo}
            alt={dog.name}
            className="w-full h-56 sm:h-72 object-cover rounded-2xl"
          />

          <div className="grid grid-cols-2 gap-2">
            <InfoChip icon={<Calendar className="h-3.5 w-3.5" />} label="ასაკი" value={dog.age} />
            <InfoChip icon={<Heart className="h-3.5 w-3.5" />} label="სქესი" value={dog.gender} />
            <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} label="ლოკაცია" value={dog.location} />
            <InfoChip icon={<Shield className="h-3.5 w-3.5" />} label="ჯიში" value={dog.breed} />
          </div>

          <div className="glass rounded-xl p-3 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">აღწერა</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{dog.description}</p>
          </div>

          <div className="glass rounded-xl p-3 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">ხასიათი</h3>
            <p className="text-xs text-muted-foreground">{dog.personality}</p>
          </div>

          <div className="glass rounded-xl p-3 space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">ჯანმრთელობა</h3>
            <p className="text-xs text-muted-foreground">{dog.health}</p>
          </div>

          <div className="glass rounded-xl p-3">
            <h3 className="text-sm font-semibold text-foreground mb-1.5">მიმკედლებელი</h3>
            <p className="text-xs text-muted-foreground">{dog.caretakerName}</p>
            <a
              href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {dog.caretakerPhone}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-2.5 flex items-start gap-2">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
