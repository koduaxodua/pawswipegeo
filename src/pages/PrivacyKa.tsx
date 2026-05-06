import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

const CONTACT_EMAIL = 'kodua.studio@gmail.com';

export default function PrivacyKa() {
  return (
    <div className="min-h-screen pb-24 pt-4 px-4 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6 pr-topbar">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">კონფიდენციალურობის პოლიტიკა</h1>
      </div>

      <div className="space-y-4">
        <Section title="1. ვინ ვართ">
          <p>
            mipove.me არის ონლაინ პლატფორმა, რომელიც ეხმარება მომხმარებლებს მიუსაფარი, დაკარგული ან
            მიკედლებისთვის განკუთვნილი ცხოველების შესახებ ინფორმაციის განთავსებასა და მოძიებაში.
          </p>
          <p>საკონტაქტო ელფოსტა: <EmailLink /></p>
        </Section>

        <Section title="2. რა მონაცემებს ვამუშავებთ">
          <p>ცხოველის დამატებისას შეიძლება დამუშავდეს:</p>
          <Bullets items={[
            'ცხოველის ფოტო, სახელი, ასაკი, ჯიში, სქესი, ჯანმრთელობის/ხასიათის აღწერა და დამატებითი აღწერა;',
            'საკონტაქტო ინფორმაცია, თუ მომხმარებელი მიუთითებს ტელეფონის ნომერს ან სახელს;',
            'ცხოველთან დაკავშირებული ზუსტი მდებარეობა, თუ მომხმარებელი თავად მონიშნავს რუკაზე, მისცემს ბრაუზერს ლოკაციის უფლებას ან ფოტოში არის EXIF GPS;',
            'საჯაროდ საჩვენებელი მიახლოებითი მდებარეობა, რომელიც მიიღება ზუსტი კოორდინატების 300-700 მეტრით გადანაცვლებით;',
            'ტექნიკური მონაცემები, როგორიცაა IP მისამართი, ბრაუზერის/მოწყობილობის ინფორმაცია და უსაფრთხოების/ჰოსტინგის ლოგები.',
          ]} />
        </Section>

        <Section title="3. საჯარო ცხოველის პროფილი">
          <p>
            საჯარო პროფილში ჩანს ცხოველის ფოტო, აღწერა, საკონტაქტო ტელეფონი თუ ის მითითებულია,
            და მიახლოებითი/public მდებარეობა. ზუსტი კოორდინატები საჯარო რუკასა და ბარათებში არ გამოიყენება.
          </p>
          <p>
            მომხმარებელმა უნდა მიუთითოს მხოლოდ საკუთარი საკონტაქტო ინფორმაცია ან ინფორმაცია, რომლის
            გამოქვეყნების უფლებაც აქვს.
          </p>
        </Section>

        <Section title="4. ინფრასტრუქტურა და შენახვა">
          <p>
            პლატფორმა იყენებს Supabase-ს მონაცემთა ბაზისთვის, Storage-ს ფოტოების შესანახად და
            anonymous Supabase Auth-ს ტექნიკური მომხმარებლის იდენტიფიკატორის შესაქმნელად.
            ვებსაიტი განთავსებულია Vercel-ზე, სადაც შეიძლება შეიქმნას ტექნიკური request/security logs.
          </p>
        </Section>

        <Section title="5. მდებარეობა და რუკები">
          <p>
            რუკებისთვის გამოიყენება OpenStreetMap/Leaflet. მისამართის ძიებისა და reverse geocoding-ისთვის
            გამოიყენება Nominatim, რომელსაც შეიძლება გაეგზავნოს საძიებო ტექსტი ან კოორდინატები.
            მომხმარებლის მიმდინარე მდებარეობა გამოიყენება მხოლოდ რუკაზე ახლოს მდებარე ცხოველების ჩვენებისთვის
            და აპში მუდმივად არ ინახება.
          </p>
        </Section>

        <Section title="6. ანალიტიკა, რეკლამა და cookies">
          <p>
            საიტზე შეიძლება გამოყენებული იყოს Google Analytics და Google AdSense. ანალიტიკისა და რეკლამის
            სკრიპტები ნაგულისხმევად გამორთულია და ჩაირთვება მხოლოდ cookie/privacy banner-ში არჩევანის შემდეგ.
            არჩევანი ინახება localStorage-ში.
          </p>
        </Section>

        <Section title="7. localStorage">
          <p>
            ბრაუზერში შეიძლება შენახული იყოს ენის არჩევანი, tutorial-ის სტატუსი, მოწონებული/გამოტოვებული
            ცხოველები, deletion request-ის local cache, translation cache და cookie consent-ის არჩევანი.
            Supabase Auth ასევე ინახავს anonymous session token-ს ბრაუზერში.
          </p>
        </Section>

        <Section title="8. თარგმანი">
          <p>
            ინგლისურ რეჟიმში საჯარო აღწერითი ველები შეიძლება ითარგმნოს MyMemory Translation API-ის
            საშუალებით. თარგმანისთვის არ იგზავნება ტელეფონის ნომერი, caretaker-ის სახელი ან ზუსტი/ხელით
            მითითებული ლოკაციის ტექსტი.
          </p>
        </Section>

        <Section title="9. წაშლა და დამალვა">
          <p>
            მომხმარებელს შეუძლია გაგზავნოს ცხოველის პროფილის წაშლის/დამალვის მოთხოვნა. მოთხოვნა მოწმდება
            ადმინისტრატორის მიერ. დამალვის შემდეგ ცხოველის პროფილი საჯაროდ აღარ ჩანს და, როგორც წესი,
            90 დღის შემდეგ სამუდამოდ იშლება სისტემიდან. სამართლებრივი, უსაფრთხოების ან დამატებითი
            შემოწმების საჭიროების შემთხვევაში მონაცემები შეიძლება დროებით უფრო დიდხანს შენარჩუნდეს.
          </p>
        </Section>

        <Section title="10. მხარდაჭერის გადახდები">
          <p>
            მხარდაჭერის/გადახდის ფუნქცია შეიძლება დაემატოს მომავალში. ასეთ შემთხვევაში ბარათის სრული
            მონაცემები, CVV ან ბარათის ვადა არ შეინახება ამ აპში; გადახდა დამუშავდება ბანკის ან გადახდის
            პროვაიდერის დაცულ გვერდზე.
          </p>
        </Section>

        <Section title="11. მესამე მხარეები">
          <Bullets items={[
            'Supabase - მონაცემთა ბაზა, Storage და anonymous Auth;',
            'Vercel - ჰოსტინგი და ტექნიკური ლოგები;',
            'Google Analytics - ანალიტიკა მხოლოდ თანხმობის შემდეგ;',
            'Google AdSense - რეკლამა მხოლოდ თანხმობის შემდეგ, თუ ჩართულია;',
            'OpenStreetMap/Nominatim - რუკა, მისამართის ძიება და reverse geocoding;',
            'MyMemory Translation API - მხოლოდ საჯარო აღწერითი ტექსტების თარგმანი.',
          ]} />
        </Section>

        <Section title="12. კონტაქტი">
          <p>
            მონაცემებთან, კონტენტთან ან წაშლის მოთხოვნებთან დაკავშირებით მოგვწერეთ: <EmailLink />.
          </p>
          <p className="text-xs">ბოლო განახლება: 2026 წლის მაისი</p>
        </Section>

        <div className="glass rounded-3xl p-4 flex items-center justify-between gap-3 text-sm">
          <Link to="/terms" className="text-primary hover:underline">წესები და პირობები</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-primary hover:underline">
            <Mail className="h-4 w-4" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-3xl p-4">
      <h2 className="font-semibold text-foreground mb-2">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

function EmailLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
      {CONTACT_EMAIL}
    </a>
  );
}
