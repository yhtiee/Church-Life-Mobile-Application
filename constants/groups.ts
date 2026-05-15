/**
 * Church Group definitions and metadata.
 */

export type GroupType = 'open' | 'secured';

export interface ChurchGroup {
  id: string;
  name: string;
  shortName: string;
  description: string;
  type: GroupType;
  minAge?: number;
  maxAge?: number;
  icon: string; // Ionicons name
  color: string;
}

export const OPEN_GROUPS: ChurchGroup[] = [
  {
    id: 'cmo',
    name: 'Catholic Men Organization',
    shortName: 'CMO',
    description: 'A fraternal organization for Catholic men committed to serving the Church, their families, and the community through faith, works, and charity.',
    type: 'open',
    minAge: 18,
    icon: 'man-outline',
    color: '#1D3557',
  },
  {
    id: 'cwo',
    name: 'Catholic Women Organization',
    shortName: 'CWO',
    description: 'An association of Catholic women dedicated to the spiritual, social, and economic development of women in the Church and society.',
    type: 'open',
    minAge: 18,
    icon: 'woman-outline',
    color: '#3F51B5',
  },
  {
    id: 'cyon',
    name: 'Catholic Youth Organization of Nigeria',
    shortName: 'CYON',
    description: 'The youth wing of the Catholic Church in Nigeria, fostering spiritual growth, leadership, and community engagement among young Catholics.',
    type: 'open',
    minAge: 13,
    maxAge: 35,
    icon: 'people-outline',
    color: '#D4AF37',
  },
  {
    id: 'hca',
    name: 'Holy Childhood Association',
    shortName: 'HCA',
    description: 'A missionary movement for children, helping them to pray, sacrifice, and give to their peers in mission territories.',
    type: 'open',
    maxAge: 12,
    icon: 'star-outline',
    color: '#27AE60',
  },
];

export const SECURED_GROUPS: ChurchGroup[] = [
  {
    id: 'harvest',
    name: 'Harvest Committee',
    shortName: 'Harvest',
    description: 'Responsible for organizing the annual harvest and fundraising events for the parish.',
    type: 'secured',
    icon: 'leaf-outline',
    color: '#D4AF37',
  },
  {
    id: 'finance',
    name: 'Parish Finance Committee',
    shortName: 'Finance',
    description: 'Oversees the financial planning, budgeting, and accountability of parish funds and resources.',
    type: 'secured',
    icon: 'cash-outline',
    color: '#1D3557',
  },
  {
    id: 'laity',
    name: 'Laity Council',
    shortName: 'Laity',
    description: 'The central advisory body of the laity, coordinating activities between all parish groups and the parish priest.',
    type: 'secured',
    icon: 'shield-outline',
    color: '#3F51B5',
  },
];

export const ALL_GROUPS = [...OPEN_GROUPS, ...SECURED_GROUPS];
