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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl glass-strong overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-foreground">{dog.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <img
            src={dog.photo}
            alt={dog.name}
            className="w-full h-64 object-cover rounded-2xl"
          />

          <div className="grid grid-cols-2 gap-3">
            <InfoChip icon={<Calendar className="h-4 w-4" />} label="ასაკი" value={dog.age} />
            <InfoChip icon={<Heart className="h-4 w-4" />} label="სქესი" value={dog.gender} />
            <InfoChip icon={<MapPin className="h-4 w-4" />} label="ლოკაცია" value={dog.location} />
            <InfoChip icon={<Shield className="h-4 w-4" />} label="ჯიში" value={dog.breed} />
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">აღწერა</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{dog.description}</p>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">ხასიათი</h3>
            <p className="text-sm text-muted-foreground">{dog.personality}</p>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-foreground">ჯანმრთელობა</h3>
            <p className="text-sm text-muted-foreground">{dog.health}</p>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-2">მიმკედლებელი</h3>
            <p className="text-sm text-muted-foreground">{dog.caretakerName}</p>
            <a
              href={`tel:${dog.caretakerPhone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
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
    <div className="glass rounded-xl p-3 flex items-start gap-2">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
