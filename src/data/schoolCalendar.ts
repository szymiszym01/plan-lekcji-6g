// Kalendarz roku szkolnego 2026/2027 (województwo dolnośląskie).
// Te dni są wczytywane przy pierwszym uruchomieniu jako wpisy „Dzień wolny”
// i można je potem edytować lub usuwać w aplikacji.

import type { RodzajWolnego } from '../model'

export const ROK_SZKOLNY = '2026/2027'
export const POCZATEK_ZAJEC = '2026-09-01'
export const KONIEC_ZAJEC = '2027-06-25'

export interface DzienWolnyMEN {
  od: string
  do: string
  rodzaj: RodzajWolnego
  nazwa: string
}

export const DNI_WOLNE_MEN: DzienWolnyMEN[] = [
  { od: '2026-10-14', do: '2026-10-14', rodzaj: 'swieto', nazwa: 'Dzień Edukacji Narodowej' },
  { od: '2026-11-11', do: '2026-11-11', rodzaj: 'swieto', nazwa: 'Narodowe Święto Niepodległości' },
  { od: '2026-12-23', do: '2026-12-31', rodzaj: 'przerwa', nazwa: 'Zimowa przerwa świąteczna' },
  { od: '2027-01-01', do: '2027-01-01', rodzaj: 'swieto', nazwa: 'Nowy Rok' },
  { od: '2027-01-06', do: '2027-01-06', rodzaj: 'swieto', nazwa: 'Święto Trzech Króli' },
  { od: '2027-01-18', do: '2027-01-31', rodzaj: 'ferie', nazwa: 'Ferie zimowe' },
  { od: '2027-03-25', do: '2027-03-30', rodzaj: 'przerwa', nazwa: 'Wiosenna przerwa świąteczna' },
  { od: '2027-05-03', do: '2027-05-03', rodzaj: 'swieto', nazwa: 'Święto Konstytucji 3 Maja' },
  { od: '2027-05-27', do: '2027-05-27', rodzaj: 'swieto', nazwa: 'Boże Ciało' },
  { od: '2027-06-26', do: '2027-08-31', rodzaj: 'wakacje', nazwa: 'Wakacje' },
]
