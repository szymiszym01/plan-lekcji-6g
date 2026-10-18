import { KONIEC_ZAJEC, POCZATEK_ZAJEC } from '../data/schoolCalendar'
import { DNI_ZAJEC_STUDIA, FORMY, ZAJECIA_STUDIA, ZALICZENIA } from '../data/studia'
import { GODZINY, PLAN, type Zajecia } from '../data/timetable'
import type {
  DataISO, Ustawienia, WyborGrupy, Wpis, WpisNotatka, WpisSprawdzian, WpisWolne, WpisWydarzenie, WpisZmiana,
} from '../model'
import { dodajDni, dzienTygodnia, roznicaDni, wZakresie } from './dates'

export interface ZajeciaWidok extends Zajecia {
  odwolana?: boolean
  /** Wpis zmiany, który zmodyfikował te zajęcia (odwołanie lub zastępstwo). */
  zmiana?: WpisZmiana
}

export interface LekcjaWidok {
  nr: number
  od: string
  do: string
  swietlica: boolean
  zajecia: ZajeciaWidok[]
  wpisy: (WpisNotatka | WpisSprawdzian)[]
}

export type StanDnia =
  | { rodzaj: 'przed' }
  | { rodzaj: 'po'; wolne?: WpisWolne }
  | { rodzaj: 'wolne'; wolne: WpisWolne }
  | { rodzaj: 'weekend' }
  /** Studia: dzień bez zajęć. */
  | { rodzaj: 'brak' }
  | { rodzaj: 'lekcje'; lekcje: LekcjaWidok[] }

export interface Dzien {
  data: DataISO
  stan: StanDnia
  wydarzenia: WpisWydarzenie[]
  /** Notatki i sprawdziany, których nie da się przypiąć do lekcji w tym dniu. */
  luzne: (WpisNotatka | WpisSprawdzian)[]
  /** Wszystkie wpisy dotyczące dnia (do kropek w kalendarzu). */
  wszystkie: Wpis[]
}

export const dotyczyDnia = (w: Wpis, data: DataISO) =>
  w.typ === 'wydarzenie' || w.typ === 'wolne' ? wZakresie(data, w.od, w.do) : w.data === data

/** Najkrótszy dzień wolny obejmujący datę (np. święto w środku ferii wygrywa z feriami). */
export function wolneW(data: DataISO, wpisy: Wpis[]): WpisWolne | undefined {
  let wynik: WpisWolne | undefined
  for (const w of wpisy)
    if (
      w.typ === 'wolne' &&
      wZakresie(data, w.od, w.do) &&
      (!wynik || roznicaDni(w.od, w.do) < roznicaDni(wynik.od, wynik.do))
    )
      wynik = w
  return wynik
}

const widocznaGrupa = (z: Zajecia, grupa: WyborGrupy) => !z.grupa || grupa === 'obie' || String(z.grupa) === grupa

function zastosujZmiany(nr: number, zajecia: Zajecia[], zmiany: WpisZmiana[]): ZajeciaWidok[] {
  const naLekcje = zmiany.filter((z) => z.lekcja === nr)
  const calaLekcja = naLekcje.find((z) => z.grupa == null)
  if (calaLekcja && !calaLekcja.odwolana) {
    const wzor = zajecia[0]
    return [{
      przedmiot: calaLekcja.przedmiot || wzor.przedmiot,
      nauczyciel: calaLekcja.nauczyciel ?? wzor.nauczyciel,
      sala: calaLekcja.sala || wzor.sala,
      online: calaLekcja.sala ? false : wzor.online,
      forma: wzor.forma,
      zmiana: calaLekcja,
    }]
  }
  return zajecia.map((z) => {
    const zm = calaLekcja ?? naLekcje.find((x) => x.grupa === z.grupa)
    if (!zm) return z
    if (zm.odwolana) return { ...z, odwolana: true, zmiana: zm }
    return {
      ...z,
      przedmiot: zm.przedmiot || z.przedmiot,
      nauczyciel: zm.nauczyciel || z.nauczyciel,
      sala: zm.sala || z.sala,
      online: zm.sala ? false : z.online,
      swietlica: zm.przedmiot ? false : z.swietlica,
      zmiana: zm,
    }
  })
}

/** Zajęcia na studiach w danym dniu (po filtrze lektoratu), jako sloty jednego dnia. */
function slotyStudiow(data: DataISO, u: Ustawienia) {
  return ZAJECIA_STUDIA.filter(
    (z) => z.data === data && (!z.lektorat || u.lektorat === 'oba' || z.lektorat === u.lektorat),
  ).map((z, i) => ({
    nr: i + 1,
    od: z.od,
    do: z.do,
    zajecia: [{
      przedmiot: z.przedmiot,
      nauczyciel: [z.prowadzacy, ZALICZENIA[z.zaliczenie]].filter(Boolean).join(' · '),
      sala: z.sala,
      online: z.online,
      forma: FORMY[z.forma],
    }] as Zajecia[],
  }))
}

