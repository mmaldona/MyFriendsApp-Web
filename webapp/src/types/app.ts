export interface Note {
  id: string;
  content: string;
  timestamp: number;
}

export interface PhoneNumber {
  id: string;
  number: string;
  label: string;
  timestamp: number;
}

export interface Person {
  id: string;
  name: string;
  partnerName?: string;
  photoUri?: string;
  photoBase64?: string;
  notes?: string;
  noteHistory: Note[];
  phoneNumbers: PhoneNumber[];
  groupId: string;
  createdAt: number;
  lastUpdated: number;
  deletedAt?: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  deletedAt?: number;
  order?: number;
}
