// Plan zajęć na studiach: Psychologia sądowa, studia jednolite magisterskie, 7 semestr, grupa Ćw1N.
// Źródło: „Plan lekcji 4 rok.md” (eksport z systemu uczelni), semestr zimowy 2026/2027.
// Studia są zjazdowe, więc plan to lista konkretnych dat, a nie tygodniowy rozkład.

export type Forma = 'wyk' | 'cw' | 'lekt' | 'sem'
export type Lektorat = 'ang' | 'niem'

export const FORMY: Record<Forma, string> = {
  wyk: 'wykład',
  cw: 'ćwiczenia',
  lekt: 'lektorat',
  sem: 'seminarium',
}

export const ZALICZENIA = {
  egzamin: 'egzamin',
  ocena: 'zaliczenie na ocenę',
  nd: '',
} as const

interface Kurs {
  przedmiot: string
  forma: Forma
  prowadzacy: string
  zaliczenie: keyof typeof ZALICZENIA
  /** Lektoraty są dwa (angielski i niemiecki); w ustawieniach wybierasz swój. */
  lektorat?: Lektorat
}

const BIEGLY = 'Psycholog jako biegły sądowy'
const PATOLOGIA = 'Patologia małżeństwa i rodziny'
const STATYSTYKA = 'Statystyka z wykorzystaniem komputerów i zaawansowana metodologia badań psychologicznych'
const PSYCHOPATOLOGIA = 'Psychopatologia dzieci i młodzieży'
const WARSZTATY = 'Warsztaty kompetencji językowych 2'

const K = {
  tutor: { przedmiot: 'Zajęcia z tutorem', forma: 'cw', prowadzacy: 'mgr Anna Biełowicz', zaliczenie: 'nd' },
  praktyki: {
    przedmiot: 'Wprowadzenie do praktyki specjalnościowej 1 – PS',
    forma: 'cw',
    prowadzacy: 'mgr Nadia Litwin',
    zaliczenie: 'nd',
  },
  bieglyWyk: { przedmiot: BIEGLY, forma: 'wyk', prowadzacy: 'dr Marta Jastrzębska', zaliczenie: 'egzamin' },
  bieglyCw: { przedmiot: BIEGLY, forma: 'cw', prowadzacy: 'kpt. mgr Kamila Ziobrowska', zaliczenie: 'ocena' },
  patologiaWyk: { przedmiot: PATOLOGIA, forma: 'wyk', prowadzacy: 'dr Joanna Szymańska', zaliczenie: 'egzamin' },
  patologiaCw: { przedmiot: PATOLOGIA, forma: 'cw', prowadzacy: 'mgr Aleksandra Malisz', zaliczenie: 'ocena' },
  statWyk: { przedmiot: STATYSTYKA, forma: 'wyk', prowadzacy: 'dr Ewelina Cichoń', zaliczenie: 'egzamin' },
  statCw: { przedmiot: STATYSTYKA, forma: 'cw', prowadzacy: 'mgr Paweł Oczeretko', zaliczenie: 'ocena' },
  psychopWyk: { przedmiot: PSYCHOPATOLOGIA, forma: 'wyk', prowadzacy: 'dr Edyta Żyła-Kania', zaliczenie: 'egzamin' },
  psychopCw: { przedmiot: PSYCHOPATOLOGIA, forma: 'cw', prowadzacy: 'dr Karolina Klimkiewicz', zaliczenie: 'ocena' },
  jakosciowa: {
    przedmiot: 'Praca empiryczna w metodologii jakościowej',
    forma: 'cw',
    prowadzacy: 'dr Marta Melka-Roszczyk',
    zaliczenie: 'ocena',
  },
  przemoc: {
    przedmiot: 'Społeczne konteksty przemocy i innych przestępstw',
    forma: 'cw',
    prowadzacy: 'mgr Alicja Sarba',
    zaliczenie: 'ocena',
  },
  seminarium: { przedmiot: 'Seminarium magisterskie 1', forma: 'sem', prowadzacy: 'dr Marta Melka-Roszczyk', zaliczenie: 'ocena' },
  ang: { przedmiot: WARSZTATY, forma: 'lekt', prowadzacy: 'mgr Nataliia Izviekova', zaliczenie: 'egzamin', lektorat: 'ang' },
  niem: { przedmiot: WARSZTATY, forma: 'lekt', prowadzacy: 'mgr Beata Janczewska', zaliczenie: 'egzamin', lektorat: 'niem' },
} satisfies Record<string, Kurs>

type KodKursu = keyof typeof K

/** [data, od, do, kurs, sala] — sala „online” = zajęcia zdalne, '' = plan nie podaje sali. */
type Wiersz = [string, string, string, KodKursu, string]

const ON = 'online'