/** Lekcje z planu na dany dzień, z filtrem grupy i zmianami (bez sprawdzania dni wolnych). */
export function lekcjeDnia(data: DataISO, wpisy: Wpis[], u: Ustawienia): LekcjaWidok[] {
  const zmiany = wpisy.filter((w): w is WpisZmiana => w.typ === 'zmiana' && w.data === data)
  if (u.profil === 'studia') {
    return slotyStudiow(data, u).map((s) => ({
      ...s,
      swietlica: false,
      zajecia: zastosujZmiany(s.nr, s.zajecia, zmiany),
      wpisy: [],
    }))
  }
  const dt = dzienTygodnia(data)
  if (dt > 4) return []
  return PLAN[dt].map((slot, i) => {
    const g = GODZINY[i]
    const zajecia = zastosujZmiany(g.nr, slot.filter((z) => widocznaGrupa(z, u.grupa)), zmiany)
    return {
      nr: g.nr,
      od: g.od,
      do: g.do,
      swietlica: zajecia.every((z) => z.swietlica),
      zajecia,
      wpisy: [],
    }
  })
}

function stanDnia(data: DataISO, wpisy: Wpis[], u: Ustawienia): StanDnia {
  const wolne = wolneW(data, wpisy)
  if (u.profil === 'studia') {
    if (wolne) return { rodzaj: 'wolne', wolne }
    const lekcje = lekcjeDnia(data, wpisy, u)
    return lekcje.length ? { rodzaj: 'lekcje', lekcje } : { rodzaj: 'brak' }
  }
  if (data < POCZATEK_ZAJEC) return { rodzaj: 'przed' }
  if (data > KONIEC_ZAJEC) return { rodzaj: 'po', wolne }
  if (wolne) return { rodzaj: 'wolne', wolne }
  if (dzienTygodnia(data) > 4) return { rodzaj: 'weekend' }
  return { rodzaj: 'lekcje', lekcje: lekcjeDnia(data, wpisy, u) }
}

export function opisDnia(data: DataISO, wpisy: Wpis[], u: Ustawienia): Dzien {
  const wszystkie = wpisy.filter((w) => dotyczyDnia(w, data))
  const wydarzenia = wszystkie.filter((w): w is WpisWydarzenie => w.typ === 'wydarzenie')
  const doPrzypiecia = wszystkie.filter(
    (w): w is WpisNotatka | WpisSprawdzian => w.typ === 'notatka' || w.typ === 'sprawdzian',
  )
  const stan = stanDnia(data, wpisy, u)

  const luzne: (WpisNotatka | WpisSprawdzian)[] = []
  for (const w of doPrzypiecia) {
    let lekcja: LekcjaWidok | undefined
    if (stan.rodzaj === 'lekcje') {
      if (w.lekcja) lekcja = stan.lekcje.find((l) => l.nr === w.lekcja)
      else if (w.typ === 'sprawdzian') {
        const p = w.przedmiot.toLocaleLowerCase('pl')
        lekcja = stan.lekcje.find((l) => l.zajecia.some((z) => z.przedmiot.toLocaleLowerCase('pl') === p))
      }
    }
    if (lekcja) lekcja.wpisy.push(w)
    else luzne.push(w)
  }

  return { data, stan, wydarzenia, luzne, wszystkie }
}

/** Pierwszy dzień z lekcjami po podanej dacie. */
export function najblizszyDzienZLekcjami(od: DataISO, wpisy: Wpis[], u: Ustawienia): Dzien | null {
  if (u.profil === 'studia') {
    for (const d of DNI_ZAJEC_STUDIA) {
      if (d <= od) continue
      const dzien = opisDnia(d, wpisy, u)
      if (dzien.stan.rodzaj === 'lekcje') return dzien
    }
    return null
  }
  let d = od < POCZATEK_ZAJEC ? dodajDni(POCZATEK_ZAJEC, -1) : od
  for (let i = 0; i < 370; i++) {
    d = dodajDni(d, 1)
    if (d > KONIEC_ZAJEC) return null
    const dzien = opisDnia(d, wpisy, u)
    if (dzien.stan.rodzaj === 'lekcje') return dzien
  }
  return null
}

/** Lekcje w danym dniu do wyboru w formularzu. */
export function opcjeLekcji(data: DataISO, u: Ustawienia) {
  const opcje: { wartosc: string; etykieta: string; nr: number; grupa?: 1 | 2 }[] = []
  if (u.profil === 'studia') {
    for (const s of slotyStudiow(data, u)) {
      const z = s.zajecia[0]
      opcje.push({ wartosc: `${s.nr}`, etykieta: `${s.od} ${z.przedmiot} (${z.forma})`, nr: s.nr })
    }
    return opcje
  }
  const dt = dzienTygodnia(data)
  if (dt > 4) return []
  PLAN[dt].forEach((slot, i) => {
    const nr = GODZINY[i].nr
    const widoczne = slot.filter((z) => widocznaGrupa(z, u.grupa))
    if (widoczne.every((z) => z.swietlica)) {
      opcje.push({ wartosc: `${nr}`, etykieta: `${nr}. Świetlica`, nr })
      return
    }
    if (widoczne.length > 1) {
      opcje.push({ wartosc: `${nr}`, etykieta: `${nr}. Cała lekcja (obie grupy)`, nr })
      for (const z of widoczne)
        opcje.push({ wartosc: `${nr}-${z.grupa}`, etykieta: `${nr}. gr ${z.grupa}: ${z.przedmiot}`, nr, grupa: z.grupa })
    } else {
      const z = widoczne[0]
      opcje.push({
        wartosc: `${nr}`,
        etykieta: `${nr}. ${z.grupa ? `gr ${z.grupa}: ` : ''}${z.przedmiot}`,
        nr,
      })
    }
  })
  return opcje
}
