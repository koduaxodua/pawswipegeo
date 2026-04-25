export type Species = 'dog' | 'cat';

export interface Dog {
  id: string;
  species?: Species;
  name: string;
  age: string;
  breed: string;
  gender: 'მამრობითი' | 'მდედრობითი';
  personality: string;
  health: string;
  location: string;
  lat?: number;
  lng?: number;
  photo: string;
  caretakerPhone: string;
  caretakerName: string;
  description: string;
  addedDate: string;
}

interface PetRow {
  id: string;
  species: Species;
  name: string;
  age: string | null;
  breed: string | null;
  gender: 'მამრობითი' | 'მდედრობითი' | null;
  personality: string | null;
  health: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string;
  caretaker_phone: string;
  caretaker_name: string | null;
  description: string | null;
  created_at: string;
}

export const petRowToDog = (r: PetRow): Dog => ({
  id: r.id,
  species: r.species,
  name: r.name,
  age: r.age ?? '',
  breed: r.breed ?? '',
  gender: r.gender ?? 'მამრობითი',
  personality: r.personality ?? '',
  health: r.health ?? '',
  location: r.location ?? '',
  lat: r.lat ?? undefined,
  lng: r.lng ?? undefined,
  photo: r.photo_url,
  caretakerPhone: r.caretaker_phone,
  caretakerName: r.caretaker_name ?? '',
  description: r.description ?? '',
  addedDate: r.created_at.slice(0, 10),
});

