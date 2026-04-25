import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen pb-20 pt-4 px-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">წესები და პირობები</h1>
      </div>

      <div className="space-y-4">
        <Section title="1. ზოგადი დებულებები">
          <p className="text-primary-foreground">Pet Rescue Georgia არის არაკომერციული პლატფორმა, რომელიც მიზნად ისახავს მიუსაფარი ძაღლებისა და კატებისთვის ახალი სახლის მოძებნას. პლატფორმა მოქმედებს საქართველოს კანონმდებლობის ფარგლებში.</p>
        </Section>

        <Section title="2. ცხოველთა დაცვის კანონი">
          <p className="text-primary-foreground">საქართველოს კანონი „შინაური ცხოველების შესახებ" (2022) ადგენს ცხოველთა კეთილდღეობის სტანდარტებს. პლატფორმის მომხმარებლები ვალდებულნი არიან:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-primary-foreground">
            <li>არ მიაყენონ ცხოველს ფიზიკური ან ფსიქოლოგიური ზიანი</li>
            <li>უზრუნველყონ ცხოველის სათანადო მოვლა და კვება</li>
            <li>დროულად მიმართონ ვეტერინარს საჭიროების შემთხვევაში</li>
            <li>არ მიატოვონ ან გადააგდონ ცხოველი</li>
          </ul>
        </Section>

        <Section title="3. პერსონალური მონაცემები">
          <p className="text-primary-foreground">საქართველოს კანონი „პერსონალურ მონაცემთა დაცვის შესახებ"-ის შესაბამისად:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-primary-foreground">
            <li>საკონტაქტო ინფორმაცია ინახება მხოლოდ მომხმარებლის მოწყობილობაზე (localStorage)</li>
            <li>პლატფორმა არ აგროვებს და არ ინახავს პერსონალურ მონაცემებს სერვერზე</li>
            <li>ტელეფონის ნომრები გამოიყენება მხოლოდ ცხოველის მიკედლების მიზნით</li>
          </ul>
        </Section>

        <Section title="4. მომხმარებლის პასუხისმგებლობა">
          <ul className="list-disc pl-5 space-y-1 text-primary-foreground">
            <li>მომხმარებელი თავად არის პასუხისმგებელი ატვირთული ინფორმაციის სიზუსტეზე</li>
            <li>აკრძალულია ცრუ ან შეცდომაში შემყვანი ინფორმაციის განთავსება</li>
            <li>აკრძალულია ცხოველის კომერციული მიზნით გაყიდვის შეტყობინებების განთავსება</li>
          </ul>
        </Section>

        <Section title="5. პასუხისმგებლობის შეზღუდვა">
          <p className="text-primary-foreground">Pet Rescue Georgia:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-primary-foreground">
            <li>არ არის პასუხისმგებელი მომხმარებლებს შორის კომუნიკაციის შედეგებზე</li>
            <li>არ იძლევა გარანტიას ატვირთული ინფორმაციის სიზუსტეზე</li>
            <li>არ არის შუამავალი ან მხარე ცხოველის მიკედლების პროცესში</li>
            <li>იტოვებს უფლებას წაშალოს შეუფერებელი კონტენტი</li>
          </ul>
        </Section>

        <Section title="6. ინტელექტუალური საკუთრება">
          <p className="text-primary-foreground">Pet Rescue Georgia-ის დიზაინი, ლოგო და კონტენტი დაცულია საქართველოს საავტორო უფლებების კანონმდებლობით. მომხმარებლების მიერ ატვირთული ფოტოები რჩება მათ საკუთრებაში.</p>
        </Section>

        <Section title="7. დავების გადაწყვეტა">
          <p className="text-primary-foreground">ნებისმიერი დავა, რომელიც წარმოიშვება პლატფორმის გამოყენებასთან დაკავშირებით, წყდება საქართველოს კანონმდებლობის შესაბამისად, თბილისის საქალაქო სასამართლოში.</p>
        </Section>

        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-primary-foreground">ბოლო განახლება: 2026 წლის აპრილი</p>
          <p className="text-xs mt-1 text-primary-foreground">
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