const WIERSZE: Wiersz[] = [
  // 19.09 sobota
  ['2026-09-19', '09:45', '10:30', 'tutor', ON],
  ['2026-09-19', '10:45', '12:15', 'bieglyWyk', ON],
  ['2026-09-19', '12:30', '14:00', 'bieglyWyk', ON],
  ['2026-09-19', '14:15', '15:45', 'patologiaWyk', ON],
  ['2026-09-19', '16:45', '18:30', 'praktyki', ON],
  // 20.09 niedziela
  ['2026-09-20', '09:00', '10:30', 'jakosciowa', 'S55 410'],
  ['2026-09-20', '10:45', '12:15', 'jakosciowa', 'S55 410'],
  ['2026-09-20', '12:30', '14:00', 'bieglyCw', 'S55 410'],
  ['2026-09-20', '14:15', '15:45', 'bieglyCw', 'S55 410'],
  // 02.10 piątek
  ['2026-10-02', '17:00', '18:30', 'niem', ON],
  // 03.10 sobota
  ['2026-10-03', '09:00', '10:30', 'bieglyWyk', ON],
  ['2026-10-03', '10:45', '12:15', 'patologiaWyk', ON],
  ['2026-10-03', '12:30', '14:00', 'patologiaWyk', ON],
  ['2026-10-03', '14:15', '15:45', 'statWyk', ON],
  ['2026-10-03', '16:00', '17:30', 'statWyk', ON],
  ['2026-10-03', '17:45', '19:15', 'ang', ON],
  // 04.10 niedziela
  ['2026-10-04', '09:00', '10:30', 'seminarium', ON],
  ['2026-10-04', '12:30', '14:00', 'psychopWyk', ON],
  ['2026-10-04', '14:15', '15:45', 'psychopWyk', ON],
  ['2026-10-04', '16:00', '17:30', 'psychopCw', ON],
  // 17.10 sobota
  ['2026-10-17', '09:00', '10:30', 'psychopWyk', ON],
  ['2026-10-17', '10:45', '12:15', 'psychopWyk', ON],
  ['2026-10-17', '12:30', '14:00', 'statWyk', ON],
  ['2026-10-17', '14:15', '15:45', 'statWyk', ON],
  ['2026-10-17', '16:00', '17:30', 'bieglyWyk', ON],
  ['2026-10-17', '17:45', '19:15', 'bieglyWyk', ON],
  // 18.10 niedziela
  ['2026-10-18', '09:00', '10:30', 'jakosciowa', 'Z71 28 (R)'],
  ['2026-10-18', '10:45', '12:15', 'jakosciowa', 'Z71 28 (R)'],
  ['2026-10-18', '12:30', '14:00', 'psychopCw', 'Z71 28 (R)'],
  ['2026-10-18', '14:15', '15:45', 'psychopCw', 'Z71 28 (R)'],
  ['2026-10-18', '16:00', '17:30', 'ang', 'Z71 28 (R)'],
  ['2026-10-18', '17:45', '19:15', 'ang', 'Z71 28 (R)'],
  // 23.10 piątek
  ['2026-10-23', '17:00', '18:30', 'niem', ON],
  ['2026-10-23', '18:45', '20:15', 'niem', ON],
  // 06.11 piątek
  ['2026-11-06', '17:00', '18:30', 'seminarium', ON],
  // 07.11 sobota
  ['2026-11-07', '09:00', '10:30', 'przemoc', 'F14 B9'],
  ['2026-11-07', '10:45', '12:15', 'przemoc', 'F14 B9'],
  ['2026-11-07', '12:30', '14:00', 'statCw', 'F14 B15'],
  ['2026-11-07', '14:15', '15:45', 'statCw', 'F14 B15'],
  ['2026-11-07', '16:00', '17:30', 'bieglyCw', 'F14 B16'],
  ['2026-11-07', '17:45', '19:15', 'bieglyCw', 'F14 B16'],
  // 08.11 niedziela (plan nie podaje sal)
  ['2026-11-08', '09:00', '10:30', 'jakosciowa', ''],
  ['2026-11-08', '10:45', '12:15', 'jakosciowa', ''],
  ['2026-11-08', '12:30', '14:00', 'ang', ''],
  ['2026-11-08', '14:15', '15:45', 'ang', ''],
  ['2026-11-08', '16:00', '17:30', 'psychopCw', ''],
  ['2026-11-08', '17:45', '19:15', 'psychopCw', ''],
  // 20.11 piątek
  ['2026-11-20', '18:45', '20:15', 'seminarium', ON],
  // 21.11 sobota (plan nie podaje sal)
  ['2026-11-21', '09:00', '10:30', 'przemoc', ''],
  ['2026-11-21', '10:45', '12:15', 'przemoc', ''],
  ['2026-11-21', '12:30', '14:00', 'patologiaCw', ''],
  ['2026-11-21', '14:15', '15:45', 'patologiaCw', ''],
  ['2026-11-21', '16:00', '17:30', 'ang', ''],
  // 22.11 niedziela
  ['2026-11-22', '09:00', '10:30', 'bieglyCw', 'F14 C14'],
  ['2026-11-22', '10:45', '12:15', 'bieglyCw', 'F14 C14'],
  ['2026-11-22', '12:30', '14:00', 'statCw', 'F14 B15'],
  ['2026-11-22', '14:15', '15:45', 'statCw', 'F14 B15'],
  // 04.12 piątek
  ['2026-12-04', '17:00', '18:30', 'niem', ON],
  ['2026-12-04', '18:45', '20:15', 'niem', ON],
  // 18.12 piątek
  ['2026-12-18', '17:00', '18:30', 'seminarium', ON],
  // 19.12 sobota
  ['2026-12-19', '09:00', '10:30', 'patologiaCw', 'F14 C14'],
  ['2026-12-19', '10:45', '12:15', 'patologiaCw', 'F14 C14'],
  ['2026-12-19', '12:30', '14:00', 'statCw', 'F14 C4 (laptopowa)'],
  ['2026-12-19', '14:15', '15:45', 'statCw', 'F14 C4 (laptopowa)'],
  // 20.12 niedziela
  ['2026-12-20', '09:00', '10:30', 'psychopWyk', ON],
  ['2026-12-20', '10:45', '12:15', 'psychopWyk', ON],
  ['2026-12-20', '12:30', '14:00', 'patologiaWyk', ON],
  ['2026-12-20', '14:15', '15:45', 'patologiaWyk', ON],
  // 08.01 piątek
  ['2027-01-08', '16:45', '18:30', 'niem', ON],
  ['2027-01-08', '18:45', '20:15', 'niem', ON],
  // 15.01 piątek
  ['2027-01-15', '18:45', '20:15', 'seminarium', ON],
  // 16.01 sobota (plan nie podaje sal)
  ['2027-01-16', '09:00', '10:30', 'patologiaCw', ''],
  ['2027-01-16', '10:45', '12:15', 'patologiaCw', ''],
  ['2027-01-16', '12:30', '14:00', 'ang', ''],
  ['2027-01-16', '14:15', '15:45', 'ang', ''],
  // 17.01 niedziela (plan nie podaje sal)
  ['2027-01-17', '10:45', '12:15', 'bieglyCw', ''],
  ['2027-01-17', '12:30', '14:00', 'przemoc', ''],
  ['2027-01-17', '14:15', '15:45', 'przemoc', ''],
  ['2027-01-17', '16:00', '17:30', 'psychopCw', ''],
  ['2027-01-17', '17:45', '19:15', 'psychopCw', ''],
  // 29.01 piątek (lektorat niemiecki i seminarium w planie o tej samej godzinie)
  ['2027-01-29', '17:00', '18:30', 'niem', ON],
  ['2027-01-29', '17:00', '18:30', 'seminarium', ON],
  // 30.01 sobota
  ['2027-01-30', '09:00', '10:30', 'statWyk', ON],
  ['2027-01-30', '10:45', '12:15', 'statWyk', ON],
  ['2027-01-30', '14:15', '15:45', 'psychopWyk', ON],
  ['2027-01-30', '16:00', '17:30', 'bieglyWyk', ON],
  ['2027-01-30', '17:45', '19:15', 'bieglyWyk', ON],
  // 31.01 niedziela
  ['2027-01-31', '14:15', '15:45', 'patologiaWyk', ON],
]

export interface ZajeciaStudia extends Kurs {
  data: string
  od: string
  do: string
  sala: string
  online: boolean
}

export const ZAJECIA_STUDIA: ZajeciaStudia[] = WIERSZE.map(([data, od, doGodz, kod, sala]) => ({
  ...(K[kod] as Kurs),
  data,
  od,
  do: doGodz,
  sala: sala === ON ? '' : sala,
  online: sala === ON,
})).sort((a, b) => (a.data + a.od).localeCompare(b.data + b.od))

export const NAZWA_STUDIOW = 'Ps. sądowa · 7 sem.'

export const PRZEDMIOTY_STUDIA: string[] = Array.from(new Set(ZAJECIA_STUDIA.map((z) => z.przedmiot))).sort((a, b) =>
  a.localeCompare(b, 'pl'),
)

/** Daty zjazdów (dni z zajęciami), rosnąco. */
export const DNI_ZAJEC_STUDIA: string[] = Array.from(new Set(ZAJECIA_STUDIA.map((z) => z.data)))
