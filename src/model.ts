import type { Grupa } from './data/timetable'

/** Daty zawsze jako „RRRR-MM-DD” w czasie lokalnym, godziny jako „GG:MM”. */
export type DataISO = string

export type RodzajWolnego = 'swieto' | 'przerwa' | 'ferie' | 'wakacje' | 'dyrektorski'

export const ETYKIETY_WOLNEGO: Record<RodzajWolnego, string> = {
  swieto: 'Święto',
  przerwa: 'Przerwa świąteczna',
  ferie: 'Ferie',
  wakacje: 'Wakacje',
  dyrektorski: 'Dzień dyrektorski',
}

/** Który plan jest aktywny: klasa 6G czy studia. */
export type Profil = 'szkola' | 'studia'

interface Baza {
  id: string
  utworzono: number
  zrodlo?: 'kalendarz MEN'
  /** Brak = szkoła (wpisy sprzed dodania studiów). */
  profil?: Profil
}

export interface WpisNotatka extends Baza {
  typ: 'notatka'
  data: DataISO
  lekcja: number
  grupa?: Grupa
  tekst: string
}

export interface WpisSprawdzian extends Baza {
  typ: 'sprawdzian'
  rodzaj: 'sprawdzian' | 'kartkowka'
  przedmiot: string
  data: DataISO
  /** Brak = pierwsza lekcja tego przedmiotu w danym dniu. */
  lekcja?: number
  zakres?: string
}

export interface WpisWydarzenie extends Baza {
  typ: 'wydarzenie'
  tytul: string
  od: DataISO
  do: DataISO
  godzOd?: string
  godzDo?: string
  miejsce?: string
  opis?: string
}

export interface WpisWolne extends Baza {
  typ: 'wolne'
  od: DataISO
  do: DataISO
  rodzaj: RodzajWolnego
  nazwa: string
}

export interface WpisZmiana extends Baza {
  typ: 'zmiana'
  data: DataISO
  lekcja: number
  /** Brak = cała lekcja (obie grupy). */
  grupa?: Grupa
  odwolana: boolean
  przedmiot?: string
  nauczyciel?: string
  sala?: string
}

export type Wpis = WpisNotatka | WpisSprawdzian | WpisWydarzenie | WpisWolne | WpisZmiana
export type TypWpisu = Wpis['typ']

export const NAZWY_TYPOW: Record<TypWpisu, string> = {
  notatka: 'Notatka',
  sprawdzian: 'Sprawdzian',
  wydarzenie: 'Wydarzenie',
  wolne: 'Dzień wolny',
  zmiana: 'Zmiana',
}

export type WyborGrupy = '1' | '2' | 'obie'
export type WyborLektoratu = 'ang' | 'niem' | 'oba'

export interface Ustawienia {
  profil: Profil
  grupa: WyborGrupy
  lektorat: WyborLektoratu
}

export const profilWpisu = (w: Wpis): Profil => w.profil ?? 'szkola'
