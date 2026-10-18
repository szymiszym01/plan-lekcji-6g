import { useState } from 'react'
import { Naglowek } from '../components/Elementy'
import { DNI_KROTKIE, MIESIACE, dodajDni, doISO, poczatekTygodnia, wielka, zISO } from '../logic/dates'
import { opisDnia } from '../logic/schedule'
import { useLongPress, useSwipe } from '../hooks'
import { useApp } from '../kontekst'
import type { DataISO, Wpis } from '../model'
import { ListaPozycji } from './Nadchodzace'

function Komorka(props: { data: DataISO; poza: boolean }) {
  const { wpisy, ustawienia, dzis, otworzDzien, nowyWpis } = useApp()
  const dzien = opisDnia(props.data, wpisy, ustawienia.grupa)
  const lp = useLongPress(
    () => nowyWpis({ typ: 'wydarzenie', data: props.data }),
    () => otworzDzien(props.data),
  )
  const r = dzien.stan.rodzaj
  const wolny = r === 'wolne' || (r === 'po' && !!dzien.stan.wolne)
  const kropki = dzien.wszystkie.filter((w) => w.typ !== 'wolne').slice(0, 4)
  const klasy = [
    'komorka',
    wolny ? 'wolny' : r === 'weekend' ? 'weekend' : '',
    props.poza ? 'poza' : '',
    props.data === dzis ? 'dzis' : '',
  ].join(' ')
  return (
    <button className={klasy} {...lp} aria-label={props.data}>
      <span className="nr">{zISO(props.data).getDate()}</span>
      <span className="kropki">
        {kropki.map((w) => (
          <i key={w.id} className={`kropka ${w.typ}`} />
        ))}
      </span>
    </button>
  )
}

export function WidokMiesiac({ data }: { data: DataISO }) {
  const { wpisy, dzis } = useApp()
  const [miesiac, setMiesiac] = useState(() => data.slice(0, 7) + '-01')
  const d0 = zISO(miesiac)
  const rok = d0.getFullYear()
  const m = d0.getMonth()
  const idz = (n: number) => setMiesiac(doISO(new Date(rok, m + n, 1)))
  const swipe = useSwipe(
    () => idz(1),
    () => idz(-1),
  )

  const start = poczatekTygodnia(miesiac)
  const ostatni = doISO(new Date(rok, m + 1, 0))
  const dni: DataISO[] = []
  for (let d = start; d <= ostatni || dni.length % 7; d = dodajDni(d, 1)) dni.push(d)

  const prefiks = miesiac.slice(0, 7)
  const wTymMiesiacu = wpisy
    .filter((w): w is Exclude<Wpis, { typ: 'notatka' | 'zmiana' }> =>
      w.typ === 'sprawdzian'
        ? w.data.startsWith(prefiks)
        : w.typ === 'wydarzenie' || w.typ === 'wolne'
          ? w.od.slice(0, 7) <= prefiks && w.do.slice(0, 7) >= prefiks
          : false,
    )
    .sort((a, b) => (a.typ === 'sprawdzian' ? a.data : a.od).localeCompare(b.typ === 'sprawdzian' ? b.data : b.od))

  return (
    <div {...swipe}>
      <Naglowek
        tytul={wielka(MIESIACE[m])}
        onWstecz={() => idz(-1)}
        onDalej={() => idz(1)}
        etykietaWstecz="Poprzedni miesiąc"
        etykietaDalej="Następny miesiąc"
        podtytul={
          <>
            <span>{rok}</span>
            {prefiks !== dzis.slice(0, 7) && (
              <button className="przycisk-dzis" onClick={() => setMiesiac(dzis.slice(0, 7) + '-01')}>
                Dziś
              </button>
            )}
          </>
        }
      />

      <div className="siatka-miesiaca">
        {DNI_KROTKIE.map((d) => (
          <div key={d} className="dzien-tyg">
            {d}
          </div>
        ))}
        {dni.map((d) => (
          <Komorka key={d} data={d} poza={d.slice(0, 7) !== prefiks} />
        ))}
      </div>

      <div className="legenda">
        <span><i className="kropka sprawdzian" /> sprawdzian</span>
        <span><i className="kropka wydarzenie" /> wydarzenie</span>
        <span><i className="kropka notatka" /> notatka</span>
        <span><i className="kropka zmiana" /> zmiana</span>
        <span><i className="kropka wolne" /> dzień wolny</span>
      </div>

      <h2 className="sekcja-tytul">W tym miesiącu</h2>
      {wTymMiesiacu.length ? (
        <ListaPozycji wpisy={wTymMiesiacu} />
      ) : (
        <div className="pusto">Brak sprawdzianów, wydarzeń i dni wolnych. Przytrzymaj dzień, aby coś dodać.</div>
      )}
    </div>
  )
}
