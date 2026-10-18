// Plan lekcji klasy 6G, rok szkolny 2026/2027.
// Aby coś zmienić, edytuj tablicę PLAN poniżej i przebuduj aplikację.

export type Grupa = 1 | 2

export interface Zajecia {
  przedmiot: string
  nauczyciel: string
  sala: string
  /** Brak = cała klasa. */
  grupa?: Grupa
  swietlica?: boolean
}

/** Jedna lekcja w planie: zajęcia całej klasy, dwie grupy albo świetlica. */
export type Slot = Zajecia[]

export interface Godzina {
  nr: number
  od: string
  do: string
}

export const GODZINY: Godzina[] = [
  { nr: 1, od: '08:00', do: '08:45' },
  { nr: 2, od: '08:55', do: '09:40' },
  { nr: 3, od: '09:50', do: '10:35' },
  { nr: 4, od: '10:45', do: '11:30' },
  { nr: 5, od: '11:40', do: '12:25' },
  { nr: 6, od: '12:45', do: '13:30' },
  { nr: 7, od: '13:50', do: '14:35' },
  { nr: 8, od: '14:55', do: '15:40' },
]

export const SALA_SWIETLICY = '2'

const L = (przedmiot: string, nauczyciel: string, sala: string): Slot => [{ przedmiot, nauczyciel, sala }]
const GR = (gr1: [string, string, string], gr2: [string, string, string]): Slot => [
  { przedmiot: gr1[0], nauczyciel: gr1[1], sala: gr1[2], grupa: 1 },
  { przedmiot: gr2[0], nauczyciel: gr2[1], sala: gr2[2], grupa: 2 },
]
const SW: Slot = [{ przedmiot: 'Świetlica', nauczyciel: '', sala: SALA_SWIETLICY, swietlica: true }]

const POLSKI = 'Język polski'
const ANG = 'Język angielski'
const MAT = 'Matematyka'
const HIST = 'Historia'

const SOWA = 'K. Sowa-Bakuła'
const MICHALOWSKA = 'W. Michałowska'
const KIERDAL = 'E. Kierdal'
const SLUPIANEK = 'M. Słupianek'
const NIEMIER = 'T. Niemier'
const WODNIK = 'A. Wodnik'
const HAYAJNEH = 'M. Niedźwiecka-Hayajneh'

export const DNI_TYGODNIA = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'] as const

/** PLAN[dzień 0 = poniedziałek][lekcja 0 = pierwsza] */
export const PLAN: Slot[][] = [
  // Poniedziałek
  [
    L(POLSKI, SOWA, '130'),
    GR(['WF', 'M. Jakubaszek', 'gim 2'], [ANG, SLUPIANEK, '224']),
    L('Plastyka', 'E. Kowalczyk', '134'),
    L(MAT, MICHALOWSKA, '204'),
    L('Technika', 'A. Olkowska', '134'),
    SW,
    SW,
    SW,
  ],
  // Wtorek
  [
    SW,
    L('Biologia', 'A. Marciszak', '136'),
    GR([ANG, KIERDAL, '113'], ['WF', NIEMIER, 'P1']),
    GR(['WF', WODNIK, 'gim 1'], ['WF', NIEMIER, 'P1']),
    L(MAT, MICHALOWSKA, '130'),
    SW,
    SW,
    SW,
  ],
  // Środa
  [
    L(POLSKI, SOWA, '135'),
    L(HIST, HAYAJNEH, '224'),
    L('Edukacja zdrowotna', 'E. Niedzielska', '118'),
    GR(['Informatyka', 'P. Darski', '234k'], [ANG, SLUPIANEK, '114']),
    GR([ANG, KIERDAL, '118'], ['Informatyka', 'M. Gałązka', '203k']),
    SW,
    SW,
    SW,
  ],
  // Czwartek
  [
    L(POLSKI, SOWA, '127'),
    L(POLSKI, SOWA, '127'),
    L(MAT, MICHALOWSKA, '132'),
    GR([ANG, KIERDAL, '126'], ['WF', NIEMIER, 'h105']),
    L(HIST, HAYAJNEH, '135'),
    SW,
    SW,
    SW,
  ],
  // Piątek
  [
    L(POLSKI, SOWA, '135'),
    L(MAT, MICHALOWSKA, '135'),
    L('Muzyka', 'S. Gonera', '227'),
    GR(['WF', WODNIK, 'h105'], [ANG, SLUPIANEK, '114']),
    GR(['WF', WODNIK, 'h105'], ['WF', NIEMIER, 'P1']),
    L('Geografia', 'A. Kędzierska', '232'),
    SW,
    SW,
  ],
]

/** Wszystkie przedmioty z planu (bez świetlicy), alfabetycznie. */
export const PRZEDMIOTY: string[] = Array.from(
  new Set(PLAN.flat(2).filter((z) => !z.swietlica).map((z) => z.przedmiot)),
).sort((a, b) => a.localeCompare(b, 'pl'))
