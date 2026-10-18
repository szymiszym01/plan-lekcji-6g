import { Naglowek } from '../components/Elementy'
import { DNI_KROTKIE, MIESIACE_DOP, dzienTygodnia, roznicaDni, zakresSlownie, zaIleDni, zISO } from '../logic/dates'
import { opisWpisu } from '../logic/opis'
import { useApp } from '../kontekst'
import type { DataISO, WpisSprawdzian, WpisWolne, WpisWydarzenie } from '../model'

type Pozycja = WpisSprawdzian | WpisWydarzenie | WpisWolne

const poczatek = (w: Pozycja): DataISO => (w.typ === 'sprawdzian' ? w.data : w.od)
const koniec = (w: Pozycja): DataISO => (w.typ === 'sprawdzian' ? w.data : w.do)

export function ListaPozycji({ wpisy }: { wpisy: Pozycja[] }) {
  const { dzis, edytujWpis } = useApp()
  return (
    <div>
      {wpisy.map((w) => {
        const od = poczatek(w)
        const d = zISO(od)
        const { etykieta } = opisWpisu(w)
        const tytul = w.typ === 'sprawdzian' ? w.przedmiot : w.typ === 'wydarzenie' ? w.tytul : w.nazwa
        const szczegoly =
          w.typ === 'sprawdzian'
            ? [etykieta, w.zakres].filter(Boolean).join(' · ')
            : w.typ === 'wydarzenie'
              ? [
                  zakresSlownie(w.od, w.do),
                  w.godzOd && `${w.godzOd}${w.godzDo ? `–${w.godzDo}` : ''}`,
                  w.miejsce,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : `${etykieta} · ${zakresSlownie(w.od, w.do)}`
        const ile = roznicaDni(dzis, od)
        const trwa = ile < 0 && koniec(w) >= dzis
        return (
          <button key={w.id} className={`pozycja ${w.typ}`} onClick={() => edytujWpis(w)}>
            <span className="data-blok">
              <b>{d.getDate()}</b>
              <span>{MIESIACE_DOP[d.getMonth()].slice(0, 3)}</span>
            </span>
            <span className="pozycja-tresc">
              <span className="przedmiot" style={{ display: 'block' }}>
                {tytul}
              </span>
              <span className="nauczyciel" style={{ display: 'block' }}>
                {DNI_KROTKIE[dzienTygodnia(od)]} · {szczegoly}
              </span>
            </span>
            <span className="za-ile">{trwa ? 'trwa' : ile < 0 ? 'minęło' : zaIleDni(ile)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function WidokNadchodzace() {
  const { wpisy, dzis } = useApp()
  const sortuj = (a: Pozycja, b: Pozycja) => poczatek(a).localeCompare(poczatek(b))
  const sprawdziany = wpisy
    .filter((w): w is WpisSprawdzian => w.typ === 'sprawdzian' && w.data >= dzis)
    .sort(sortuj)
  const wydarzenia = wpisy.filter((w): w is WpisWydarzenie => w.typ === 'wydarzenie' && w.do >= dzis).sort(sortuj)
  const wolne = wpisy
    .filter((w): w is WpisWolne => w.typ === 'wolne' && w.do >= dzis)
    .sort(sortuj)
    .slice(0, 4)

  return (
    <div>
      <Naglowek tytul="Nadchodzące" podtytul={<span>Sprawdziany, wydarzenia i najbliższe dni wolne</span>} />

      <h2 className="sekcja-tytul" style={{ marginTop: 8 }}>
        Sprawdziany i kartkówki
      </h2>
      {sprawdziany.length ? (
        <ListaPozycji wpisy={sprawdziany} />
      ) : (
        <div className="pusto">Brak zaplanowanych sprawdzianów. Dodaj je przyciskiem +.</div>
      )}

      <h2 className="sekcja-tytul">Wycieczki i wydarzenia</h2>
      {wydarzenia.length ? <ListaPozycji wpisy={wydarzenia} /> : <div className="pusto">Brak wydarzeń.</div>}

      <h2 className="sekcja-tytul">Dni wolne</h2>
      {wolne.length ? <ListaPozycji wpisy={wolne} /> : <div className="pusto">Brak dni wolnych.</div>}
    </div>
  )
}
