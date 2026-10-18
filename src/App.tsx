import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Edytor } from './components/Edytor'
import {
  IkonaDzis, IkonaMiesiac, IkonaNadchodzace, IkonaPlus, IkonaTydzien, IkonaUstawienia,
} from './components/Ikony'
import {
  DOMYSLNE_USTAWIENIA, poprosOTrwalyZapis, wczytajUstawienia, wszystkieWpisy, zapiszUstawienia, zasiejJesliTrzeba,
} from './db'
import { doISO, dodajDni, dzienTygodnia } from './logic/dates'
import { AppKontekst, type Kontekst, type OpcjeOkna, type Szablon } from './kontekst'
import type { DataISO, Ustawienia, Wpis } from './model'
import { WidokDzien } from './views/Dzien'
import { WidokMiesiac } from './views/Miesiac'
import { WidokNadchodzace } from './views/Nadchodzace'
import { WidokTydzien } from './views/Tydzien'
import { WidokUstawienia } from './views/Ustawienia'
import { useTeraz } from './hooks'

type Widok = 'dzis' | 'tydzien' | 'miesiac' | 'nadchodzace' | 'ustawienia'

const ZAKLADKI: { id: Widok; etykieta: string; ikona: () => JSX.Element }[] = [
  { id: 'dzis', etykieta: 'Dziś', ikona: IkonaDzis },
  { id: 'tydzien', etykieta: 'Tydzień', ikona: IkonaTydzien },
  { id: 'miesiac', etykieta: 'Miesiąc', ikona: IkonaMiesiac },
  { id: 'nadchodzace', etykieta: 'Nadchodzące', ikona: IkonaNadchodzace },
  { id: 'ustawienia', etykieta: 'Ustawienia', ikona: IkonaUstawienia },
]

type Edycja = { wpis?: Wpis; szablon?: Szablon }
type Okno = OpcjeOkna & { resolve: (id: string | null) => void }

export default function App() {
  const teraz = useTeraz(30_000)
  const dzis = doISO(teraz)
  const [gotowe, setGotowe] = useState(false)
  const [wpisy, setWpisy] = useState<Wpis[]>([])
  const [ustawienia, setUstawienia] = useState<Ustawienia>(DOMYSLNE_USTAWIENIA)
  const [widok, setWidok] = useState<Widok>('dzis')
  const [data, setData] = useState<DataISO>(dzis)
  const [edycja, setEdycja] = useState<Edycja | null>(null)
  const [okno, setOkno] = useState<Okno | null>(null)
  const [tekst, setTekst] = useState<string | null>(null)
  const timerKomunikatu = useRef<number | undefined>(undefined)

  // Po północy (lub po powrocie do aplikacji następnego dnia) „Dziś” przeskakuje na nowy dzień.
  const poprzedniDzis = useRef(dzis)
  useEffect(() => {
    const poprzedni = poprzedniDzis.current
    if (poprzedni !== dzis) {
      setData((d) => (d === poprzedni ? dzis : d))
      poprzedniDzis.current = dzis
    }
  }, [dzis])

  const odswiez = useCallback(async () => setWpisy(await wszystkieWpisy()), [])

  useEffect(() => {
    ;(async () => {
      await zasiejJesliTrzeba()
      const [w, u] = await Promise.all([wszystkieWpisy(), wczytajUstawienia()])
      setWpisy(w)
      setUstawienia(u)
      setGotowe(true)
      poprosOTrwalyZapis().catch(() => {})
    })()
  }, [])

  const kontekst = useMemo<Kontekst>(
    () => ({
      wpisy,
      ustawienia,
      dzis,
      odswiez,
      zmienUstawienia(u) {
        setUstawienia(u)
        zapiszUstawienia(u)
      },
      otworzDzien(d) {
        setData(d)
        setWidok('dzis')
        window.scrollTo(0, 0)
      },
      nowyWpis: (szablon) => setEdycja({ szablon }),
      edytujWpis: (wpis) => setEdycja({ wpis }),
      zapytaj: (o) => new Promise((resolve) => setOkno({ ...o, resolve })),
      komunikat(t) {
        setTekst(t)
        window.clearTimeout(timerKomunikatu.current)
        timerKomunikatu.current = window.setTimeout(() => setTekst(null), 2200)
      },
    }),
    [wpisy, ustawienia, dzis, odswiez],
  )

  const zamknijOkno = (id: string | null) => {
    okno?.resolve(id)
    setOkno(null)
  }

  const zmienWidok = (w: Widok) => {
    if (w === widok && w === 'dzis') setData(dzis)
    setWidok(w)
    window.scrollTo(0, 0)
  }

  const nowyZWidoku = () => {
    let d = widok === 'dzis' || widok === 'tydzien' ? data : dzis
    // W weekend proponujemy najbliższy poniedziałek.
    if (dzienTygodnia(d) > 4) d = dodajDni(d, 7 - dzienTygodnia(d))
    setEdycja({ szablon: { typ: widok === 'nadchodzace' ? 'sprawdzian' : 'notatka', data: d } })
  }

  return (
    <AppKontekst.Provider value={kontekst}>
      <div className="kolo-tla" aria-hidden="true" />
      <main className={`app${widok === 'tydzien' ? ' szeroka' : ''}`}>
        {gotowe && (
          <>
            {widok === 'dzis' && <WidokDzien data={data} ustawDate={setData} />}
            {widok === 'tydzien' && <WidokTydzien data={data} ustawDate={setData} />}
            {widok === 'miesiac' && <WidokMiesiac data={data} />}
            {widok === 'nadchodzace' && <WidokNadchodzace />}
            {widok === 'ustawienia' && <WidokUstawienia />}
          </>
        )}
      </main>

      {widok !== 'ustawienia' && (
        <button className="fab" onClick={nowyZWidoku} aria-label="Dodaj wpis">
          <IkonaPlus />
        </button>
      )}

      <nav className="tabbar" aria-label="Widoki">
        {ZAKLADKI.map(({ id, etykieta, ikona: Ikona }) => (
          <button
            key={id}
            className={`tab${widok === id ? ' aktywna' : ''}`}
            aria-current={widok === id ? 'page' : undefined}
            onClick={() => zmienWidok(id)}
          >
            <Ikona />
            {etykieta}
          </button>
        ))}
      </nav>

      {edycja && <Edytor {...edycja} onZamknij={() => setEdycja(null)} />}

      {okno && (
        <div className="zaslona srodek" onClick={() => zamknijOkno(null)}>
          <div className="okno" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3>{okno.tytul}</h3>
            {okno.tresc && <p>{okno.tresc}</p>}
            <div className="przyciski">
              {okno.przyciski.map((p) => (
                <button
                  key={p.id}
                  className={`przycisk${p.styl === 'usun' ? ' usun' : p.styl === 'glowny' ? '' : ' jasny'}`}
                  style={p.styl ? undefined : { boxShadow: 'inset 0 0 0 1.5px var(--linia)' }}
                  onClick={() => zamknijOkno(p.id)}
                >
                  {p.etykieta}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tekst && (
        <div className="komunikat" role="status">
          {tekst}
        </div>
      )}
    </AppKontekst.Provider>
  )
}
