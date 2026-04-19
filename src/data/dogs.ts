export interface Dog {
  id: string;
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

export const sampleDogs: Dog[] = [
  {
    id: '1',
    name: 'ბობი',
    age: '2 წელი',
    breed: 'ნარევი (ლაბრადორი)',
    gender: 'მამრობითი',
    personality: 'მეგობრული, ენერგიული, უყვარს სირბილი',
    health: 'აცრილი, სტერილიზებული, ჯანმრთელი',
    location: 'ვაკის პარკი, თბილისი',
    lat: 41.7099,
    lng: 44.7641,
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
    location: 'საბურთალო, თბილისი',
    lat: 41.7250,
    lng: 44.7400,
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
    location: 'დიდუბის მეტრო, თბილისი',
    lat: 41.7470,
    lng: 44.7900,
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
    location: 'ისანი, თბილისი',
    lat: 41.6850,
    lng: 44.8250,
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
    location: 'გლდანი, მე-9 მკრ, თბილისი',
    lat: 41.7800,
    lng: 44.8150,
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
    location: 'ნაძალადევი, თბილისი',
    lat: 41.7600,
    lng: 44.8000,
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
    location: 'ვარკეთილი III მასივი, თბილისი',
    lat: 41.6700,
    lng: 44.8700,
    photo: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=600&h=800&fit=crop',
    caretakerPhone: '+995 593 55 44 33',
    caretakerName: 'თამარი',
    description: 'მაქსი ახალგაზრდა და ენერგიული ძაღლია. ვარკეთილის III მასივში იპოვეს. სწრაფად ეჩვევა ახალ გარემოს.',
    addedDate: '2024-03-15',
  },
];
