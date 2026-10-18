import { createContext, useContext } from 'react'
import type { Grupa } from './data/timetable'
import type { DataISO, TypWpisu, Ustawienia, Wpis } from './model'

/** Wstępne wartości nowego wpisu (np. po przytrzymaniu lekcji). */
export interface Szablon {
  typ: TypWpisu
  data?: DataISO
  lekcja?: number
  grupa?: Grupa
  przedmiot?: string
}

export interface PrzyciskOkna {
  id: string
  etykieta: string
  styl?: 'glowny' | 'usun' | 'zwykly'
}

export interface OpcjeOkna {
  tytul: string
  tresc?: string
  przyciski: PrzyciskOkna[]
}

export interface Kontekst {
  wpisy: Wpis[]
  ustawienia: Ustawienia
  dzis: DataISO
  zmienUstawienia(u: Ustawienia): void
  odswiez(): Promise<void>
  otworzDzien(d: DataISO): void
  nowyWpis(s: Szablon): void
  edytujWpis(w: Wpis): void
  /** Zwraca id klikniętego przycisku albo null, gdy okno zamknięto. */
  zapytaj(o: OpcjeOkna): Promise<string | null>
  komunikat(t: string): void
}

export const AppKontekst = createContext<Kontekst | null>(null)

export const useApp = () => {
  const k = useContext(AppKontekst)
  if (!k) throw new Error('Brak kontekstu aplikacji')
  return k
}
