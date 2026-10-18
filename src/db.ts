import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { DNI_WOLNE_MEN } from './data/schoolCalendar'
import type { Ustawienia, Wpis, WpisWolne } from './model'

interface Schemat extends DBSchema {
  wpisy: { key: string; value: Wpis }
  ustawienia: { key: string; value: unknown }
}

let dbPromise: Promise<IDBPDatabase<Schemat>> | null = null

const db = () =>
  (dbPromise ??= openDB<Schemat>('plan-lekcji-6g', 1, {
    upgrade(d) {
      d.createObjectStore('wpisy', { keyPath: 'id' })
      d.createObjectStore('ustawienia')
    },
  }))

export const noweId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const DOMYSLNE_USTAWIENIA: Ustawienia = { profil: 'szkola', grupa: 'obie', lektorat: 'oba' }

export async function wszystkieWpisy(): Promise<Wpis[]> {
  return (await db()).getAll('wpisy')
}

export async function zapiszWpis(w: Wpis) {
  await (await db()).put('wpisy', w)
}

export async function usunWpis(id: string) {
  await (await db()).delete('wpisy', id)
}

export async function wczytajUstawienia(): Promise<Ustawienia> {
  const zapisane = (await (await db()).get('ustawienia', 'ustawienia')) as Partial<Ustawienia> | undefined
  return { ...DOMYSLNE_USTAWIENIA, ...zapisane }
}

export async function zapiszUstawienia(u: Ustawienia) {
  await (await db()).put('ustawienia', u, 'ustawienia')
}

const wpisyMEN = (): WpisWolne[] =>
  DNI_WOLNE_MEN.map((d) => ({ ...d, typ: 'wolne', id: noweId(), utworzono: Date.now(), zrodlo: 'kalendarz MEN' }))

let zasiewanie: Promise<void> | null = null

/** Przy pierwszym uruchomieniu wczytuje dni wolne z kalendarza MEN (tylko raz). */
export function zasiejJesliTrzeba() {
  // Sprawdzenie i zapis w jednej transakcji, więc równoległe wywołania nie zdublują wpisów.
  return (zasiewanie ??= (async () => {
    const tx = (await db()).transaction(['wpisy', 'ustawienia'], 'readwrite')
    if (!(await tx.objectStore('ustawienia').get('zasiano'))) {
      for (const w of wpisyMEN()) await tx.objectStore('wpisy').put(w)
      await tx.objectStore('ustawienia').put(true, 'zasiano')
    }
    await tx.done
  })())
}

/** Usuwa wpisy z kalendarza MEN (także edytowane) i wczytuje je od nowa. */
export async function przywrocKalendarzMEN() {
  const d = await db()
  const tx = d.transaction('wpisy', 'readwrite')
  for (const w of await tx.store.getAll()) if (w.zrodlo === 'kalendarz MEN') await tx.store.delete(w.id)
  for (const w of wpisyMEN()) await tx.store.put(w)
  await tx.done
}

// ---------- Kopia zapasowa ----------

interface Kopia {
  aplikacja: 'plan-lekcji-6g'
  wersja: 1
  utworzono: string
  ustawienia: Ustawienia
  wpisy: Wpis[]
}

export async function eksportuj(): Promise<Blob> {
  const kopia: Kopia = {
    aplikacja: 'plan-lekcji-6g',
    wersja: 1,
    utworzono: new Date().toISOString(),
    ustawienia: await wczytajUstawienia(),
    wpisy: await wszystkieWpisy(),
  }
  return new Blob([JSON.stringify(kopia, null, 2)], { type: 'application/json' })
}

const TYPY = new Set(['notatka', 'sprawdzian', 'wydarzenie', 'wolne', 'zmiana'])
const DATA = /^\d{4}-\d{2}-\d{2}$/

function poprawnyWpis(w: unknown): w is Wpis {
  if (!w || typeof w !== 'object') return false
  const o = w as Record<string, unknown>
  if (typeof o.id !== 'string' || !TYPY.has(o.typ as string)) return false
  const daty = o.typ === 'wydarzenie' || o.typ === 'wolne' ? [o.od, o.do] : [o.data]
  return daty.every((d) => typeof d === 'string' && DATA.test(d))
}

/** Zwraca listę wpisów z pliku albo rzuca błąd z opisem po polsku. */
export function odczytajKopie(tekst: string): { wpisy: Wpis[]; ustawienia?: Ustawienia } {
  let dane: unknown
  try {
    dane = JSON.parse(tekst)
  } catch {
    throw new Error('To nie jest poprawny plik JSON.')
  }
  const o = dane as Partial<Kopia>
  if (!o || o.aplikacja !== 'plan-lekcji-6g' || !Array.isArray(o.wpisy))
    throw new Error('Ten plik nie jest kopią zapasową aplikacji Plan lekcji 6G.')
  const zle = o.wpisy.filter((w) => !poprawnyWpis(w)).length
  if (zle) throw new Error(`Plik zawiera ${zle} uszkodzonych wpisów.`)
  return { wpisy: o.wpisy, ustawienia: o.ustawienia }
}

export async function importuj(wpisy: Wpis[], tryb: 'zastap' | 'polacz', ustawienia?: Ustawienia) {
  const d = await db()
  const tx = d.transaction(['wpisy', 'ustawienia'], 'readwrite')
  if (tryb === 'zastap') await tx.objectStore('wpisy').clear()
  for (const w of wpisy) await tx.objectStore('wpisy').put(w)
  await tx.objectStore('ustawienia').put(true, 'zasiano')
  if (ustawienia && tryb === 'zastap')
    await tx.objectStore('ustawienia').put({ ...DOMYSLNE_USTAWIENIA, ...ustawienia }, 'ustawienia')
  await tx.done
}

export async function poprosOTrwalyZapis(): Promise<boolean | null> {
  if (!navigator.storage?.persist) return null
  if (await navigator.storage.persisted?.()) return true
  return navigator.storage.persist()
}
