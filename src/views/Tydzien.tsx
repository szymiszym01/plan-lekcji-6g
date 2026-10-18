import { useEffect, useRef } from 'react'
import { Godzina, KartaLekcji, Kropki, Naglowek, Paski } from '../components/Elementy'
import { DNI_TYGODNIA, GODZINY } from '../data/timetable'
import { dodajDni, dzienTygodnia, poczatekTygodnia, zakresSlownie, zISO } from '../logic/dates'
import { opisDnia } from '../logic/schedule'
import { useSwipe } from '../hooks'
import { useApp } from '../kontekst'
import { ETYKIETY_WOLNEGO, type DataISO } from '../model'

const SZER_KOLUMNY = 200 + 8

export function WidokTydzien({ data, ustawDate }: { data: DataISO; ustawDate: (d: DataISO) => void }) {
  const { wpisy, ustawienia, dzis, otworzDzien, nowyWpis } = useApp()
  const przewijanie = useRef<HTMLDivElement>(null)
  // W weekend pokazujemy nadchodzący tydzień.
  const poniedzialek = poczatekTygodnia(dzienTygodnia(data) > 4 ? dodajDni(data, 2) : data)
  const dni = [0, 1, 2, 3, 4].map((i) => opisDnia(dodajDni(poniedzialek, i), wpisy, ustawienia.grupa))
  const tenTydzien = poniedzialek === poczatekTygodnia(dzienTygodnia(dzis) > 4 ? dodajDni(dzis, 2) : dzis)

  // Po zmianie tygodnia przewiń do dzisiejszego (lub wybranego) dnia.
  useEffect(() => {
    const el = przewijanie.current
    if (!el) return
    const cel = tenTydzien ? dzis : data
    const idx = dzienTygodnia(cel) > 4 ? 0 : dzienTygodnia(cel)
    el.scrollTo({ left: idx * SZER_KOLUMNY, behavior: 'instant' as ScrollBehavior })
  }, [poniedzialek])

  const idz = (n: number) => ustawDate(dodajDni(poniedzialek, n * 7))
  const swipeNaglowka = useSwipe(
    () => idz(1),
    () => idz(-1),
  )

  return (
    <div>
      <div {...swipeNaglowka}>
        <Naglowek
          tytul="Tydzień"
          onWstecz={() => idz(-1)}
          onDalej={() => idz(1)}
          etykietaWstecz="Poprzedni tydzień"
          etykietaDalej="Następny tydzień"
          podtytul={
            <>
              <span>{zakresSlownie(poniedzialek, dodajDni(poniedzialek, 4))}</span>
              {!tenTydzien && (
                <button className="przycisk-dzis" onClick={() => ustawDate(dzis)}>
                  Ten tydzień
                </button>
              )}
            </>
          }
        />
      </div>

      <div className="tydzien-przewijanie" ref={przewijanie}>
        <div className="siatka-tygodnia">
          <div className="rog" style={{ gridColumn: 1, gridRow: 1 }} />
          {dni.map((d, i) => (
            <button
              key={d.data}
              className={`naglowek-dnia${d.data === dzis ? ' dzis' : ''}`}
              style={{ gridColumn: i + 2, gridRow: 1 }}
              onClick={() => otworzDzien(d.data)}
            >
              <span className="naglowek-dnia-nazwa">
                {DNI_TYGODNIA[i]} <Kropki wpisy={[...d.wydarzenia, ...d.luzne]} />
              </span>
              <span>
                {zISO(d.data).getDate()}.{String(zISO(d.data).getMonth() + 1).padStart(2, '0')}
              </span>
            </button>
          ))}

          {GODZINY.map((g, r) => (
            <div key={g.nr} style={{ gridColumn: 1, gridRow: r + 2, display: 'flex' }} className="kol-godzin">
              <Godzina nr={g.nr} od={g.od} doGodz={g.do} />
            </div>
          ))}

          {dni.map((d, i) => {
            const { stan } = d
            if (stan.rodzaj !== 'lekcje') {
              const [pig, tyt] =
                stan.rodzaj === 'wolne'
                  ? [ETYKIETY_WOLNEGO[stan.wolne.rodzaj], stan.wolne.nazwa]
                  : stan.rodzaj === 'po'
                    ? ['Wakacje', stan.wolne?.nazwa ?? 'Wakacje']
                    : stan.rodzaj === 'przed'
                      ? ['Wakacje', 'Przed rokiem szkolnym']
                      : ['Weekend', '']
              return (
                <div key={d.data} style={{ gridColumn: i + 2, gridRow: '2 / span 8', display: 'flex' }}>
                  <Paski className="kolumna-wolna" pigulka={pig} tytul={tyt} onKlik={() => otworzDzien(d.data)} />
                </div>
              )
            }
            return stan.lekcje.map((l, r) => (
              <div key={`${d.data}-${l.nr}`} style={{ gridColumn: i + 2, gridRow: r + 2, display: 'flex' }}>
                <KartaLekcji
                  lekcja={l}
                  kompakt
                  aktualna={false}
                  onKlik={() => otworzDzien(d.data)}
                  onDlugi={() =>
                    nowyWpis({
                      typ: 'notatka',
                      data: d.data,
                      lekcja: l.nr,
                      grupa: l.zajecia.length === 1 ? l.zajecia[0].grupa : undefined,
                    })
                  }
                />
              </div>
            ))
          })}
        </div>
      </div>
    </div>
  )
}