export const sampleDogs: Dog[] = [
  {
    id: '1',
    name: 'ბობი',
    age: '2 წელი',
    breed: 'ნარევი (ლაბრადორი)',
    gender: 'მამრობითი',
    personality: 'მეგობრული, ენერგიული, უყვარს სირბილი',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'ილია ჭავჭავაძის გამზ. 37, თბილისი',
    lat: 41.7095,
    lng: 44.7589,
    photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop',
    caretakerPhone: '+995 555 12 34 56',
    caretakerName: 'ნინო',
    description: 'ბობი ძალიან მეგობრული ძაღლია, რომელიც ვაკის პარკთან იპოვეს. უყვარს ბავშვები და სხვა ძაღლებთან თამაში.',
    addedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'ლუნა',
    age: '1.5 წელი',
    breed: 'ნარევი (შეფერდი)',
    gender: 'მდედრობითი',
    personality: 'მშვიდი, ერთგული, დამცველი',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'ვაჟა-ფშაველას გამზ. 76, თბილისი',
    lat: 41.7269,
    lng: 44.7445,
    photo: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=600&h=800&fit=crop',
    caretakerPhone: '+995 577 98 76 54',
    caretakerName: 'გიორგი',
    description: 'ლუნა მშვიდი და ერთგული ძაღლია. საბურთალოს ბაზართან მიკედლებული იყო. იდეალურია ოჯახისთვის.',
    addedDate: '2024-02-20',
  },
  {
    id: '3',
    name: 'ჩარლი',
    age: '3 წელი',
    breed: 'ნარევი (ჰასკი)',
    gender: 'მამრობითი',
    personality: 'თავგადასავლის მოყვარული, სათამაშო',
    health: 'აცრილი, ჯანმრთელი',
    location: 'აკაკი წერეთლის გამზ. 116, თბილისი',
    lat: 41.7488,
    lng: 44.7912,
    photo: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=800&fit=crop',
    caretakerPhone: '+995 599 11 22 33',
    caretakerName: 'მარიამ',
    description: 'ჩარლი ენერგიული ძაღლია, რომელსაც სეირნობა და სირბილი უყვარს. დიდუბის მეტროსთან იპოვეს.',
    addedDate: '2024-03-01',
  },
  {
    id: '4',
    name: 'მოლი',
    age: '8 თვე',
    breed: 'ნარევი',
    gender: 'მდედრობითი',
    personality: 'ცნობისმოყვარე, სანდო, მოფერება უყვარს',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'ქეთევან წამებულის გამზ. 52, თბილისი',
    lat: 41.6864,
    lng: 44.8276,
    photo: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=800&fit=crop',
    caretakerPhone: '+995 551 44 55 66',
    caretakerName: 'ლევანი',
    description: 'მოლი ლეკვია, რომელიც ისანში იპოვეს. ძალიან სანდო და მოსიყვარულე ხასიათი აქვს.',
    addedDate: '2024-03-10',
  },
  {
    id: '5',
    name: 'რექსი',
    age: '4 წელი',
    breed: 'ნარევი (კავკასიური)',
    gender: 'მამრობითი',
    personality: 'დამცველი, ერთგული, მამაცი',
    health: 'აცრილი, ჯანმრთელი, მცირე ნაწიბური წინა ფეხზე',
    location: 'ომარ ხიზანიშვილის ქ. 24, გლდანი, თბილისი',
    lat: 41.7812,
    lng: 44.8169,
    photo: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc8f9b?w=600&h=800&fit=crop',
    caretakerPhone: '+995 598 77 88 99',
    caretakerName: 'დავითი',
    description: 'რექსი დიდი და ერთგული ძაღლია. გლდანის მე-9 მიკრორაიონში ცხოვრობდა. კარგი დამცველია.',
    addedDate: '2024-02-05',
  },
  {
    id: '6',
    name: 'ბელა',
    age: '2.5 წელი',
    breed: 'ნარევი (სპანიელი)',
    gender: 'მდედრობითი',
    personality: 'ნაზი, მორჩილი, ბავშვების მოყვარული',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'წინანდლის ქ. 9, ნაძალადევი, თბილისი',
    lat: 41.7585,
    lng: 44.7986,
    photo: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=800&fit=crop',
    caretakerPhone: '+995 557 33 22 11',
    caretakerName: 'ანა',
    description: 'ბელა ნაზი და მშვიდი ძაღლია. ნაძალადევის ბაღთან მიკედლებული იყო. ბავშვებთან განსაკუთრებით კარგად იქცევა.',
    addedDate: '2024-01-28',
  },
  {
    id: '7',
    name: 'მაქსი',
    age: '1 წელი',
    breed: 'ნარევი',
    gender: 'მამრობითი',
    personality: 'ხალისიანი, სწრაფად სწავლობს, სათამაშო',
    health: 'აცრილი, ჯანმრთელი',
    location: 'ჯავახეთის ქ. 31, ვარკეთილი, თბილისი',
    lat: 41.6712,
    lng: 44.8693,
    photo: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600&h=800&fit=crop',
    caretakerPhone: '+995 593 55 44 33',
    caretakerName: 'თამარი',
    description: 'მაქსი ახალგაზრდა და ენერგიული ძაღლია. ვარკეთილის III მასივში იპოვეს. სწრაფად ეჩვევა ახალ გარემოს.',
    addedDate: '2024-03-15',
  },
  {
    id: '8',
    name: 'ნელა',
    age: '3 წელი',
    breed: 'ნარევი (ბორდერ კოლი)',
    gender: 'მდედრობითი',
    personality: 'ჭკვიანი, აქტიური, ერთგული',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'რუსთაველის გამზ. 14, თბილისი',
    lat: 41.6975,
    lng: 44.7993,
    photo: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&h=800&fit=crop',
    caretakerPhone: '+995 595 22 33 44',
    caretakerName: 'სოფო',
    description: 'ნელა ძალიან ჭკვიანი ძაღლია, რომელიც რუსთაველზე იპოვეს. სწრაფად სწავლობს ახალ ბრძანებებს.',
    addedDate: '2024-03-20',
  },
  {
    id: '9',
    name: 'ტობი',
    age: '5 წელი',
    breed: 'ნარევი (ტერიერი)',
    gender: 'მამრობითი',
    personality: 'მშვიდი, ერთგული, კარგი კომპანიონი',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'აღმაშენებლის გამზ. 95, თბილისი',
    lat: 41.7176,
    lng: 44.7995,
    photo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=800&fit=crop',
    caretakerPhone: '+995 577 66 55 44',
    caretakerName: 'ირაკლი',
    description: 'ტობი ხნიერი, მაგრამ ჯერ კიდევ აქტიური ძაღლია. აღმაშენებლის გამზირზე ცხოვრობდა. იდეალურია მშვიდი ოჯახისთვის.',
    addedDate: '2024-03-25',
  },
];
