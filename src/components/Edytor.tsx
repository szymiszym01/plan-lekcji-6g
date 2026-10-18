import { useRef, useState, type ReactNode } from 'react'
import { PRZEDMIOTY_STUDIA } from '../data/studia'
import { PRZEDMIOTY as PRZEDMIOTY_SZKOLA } from '../data/timetable'
import { noweId, usunWpis, zapiszWpis } from '../db'
import { dataKrotko, dzisiaj } from '../logic/dates'
import { opcjeLekcji } from '../logic/schedule'
import { useApp, type Szablon } from '../kontekst'
import { ETYKIETY_WOLNEGO, NAZWY_TYPOW, type RodzajWolnego, type TypWpisu, type Wpis } from '../model'
import { IkonaZamknij } from './Ikony'

const TYPY: TypWpisu[] = ['notatka', 'sprawdzian', 'wydarzenie', 'wolne', 'zmiana']

interface Formularz {
  data: string
  od: string
  do: string
  lekcja: string
  tekst: string
  rodzajSpr: 'sprawdzian' | 'kartkowka'
  przedmiot: string
  zakres: string
  tytul: string
  godzOd: string
  godzDo: string
  miejsce: string
  opis: string
  rodzajWolnego: RodzajWolnego
  nazwa: string
  odwolana: boolean
  nauczyciel: string
  sala: string
}

function poczatkowy(w?: Wpis, s?: Szablon): Formularz {
  const data = s?.data ?? dzisiaj()
  const f: Formularz = {
    data,
    od: data,
    do: data,
    lekcja: s?.lekcja ? `${s.lekcja}${s.grupa ? `-${s.grupa}` : ''}` : '',
    tekst: '',
    rodzajSpr: 'sprawdzian',
    przedmiot: s?.przedmiot ?? '',
    zakres: '',
    tytul: '',
    godzOd: '',
    godzDo: '',
    miejsce: '',
    opis: '',
    rodzajWolnego: 'dyrektorski',
    nazwa: '',
    odwolana: true,
    nauczyciel: '',
    sala: '',
  }
  if (!w) return f
  const lekcja = (nr?: number, gr?: number) => (nr ? `${nr}${gr ? `-${gr}` : ''}` : '')
  switch (w.typ) {
    case 'notatka':
      return { ...f, data: w.data, lekcja: lekcja(w.lekcja, w.grupa), tekst: w.tekst }
    case 'sprawdzian':
      return { ...f, data: w.data, lekcja: lekcja(w.lekcja), rodzajSpr: w.rodzaj, przedmiot: w.przedmiot, zakres: w.zakres ?? '' }
    case 'wydarzenie':
      return {
        ...f, data: w.od, od: w.od, do: w.do, tytul: w.tytul, godzOd: w.godzOd ?? '', godzDo: w.godzDo ?? '',
        miejsce: w.miejsce ?? '', opis: w.opis ?? '',
      }
    case 'wolne':
      return { ...f, data: w.od, od: w.od, do: w.do, rodzajWolnego: w.rodzaj, nazwa: w.nazwa }
    case 'zmiana':
      return {
        ...f, data: w.data, lekcja: lekcja(w.lekcja, w.grupa), odwolana: w.odwolana, przedmiot: w.przedmiot ?? '',
        nauczyciel: w.nauczyciel ?? '', sala: w.sala ?? '',
      }
  }
}

const Pole = ({ etykieta, children }: { etykieta: string; children: ReactNode }) => (
  <label className="pole">
    <span>{etykieta}</span>
    {children}
  </label>
)

