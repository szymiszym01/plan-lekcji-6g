import { Naglowek } from '../components/Elementy'
import { DNI, DNI_KROTKIE, MIESIACE_DOP, dzienTygodnia, roznicaDni, zakresSlownie, zaIleDni, zISO } from '../logic/dates'
import { DNI_ZAJEC_STUDIA } from '../data/studia'
import { lekcjeDnia } from '../logic/schedule'
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

/** Studia: najbliższe dni zjazdu z godzinami zajęć. */
function Zjazdy() {
  const { ustawienia, dzis, otworzDzien } = useApp()
  const dni = DNI_ZAJEC_STUDIA.filter((d) => d >= dzis)
    .map((d) => ({ d, lekcje: lekcjeDnia(d, [], ustawienia) }))
    .filter((x) => x.lekcje.length)
    .slice(0, 6)
  if (!dni.length) return <div className="pusto">Brak kolejnych zajęć w planie.</div>
  return (
    <div>
      {dni.map(({ d, lekcje }) => {
        const data = zISO(d)
        const online = lekcje.every((l) => l.zajecia.every((z) => z.online))
        return (
          <button key={d} className="pozycja zjazd" onClick={() => otworzDzien(d)}>
            <span className="data-blok">
              <b>{data.getDate()}</b>
              <span>{MIESIACE_DOP[data.getMonth()].slice(0, 3)}</span>
            </span>
            <span className="pozycja-tresc">
              <span className="przedmiot" style={{ display: 'block' }}>
                {DNI[dzienTygodnia(d)]}, {lekcje[0].od.replace(/^0/, '')}–{lekcje[lekcje.length - 1].do}
              </span>
              <span className="nauczyciel" style={{ display: 'block' }}>
                {lekcje.length} {lekcje.length === 1 ? 'blok' : lekcje.length < 5 ? 'bloki' : 'bloków'} zajęć
                {online ? ' · online' : ''}
              </span>
            </span>
            <span className="za-ile">{zaIleDni(roznicaDni(dzis, d))}</span>
          </button>
        )
      })}
    </div>
  )
}

export function WidokNadchodzace() {
  const { wpisy, dzis, ustawienia } = useApp()
  const studia = ustawienia.profil === 'studia'
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
      <Naglowek
        tytul="Nadchodzące"
        podtytul={<span>{studia ? 'Zjazdy, egzaminy i wydarzenia' : 'Sprawdziany, wydarzenia i najbliższe dni wolne'}</span>}
      />

      {studia && (
        <>
          <h2 className="sekcja-tytul" style={{ marginTop: 8 }}>
            Najbliższe zjazdy
          </h2>
          <Zjazdy />
        </>
      )}

      <h2 className="sekcja-tytul" style={studia ? undefined : { marginTop: 8 }}>
        {studia ? 'Egzaminy i kolokwia' : 'Sprawdziany i kartkówki'}
      </h2>
      {sprawdziany.length ? (
        <ListaPozycji wpisy={sprawdziany} />
      ) : (
        <div className="pusto">Brak zaplanowanych sprawdzianów. Dodaj je przyciskiem +.</div>
      )}

      <h2 className="sekcja-tytul">Wycieczki i wydarzenia</h2>
      {wydarzenia.length ? <ListaPozycji wpisy={wydarzenia} /> : <div className="pusto">Brak wydarzeń.</div>}

      {!studia && (
        <>
          <h2 className="sekcja-tytul">Dni wolne</h2>
          {wolne.length ? <ListaPozycji wpisy={wolne} /> : <div className="pusto">Brak dni wolnych.</div>}
        </>
      )}
    </div>
  )
}
