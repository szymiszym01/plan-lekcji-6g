import type { DataISO } from '../model'

const pad = (n: number) => String(n).padStart(2, '0')

export const doISO = (d: Date): DataISO => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const zISO = (iso: DataISO): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const dzisiaj = (): DataISO => doISO(new Date())

export const dodajDni = (iso: DataISO, n: number): DataISO => {
  const d = zISO(iso)
  d.setDate(d.getDate() + n)
  return doISO(d)
}

/** 0 = poniedziałek … 6 = niedziela */
export const dzienTygodnia = (iso: DataISO): number => (zISO(iso).getDay() + 6) % 7

export const poczatekTygodnia = (iso: DataISO): DataISO => dodajDni(iso, -dzienTygodnia(iso))

export const roznicaDni = (od: DataISO, doDaty: DataISO): number =>
  Math.round((zISO(doDaty).getTime() - zISO(od).getTime()) / 86_400_000)

export const wZakresie = (iso: DataISO, od: DataISO, doDaty: DataISO) => iso >= od && iso <= doDaty

export const DNI = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela']
export const DNI_KROTKIE = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd']
export const MIESIACE = [
  'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
]
export const MIESIACE_DOP = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
]

export const wielka = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** „19 października” */
export const dataSlownie = (iso: DataISO) => {
  const d = zISO(iso)
  return `${d.getDate()} ${MIESIACE_DOP[d.getMonth()]}`
}

/** „pn 19.10” */
export const dataKrotko = (iso: DataISO) => {
  const d = zISO(iso)
  return `${DNI_KROTKIE[dzienTygodnia(iso)]} ${d.getDate()}.${pad(d.getMonth() + 1)}`
}

export const zakresSlownie = (od: DataISO, doDaty: DataISO) => {
  if (od === doDaty) return dataSlownie(od)
  const a = zISO(od)
  const b = zISO(doDaty)
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear())
    return `${a.getDate()}–${b.getDate()} ${MIESIACE_DOP[b.getMonth()]}`
  return `${dataSlownie(od)} – ${dataSlownie(doDaty)}`
}

/** „GG:MM” → minuty od północy */
export const minuty = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const zaIleDni = (n: number) => {
  if (n === 0) return 'dziś'
  if (n === 1) return 'jutro'
  if (n === 2) return 'pojutrze'
  return `za ${n} dni`
}
