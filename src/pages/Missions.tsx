import { HeartHandshake, MapPin, ShieldCheck, Trophy } from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

const content = {
  ka: {
    title: 'მისიები',
    lead: 'აქ თავმოყრილია პრაქტიკული ნაბიჯები, რომლებიც ცხოველის პოვნას, უსაფრთხო კონტაქტს და პასუხისმგებლიან დახმარებას ამარტივებს.',
    cards: [
      {
        title: 'ზუსტი ინფორმაცია',
        text: 'ატვირთე მკაფიო ფოტო, მოკლე აღწერა და ისეთი მდებარეობა, რომელიც ცხოველის პოვნას დაეხმარება, მაგრამ კერძო მისამართს ზედმეტად არ გამოაჩენს.',
      },
      {
        title: 'უსაფრთხო შეხვედრა',
        text: 'სხვა ადამიანთან შეხვედრისას აირჩიე უსაფრთხო ადგილი, გადაამოწმე დეტალები და ცხოველი არ გადასცე საეჭვო ან საფრთხის შემცველ ვითარებაში.',
      },
      {
        title: 'განახლებული განცხადებები',
        text: 'თუ ცხოველი იპოვეს, განცხადება მოძველდა ან წაშლაა საჭირო, პროფილიდან გაგზავნე მოთხოვნა admin review-სთვის.',
      },
    ],
  },
  en: {
    title: 'Rescue missions',
    lead: 'Practical actions that make pet reports clearer, safer, and easier for the community to review.',
    cards: [
      {
        title: 'Share clear information',
        text: 'Upload a clear photo, short description, and a useful approximate area without exposing a private address.',
      },
      {
        title: 'Meet safely',
        text: 'When meeting another person, choose a safer place, confirm details, and do not transfer a pet in an unclear situation.',
      },
      {
        title: 'Keep listings current',
        text: 'If a pet is found, a listing is outdated, or removal is needed, send a profile review request for admin handling.',
      },
    ],
  },
};

const icons = [MapPin, ShieldCheck, HeartHandshake];

export default function Missions() {
  const { locale } = useLocale();
  const copy = content[locale];

  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 pr-topbar">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{copy.title}</h1>
      </div>

      <section className="glass-strong rounded-3xl p-5 sm:p-7">
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">{copy.lead}</p>
        <div className="mt-6 grid gap-4">
          {copy.cards.map((card, index) => {
            const Icon = icons[index];
            return (
              <article key={card.title} className="rounded-2xl border border-border/60 bg-background/35 p-4">
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
