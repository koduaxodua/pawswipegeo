import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HeartHandshake, PawPrint, Plus } from 'lucide-react';

export function GeorgianLandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-[78dvh] max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1fr_0.85fr] md:items-center">
        <div>
          <img src="/brand/logo-dark.png" alt="mipove.me" className="h-16 w-16 rounded-2xl object-contain" />
          <p className="mt-5 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            ქართული ცხოველთა დახმარების აპი
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            იპოვე, დაამატე და დაეხმარე მიუსაფარ ცხოველებს.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            mipove.me გეხმარება დაკარგული, მიუსაფარი ან მიკედლებისთვის განკუთვნილი ძაღლებისა და კატების პოვნაში.
            განცხადებები მარტივად იძებნება, რუკაზე ჩანს მიახლოებითი ადგილი და საჭიროებისას შეგიძლია დაუკავშირდე
            განცხადების ავტორს.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/app" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90 active:scale-[0.98]">
              აპის გახსნა <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/add" className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border bg-secondary/70 px-6 text-base font-semibold text-foreground transition hover:bg-secondary active:scale-[0.98]">
              <Plus className="h-5 w-5" /> ცხოველის დამატება
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link to="/missions" className="inline-flex items-center gap-2 text-muted-foreground underline">
              <BookOpen className="h-4 w-4" /> დახმარების გზამკვლევი
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground underline">
              English version
            </Link>
          </div>
        </div>

        <Link to="/app" aria-label="mipove.me აპის გახსნა" className="group rounded-[2rem] border border-border/70 bg-card/70 p-3 shadow-2xl shadow-black/30 transition hover:border-primary/40">
          <img
            src="/brand/og-image.jpg"
            alt="mipove.me ცხოველის განცხადების ეკრანი"
            className="aspect-[4/5] max-h-[62dvh] w-full rounded-[1.4rem] object-cover"
          />
          <span className="mt-3 flex items-center justify-center gap-2 rounded-full bg-primary/10 py-3 text-sm font-semibold text-primary transition group-hover:bg-primary/15">
            განცხადებების ნახვა <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
          <PawPrint className="mb-4 h-6 w-6 text-primary" />
          <h2 className="font-semibold">სწრაფი განცხადებები</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            დაამატე ფოტო, აღწერა, მიახლოებითი ადგილი და საკონტაქტო ინფორმაცია, თუ მისი გამოქვეყნების უფლება გაქვს.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
          <HeartHandshake className="mb-4 h-6 w-6 text-primary" />
          <h2 className="font-semibold">მიკედლება და დახმარება</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            ნახე ცხოველები სვაიპით, შეინახე საინტერესო განცხადებები და საჭიროებისას დაუკავშირდი ავტორს.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
          <BookOpen className="mb-4 h-6 w-6 text-primary" />
          <h2 className="font-semibold">გზამკვლევი</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            მისიების გვერდზე ნახავ პრაქტიკულ რჩევებს უსაფრთხო შეხვედრისთვის, ფოტოსთვის და ცხოველის გადაცემისთვის.
          </p>
        </div>
      </section>
    </main>
  );
}
