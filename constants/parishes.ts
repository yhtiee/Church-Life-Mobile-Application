/**
 * Hardcoded list of approved Catholic parishes.
 * To be replaced with a live API call (Supabase) in a future sprint.
 */

export interface Parish {
  id: string;
  name: string;
  diocese: string;
  state: string;
  country: string;
  founded?: string | null;
  patron?: string | null;
  bishop?: string | null;
  parish_priest?: string | null;
  brief?: string | null;
  image_url?: string | null;
}

export const PARISHES: Parish[] = [
  // Lagos Archdiocese
  { id: 'p001', name: 'Holy Cross Cathedral', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p002', name: 'St. Patrick\'s Parish Ikeja', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p003', name: 'Our Lady of Fatima Parish', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p004', name: 'St. Agnes Parish Maryland', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p005', name: 'Christ the King Parish Mushin', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p006', name: 'St. Paul\'s Parish Ebute-Metta', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },
  { id: 'p007', name: 'St. Dominic\'s Parish Yaba', diocese: 'Lagos', state: 'Lagos', country: 'Nigeria' },

  // Abuja Archdiocese
  { id: 'p008', name: 'National Christian Centre Abuja', diocese: 'Abuja', state: 'FCT', country: 'Nigeria' },
  { id: 'p009', name: 'Our Lady Queen of Nigeria Pro-Cathedral', diocese: 'Abuja', state: 'FCT', country: 'Nigeria' },
  { id: 'p010', name: 'St. Michael\'s Parish Garki', diocese: 'Abuja', state: 'FCT', country: 'Nigeria' },
  { id: 'p011', name: 'Holy Trinity Parish Maitama', diocese: 'Abuja', state: 'FCT', country: 'Nigeria' },

  // Enugu Diocese
  { id: 'p012', name: 'Holy Ghost Cathedral Enugu', diocese: 'Enugu', state: 'Enugu', country: 'Nigeria' },
  { id: 'p013', name: 'St. Theresa\'s Parish Enugu', diocese: 'Enugu', state: 'Enugu', country: 'Nigeria' },
  { id: 'p014', name: 'St. John\'s Parish Nsukka', diocese: 'Enugu', state: 'Enugu', country: 'Nigeria' },

  // Onitsha Archdiocese
  { id: 'p015', name: 'All Saints Cathedral Onitsha', diocese: 'Onitsha', state: 'Anambra', country: 'Nigeria' },
  { id: 'p016', name: 'St. Joseph\'s Parish Awka', diocese: 'Onitsha', state: 'Anambra', country: 'Nigeria' },
  { id: 'p017', name: 'Our Lady of Lourdes Parish Nnewi', diocese: 'Onitsha', state: 'Anambra', country: 'Nigeria' },

  // Ibadan Archdiocese
  { id: 'p018', name: 'St. Anne\'s Cathedral Ibadan', diocese: 'Ibadan', state: 'Oyo', country: 'Nigeria' },
  { id: 'p019', name: 'Christ the King Parish Bodija', diocese: 'Ibadan', state: 'Oyo', country: 'Nigeria' },

  // Port Harcourt Diocese
  { id: 'p020', name: 'St. Ignatius Cathedral Port Harcourt', diocese: 'Port Harcourt', state: 'Rivers', country: 'Nigeria' },
  { id: 'p021', name: 'Our Lady of Perpetual Help Parish', diocese: 'Port Harcourt', state: 'Rivers', country: 'Nigeria' },

  // International
  { id: 'p022', name: 'St. Patrick\'s Cathedral New York', diocese: 'New York', state: 'New York', country: 'USA' },
  { id: 'p023', name: 'Westminster Cathedral', diocese: 'Westminster', state: 'London', country: 'UK' },
  { id: 'p024', name: 'St. Peter\'s Basilica', diocese: 'Vatican', state: 'Vatican City', country: 'Vatican' },
  { id: 'p025', name: 'Sacred Heart Parish Toronto', diocese: 'Toronto', state: 'Ontario', country: 'Canada' },
];
