export type Kategori = 'bugg' | 'forbattring' | 'fraga';
export type Prioritet = 'lag' | 'normal' | 'hog' | 'kritisk';
export type Miljo = 'utv' | 'test' | 'prod';

/** Det som fylls i på skapa-sidan. Tomma val är '' och tomma tal/datum är null. */
export interface NyttArende {
  titel: string;
  beskrivning: string;
  kategori: Kategori | '';
  prioritet: Prioritet;
  miljo: Miljo | '';
  kontakt: string;
  timmar: number | null;
  deadline: Date | null;
}

export const TOMT_ARENDE: NyttArende = {
  titel: '',
  beskrivning: '',
  kategori: '',
  prioritet: 'normal',
  miljo: '',
  kontakt: '',
  timmar: null,
  deadline: null,
};

export const KATEGORIER: { varde: Kategori; text: string }[] = [
  { varde: 'bugg', text: 'Bugg' },
  { varde: 'forbattring', text: 'Förbättring' },
  { varde: 'fraga', text: 'Fråga' },
];

export const PRIORITETER: { varde: Prioritet; text: string }[] = [
  { varde: 'lag', text: 'Låg' },
  { varde: 'normal', text: 'Normal' },
  { varde: 'hog', text: 'Hög' },
  { varde: 'kritisk', text: 'Kritisk' },
];

export const MILJOER: { varde: Miljo; text: string }[] = [
  { varde: 'utv', text: 'Utveckling' },
  { varde: 'test', text: 'Test' },
  { varde: 'prod', text: 'Produktion' },
];