export function Edytor({ wpis, szablon, onZamknij }: { wpis?: Wpis; szablon?: Szablon; onZamknij: () => void }) {
  const { ustawienia, odswiez, zapytaj, komunikat } = useApp()
  const [typ, setTyp] = useState<TypWpisu>(wpis?.typ ?? szablon?.typ ?? 'notatka')
  const [f, setF] = useState<Formularz>(() => poczatkowy(wpis, szablon))
  const [blad, setBlad] = useState('')
  const [id] = useState(() => wpis?.id ?? noweId())
  const zajety = useRef(false)
  const ustaw = <K extends keyof Formularz>(k: K, v: Formularz[K]) => setF((p) => ({ ...p, [k]: v }))

  // Pojedyncza data i zakres są synchronizowane, by zmiana typu nie gubiła daty.
  const ustawDate = (v: string) => setF((p) => ({ ...p, data: v, od: v, do: p.do < v ? v : p.do }))

  // Wpis należy do planu, w którym powstał; nowe wpisy trafiają do aktywnego planu.
  const profil = wpis?.profil ?? (wpis ? 'szkola' : ustawienia.profil)
  const PRZEDMIOTY = profil === 'studia' ? PRZEDMIOTY_STUDIA : PRZEDMIOTY_SZKOLA
  const grupaOpcji = wpis && 'grupa' in wpis && wpis.grupa ? 'obie' : ustawienia.grupa
  const opcje = opcjeLekcji(f.data, { ...ustawienia, profil, grupa: grupaOpcji })
  const bezLekcji = opcje.length === 0

  function zbuduj(): Wpis | string {
    const baza = {
      id,
      utworzono: wpis?.utworzono ?? Date.now(),
      profil,
      ...(wpis?.zrodlo ? { zrodlo: wpis.zrodlo } : {}),
    }
    const [nrS, grS] = f.lekcja.split('-')
    const nr = Number(nrS) || undefined
    const grupa = grS ? (Number(grS) as 1 | 2) : undefined
    const t = (s: string) => s.trim() || undefined
    switch (typ) {
      case 'notatka':
        if (!nr) return 'Wybierz lekcję.'
        if (!f.tekst.trim()) return 'Wpisz treść notatki.'
        return { ...baza, typ, data: f.data, lekcja: nr, grupa, tekst: f.tekst.trim() }
      case 'sprawdzian':
        if (!f.przedmiot.trim()) return 'Podaj przedmiot.'
        return { ...baza, typ, data: f.data, rodzaj: f.rodzajSpr, przedmiot: f.przedmiot.trim(), lekcja: nr, zakres: t(f.zakres) }
      case 'wydarzenie':
        if (!f.tytul.trim()) return 'Podaj tytuł.'
        if (f.do < f.od) return 'Data końca jest wcześniejsza niż początek.'
        return {
          ...baza, typ, tytul: f.tytul.trim(), od: f.od, do: f.do, godzOd: t(f.godzOd), godzDo: t(f.godzDo),
          miejsce: t(f.miejsce), opis: t(f.opis),
        }
      case 'wolne':
        if (f.do < f.od) return 'Data końca jest wcześniejsza niż początek.'
        return { ...baza, typ, od: f.od, do: f.do, rodzaj: f.rodzajWolnego, nazwa: f.nazwa.trim() || ETYKIETY_WOLNEGO[f.rodzajWolnego] }
      case 'zmiana':
        if (!nr) return 'Wybierz lekcję.'
        if (!f.odwolana && !f.przedmiot.trim() && !f.nauczyciel.trim() && !f.sala.trim())
          return 'Podaj przedmiot, nauczyciela lub salę zastępstwa.'
        return {
          ...baza, typ, data: f.data, lekcja: nr, grupa, odwolana: f.odwolana,
          ...(f.odwolana ? {} : { przedmiot: t(f.przedmiot), nauczyciel: t(f.nauczyciel), sala: t(f.sala) }),
        }
    }
  }

  async function zapisz() {
    if (zajety.current) return
    if (!f.data) return setBlad('Wybierz datę.')
    const w = zbuduj()
    if (typeof w === 'string') return setBlad(w)
    zajety.current = true
    await zapiszWpis(w)
    await odswiez()
    komunikat(wpis ? 'Zapisano zmiany' : 'Dodano wpis')
    onZamknij()
  }

  async function usun() {
    if (!wpis) return
    const ok = await zapytaj({
      tytul: 'Usunąć wpis?',
      tresc: 'Tej operacji nie można cofnąć.',
      przyciski: [
        { id: 'usun', etykieta: 'Usuń', styl: 'usun' },
        { id: 'anuluj', etykieta: 'Anuluj' },
      ],
    })
    if (ok !== 'usun') return
    await usunWpis(wpis.id)
    await odswiez()
    komunikat('Usunięto wpis')
    onZamknij()
  }

  const wyborLekcji = (opcjonalna: boolean) => (
    <Pole etykieta={opcjonalna ? 'Lekcja (opcjonalnie)' : 'Lekcja'}>
      <select value={f.lekcja} onChange={(e) => ustaw('lekcja', e.target.value)} disabled={bezLekcji}>
        <option value="">{bezLekcji ? 'W ten dzień nie ma zajęć' : opcjonalna ? 'Automatycznie (zajęcia z tego przedmiotu)' : 'Wybierz lekcję…'}</option>
        {opcje.map((o) => (
          <option key={o.wartosc} value={o.wartosc}>
            {o.etykieta}
          </option>
        ))}
      </select>
    </Pole>
  )

  const poleDaty = (
    <Pole etykieta="Data">
      <input type="date" value={f.data} required onChange={(e) => ustawDate(e.target.value)} />
    </Pole>
  )

  const poleZakresu = (
    <div className="pola-obok">
      <Pole etykieta="Od">
        <input type="date" value={f.od} required onChange={(e) => ustawDate(e.target.value)} />
      </Pole>
      <Pole etykieta="Do">
        <input type="date" value={f.do} min={f.od} required onChange={(e) => ustaw('do', e.target.value)} />
      </Pole>
    </div>
  )

  return (
    <div className="zaslona" onClick={onZamknij}>
      <div
        className="arkusz"
        role="dialog"
        aria-modal="true"
        aria-label={wpis ? 'Edycja wpisu' : 'Nowy wpis'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="uchwyt" />
        <div className="arkusz-naglowek">
          <h2>{wpis ? NAZWY_TYPOW[typ] : 'Nowy wpis'}</h2>
          <button className="strzalka" onClick={onZamknij} aria-label="Zamknij">
            <IkonaZamknij />
          </button>
        </div>

        {!wpis && (
          <div className="typy" role="tablist">
            {TYPY.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={typ === t}
                className={typ === t ? 'wybrany' : ''}
                onClick={() => {
                  setTyp(t)
                  setBlad('')
                }}
              >
                {NAZWY_TYPOW[t]}
              </button>
            ))}
          </div>
        )}

        {wpis?.zrodlo && (
          <p className="pusto" style={{ paddingTop: 0 }}>
            Wpis z kalendarza MEN · {dataKrotko(f.od)}
          </p>
        )}

        {typ === 'notatka' && (
          <>
            {poleDaty}
            {wyborLekcji(false)}
            <Pole etykieta="Treść">
              <textarea
                value={f.tekst}
                placeholder="np. zadanie domowe: str. 45, zad. 3 · przynieść cyrkiel"
                onChange={(e) => ustaw('tekst', e.target.value)}
              />
            </Pole>
          </>
        )}

        {typ === 'sprawdzian' && (
          <>
            <div className="pole">
              <div className="segmenty male">
                {(['sprawdzian', 'kartkowka'] as const).map((r) => (
                  <button key={r} className={f.rodzajSpr === r ? 'wybrany' : ''} onClick={() => ustaw('rodzajSpr', r)}>
                    {r === 'sprawdzian' ? 'Sprawdzian' : 'Kartkówka'}
                  </button>
                ))}
              </div>
            </div>
            <Pole etykieta="Przedmiot">
              <select value={PRZEDMIOTY.includes(f.przedmiot) ? f.przedmiot : f.przedmiot ? '__inny' : ''}
                onChange={(e) => ustaw('przedmiot', e.target.value === '__inny' ? ' ' : e.target.value)}>
                <option value="">Wybierz przedmiot…</option>
                {PRZEDMIOTY.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="__inny">Inny…</option>
              </select>
            </Pole>
            {f.przedmiot && !PRZEDMIOTY.includes(f.przedmiot) && (
              <Pole etykieta="Nazwa przedmiotu">
                <input value={f.przedmiot.trimStart()} onChange={(e) => ustaw('przedmiot', e.target.value || ' ')} />
              </Pole>
            )}
            {poleDaty}
            {wyborLekcji(true)}
            <Pole etykieta="Zakres (opcjonalnie)">
              <textarea value={f.zakres} placeholder="np. dział 3: ułamki dziesiętne" onChange={(e) => ustaw('zakres', e.target.value)} />
            </Pole>
          </>
        )}

        {typ === 'wydarzenie' && (
          <>
            <Pole etykieta="Tytuł">
              <input value={f.tytul} placeholder="np. Wycieczka do Wrocławia" onChange={(e) => ustaw('tytul', e.target.value)} />
            </Pole>
            {poleZakresu}
            <div className="pola-obok">
              <Pole etykieta="Godzina od">
                <input type="time" value={f.godzOd} onChange={(e) => ustaw('godzOd', e.target.value)} />
              </Pole>
              <Pole etykieta="Godzina do">
                <input type="time" value={f.godzDo} onChange={(e) => ustaw('godzDo', e.target.value)} />
              </Pole>
            </div>
            <Pole etykieta="Miejsce (opcjonalnie)">
              <input value={f.miejsce} onChange={(e) => ustaw('miejsce', e.target.value)} />
            </Pole>
            <Pole etykieta="Opis (opcjonalnie)">
              <textarea value={f.opis} placeholder="np. zbiórka 7:45 przed szkołą, drugie śniadanie" onChange={(e) => ustaw('opis', e.target.value)} />
            </Pole>
          </>
        )}

        {typ === 'wolne' && (
          <>
            <Pole etykieta="Rodzaj">
              <select value={f.rodzajWolnego} onChange={(e) => ustaw('rodzajWolnego', e.target.value as RodzajWolnego)}>
                {(Object.keys(ETYKIETY_WOLNEGO) as RodzajWolnego[]).map((r) => (
                  <option key={r} value={r}>
                    {ETYKIETY_WOLNEGO[r]}
                  </option>
                ))}
              </select>
            </Pole>
            <Pole etykieta="Nazwa">
              <input value={f.nazwa} placeholder={ETYKIETY_WOLNEGO[f.rodzajWolnego]} onChange={(e) => ustaw('nazwa', e.target.value)} />
            </Pole>
            {poleZakresu}
          </>
        )}

        {typ === 'zmiana' && (
          <>
            {poleDaty}
            {wyborLekcji(false)}
            <div className="pole">
              <div className="segmenty male">
                <button className={f.odwolana ? 'wybrany' : ''} onClick={() => ustaw('odwolana', true)}>
                  Odwołana
                </button>
                <button className={!f.odwolana ? 'wybrany' : ''} onClick={() => ustaw('odwolana', false)}>
                  Zastępstwo
                </button>
              </div>
            </div>
            {!f.odwolana && (
              <>
                <Pole etykieta="Przedmiot">
                  <input list="lista-przedmiotow" value={f.przedmiot} onChange={(e) => ustaw('przedmiot', e.target.value)} />
                  <datalist id="lista-przedmiotow">
                    {PRZEDMIOTY.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </Pole>
                <div className="pola-obok">
                  <Pole etykieta="Nauczyciel">
                    <input value={f.nauczyciel} onChange={(e) => ustaw('nauczyciel', e.target.value)} />
                  </Pole>
                  <Pole etykieta="Sala">
                    <input value={f.sala} placeholder="np. 130" onChange={(e) => ustaw('sala', e.target.value)} />
                  </Pole>
                </div>
              </>
            )}
          </>
        )}

        {blad && (
          <p role="alert" style={{ color: '#a3243b', fontWeight: 650, margin: '0 0 10px 4px' }}>
            {blad}
          </p>
        )}

        <div className="akcje">
          {wpis && (
            <button className="przycisk usun" onClick={usun}>
              Usuń
            </button>
          )}
          <button className="przycisk" onClick={zapisz}>
            {wpis ? 'Zapisz' : 'Dodaj'}
          </button>
        </div>
      </div>
    </div>
  )
}
