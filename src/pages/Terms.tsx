import { FileText } from 'lucide-react';
import { useLocale } from '@/contexts/Locale';

export default function Terms() {
  const { locale } = useLocale();
  return locale === 'en' ? <TermsEn /> : <TermsKa />;
}

function TermsKa() {
  return (
    <div className="min-h-screen pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">წესები და პირობები</h1>
      </div>

      <div className="space-y-4">
        <Section title="1. ზოგადი დებულებები">
          <p>Pet Rescue Georgia არის არაკომერციული პლატფორმა, რომელიც მიზნად ისახავს მიუსაფარი ძაღლებისა და კატებისთვის ახალი სახლის მოძებნას. პლატფორმა მოქმედებს საქართველოს კანონმდებლობის ფარგლებში.</p>
        </Section>

        <Section title="2. ცხოველთა დაცვის კანონი">
          <p>საქართველოს კანონი „შინაური ცხოველების შესახებ" (2022) ადგენს ცხოველთა კეთილდღეობის სტანდარტებს. პლატფორმის მომხმარებლები ვალდებულნი არიან:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>არ მიაყენონ ცხოველს ფიზიკური ან ფსიქოლოგიური ზიანი</li>
            <li>უზრუნველყონ ცხოველის სათანადო მოვლა და კვება</li>
            <li>დროულად მიმართონ ვეტერინარს საჭიროების შემთხვევაში</li>
            <li>არ მიატოვონ ან გადააგდონ ცხოველი</li>
          </ul>
        </Section>

        <Section title="3. პერსონალური მონაცემები">
          <p>საქართველოს კანონი „პერსონალურ მონაცემთა დაცვის შესახებ"-ის შესაბამისად:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>საკონტაქტო ინფორმაცია ინახება მხოლოდ მომხმარებლის მოწყობილობაზე (localStorage) ან Supabase-ის უსაფრთხო ბაზაში</li>
            <li>პლატფორმა მინიმუმ აგროვებს პერსონალურ მონაცემებს — მხოლოდ ცხოველის მიკედლების მიზნით</li>
            <li>ტელეფონის ნომრები გამოიყენება მხოლოდ ცხოველის მიკედლების მიზნით</li>
          </ul>
        </Section>

        <Section title="4. მომხმარებლის პასუხისმგებლობა">
          <ul className="list-disc pl-5 space-y-1">
            <li>მომხმარებელი თავად არის პასუხისმგებელი ატვირთული ინფორმაციის სიზუსტეზე</li>
            <li>აკრძალულია ცრუ ან შეცდომაში შემყვანი ინფორმაციის განთავსება</li>
            <li>აკრძალულია ცხოველის კომერციული მიზნით გაყიდვის შეტყობინებების განთავსება</li>
          </ul>
        </Section>

        <Section title="5. პასუხისმგებლობის შეზღუდვა">
          <p>Pet Rescue Georgia:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>არ არის პასუხისმგებელი მომხმარებლებს შორის კომუნიკაციის შედეგებზე</li>
            <li>არ იძლევა გარანტიას ატვირთული ინფორმაციის სიზუსტეზე</li>
            <li>არ არის შუამავალი ან მხარე ცხოველის მიკედლების პროცესში</li>
            <li>იტოვებს უფლებას წაშალოს შეუფერებელი კონტენტი</li>
          </ul>
        </Section>

        <Section title="6. ინტელექტუალური საკუთრება">
          <p>Pet Rescue Georgia-ის დიზაინი, ლოგო და კონტენტი დაცულია საქართველოს საავტორო უფლებების კანონმდებლობით. მომხმარებლების მიერ ატვირთული ფოტოები რჩება მათ საკუთრებაში.</p>
        </Section>

        <Section title="7. დავების გადაწყვეტა">
          <p>ნებისმიერი დავა, რომელიც წარმოიშვება პლატფორმის გამოყენებასთან დაკავშირებით, წყდება საქართველოს კანონმდებლობის შესაბამისად, თბილისის საქალაქო სასამართლოში.</p>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

function TermsEn() {
  return (
    <div className="min-h-screen pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Terms & Conditions</h1>
      </div>

      <div className="space-y-4">
        <Section title="1. General">
          <p>Pet Rescue Georgia is a non-commercial platform that helps homeless dogs and cats find new homes. The platform operates within Georgian (country) law.</p>
        </Section>

        <Section title="2. Animal Welfare Law">
          <p>The Georgian law "On Domestic Animals" (2022) establishes welfare standards. Platform users must:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Not cause physical or psychological harm to an animal</li>
            <li>Provide proper care and feeding</li>
            <li>See a veterinarian when needed</li>
            <li>Not abandon or discard an animal</li>
          </ul>
        </Section>

        <Section title="3. Personal Data">
          <p>In accordance with Georgia's Personal Data Protection Law:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Contact info is stored only on the user's device (localStorage) or in Supabase's secure database</li>
            <li>The platform collects minimal personal data — only what's needed to facilitate adoption</li>
            <li>Phone numbers are used solely for adoption purposes</li>
          </ul>
        </Section>

        <Section title="4. User Responsibility">
          <ul className="list-disc pl-5 space-y-1">
            <li>Users are responsible for the accuracy of uploaded info</li>
            <li>Posting false or misleading info is forbidden</li>
            <li>Posting commercial-sale listings of animals is forbidden</li>
          </ul>
        </Section>

        <Section title="5. Limitation of Liability">
          <p>Pet Rescue Georgia:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Is not liable for the outcomes of communication between users</li>
            <li>Does not guarantee the accuracy of uploaded information</li>
            <li>Is not a mediator or party to the adoption process</li>
            <li>Reserves the right to remove inappropriate content</li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>Pet Rescue Georgia's design, logo, and content are protected under Georgian copyright law. Photos uploaded by users remain their property.</p>
        </Section>

        <Section title="7. Disputes">
          <p>Any dispute arising from the use of this platform shall be resolved according to Georgian law in the Tbilisi City Court.</p>
        </Section>

        <Footer />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h2 className="font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}

function Footer() {
  const { locale } = useLocale();
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <p className="text-xs text-muted-foreground">
        {locale === 'en' ? 'Last updated: April 2026' : 'ბოლო განახლება: 2026 წლის აპრილი'}
      </p>
      <p className="text-xs mt-1">
        <a
          href="https://www.facebook.com/profile.php?id=61566471334047"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Facebook · Pet Rescue Georgia
        </a>
      </p>
    </div>
  );
}
