import { useEffect, useRef } from 'react'
import { Godzina, KartaLekcji, Kropki, Naglowek, Paski } from '../components/Elementy'
import { DNI_TYGODNIA, GODZINY } from '../data/timetable'
import { DNI, dataSlownie, dodajDni, dzienTygodnia, poczatekTygodnia, wielka, zakresSlownie, zISO } from '../logic/dates'
import { najblizszyDzienZLekcjami, opisDnia } from '../logic/schedule'
import { useSwipe } from '../hooks'
import { useApp } from '../kontekst'
import { ETYKIETY_WOLNEGO, type DataISO } from '../model'

const SZER_KOLUMNY = 200 + 8

export function WidokTydzien(props: { data: DataISO; ustawDate: (d: DataISO) => void }) {
  const { ustawienia } = useApp()
  return ustawienia.profil === 'studia' ? <TydzienStudia {...props} /> : <TydzienSzkola {...props} />
}

/** Studia: tylko dni z zajęciami, każdy jako kolumna z kartami w kolejności godzin. */
function TydzienStudia({ data, ustawDate }: { data: DataISO; ustawDate: (d: DataISO) => void }) {
  const { wpisy, ustawienia, dzis, otworzDzien, nowyWpis } = useApp()
  const poniedzialek = poczatekTygodnia(data)
  const tydzien = [0, 1, 2, 3, 4, 5, 6].map((i) => opisDnia(dodajDni(poniedzialek, i), wpisy, ustawienia))
  const dni = tydzien.filter((d) => d.stan.rodzaj !== 'brak' || d.wszystkie.length > 0)
  const tenTydzien = poniedzialek === poczatekTygodnia(dzis)
  const idz = (n: number) => ustawDate(dodajDni(poniedzialek, n * 7))
  const swipe = useSwipe(
    () => idz(1),
    () => idz(-1),
  )
  const nast = dni.length ? null : najblizszyDzienZLekcjami(dodajDni(poniedzialek, 6), wpisy, ustawienia)
  const przewijanie = useRef<HTMLDivElement>(null)

  // Przewiń do dzisiejszego (lub wybranego) dnia, jeśli jest w tym tygodniu.
  useEffect(() => {
    const el = przewijanie.current
    const cel = el?.querySelector<HTMLElement>(`[data-dzien="${tenTydzien ? dzis : data}"]`)
    if (el && cel) el.scrollTo({ left: cel.offsetLeft - 16, behavior: 'instant' as ScrollBehavior })
  }, [poniedzialek])

  return (
    <div>
      <div {...swipe}>
        <Naglowek
          tytul="Tydzień"
          onWstecz={() => idz(-1)}
          onDalej={() => idz(1)}
          etykietaWstecz="Poprzedni tydzień"
          etykietaDalej="Następny tydzień"
          podtytul={
            <>
              <span>{zakresSlownie(poniedzialek, dodajDni(poniedzialek, 6))}</span>
              {!tenTydzien && (
                <button className="przycisk-dzis" onClick={() => ustawDate(dzis)}>
                  Ten tydzień
                </button>
              )}
            </>
          }
        />
      </div>

      {dni.length === 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Paski
            duze
            pigulka="Studia"
            tytul="Brak zajęć w tym tygodniu"
            podpis={nast ? `Najbliższe: ${DNI[dzienTygodnia(nast.data)]}, ${dataSlownie(nast.data)} — stuknij` : 'Koniec planu zajęć'}
            onKlik={nast ? () => ustawDate(nast.data) : undefined}
          />
        </div>
      ) : (
        <div className="tydzien-przewijanie" ref={przewijanie}>
          <div className="kolumny-studia">
            {dni.map((d) => (
              <section key={d.data} className="kolumna-studia" data-dzien={d.data}>
                <button className={`naglowek-dnia${d.data === dzis ? ' dzis' : ''}`} onClick={() => otworzDzien(d.data)}>
                  <span className="naglowek-dnia-nazwa">
                    {wielka(DNI[dzienTygodnia(d.data)])} <Kropki wpisy={[...d.wydarzenia, ...d.luzne]} />
                  </span>
                  <span>
                    {zISO(d.data).getDate()}.{String(zISO(d.data).getMonth() + 1).padStart(2, '0')}
                  </span>
                </button>
                {d.stan.rodzaj === 'wolne' ? (
                  <Paski
                    pigulka={ETYKIETY_WOLNEGO[d.stan.wolne.rodzaj]}
                    tytul={d.stan.wolne.nazwa}
                    onKlik={() => otworzDzien(d.data)}
                  />
                ) : d.stan.rodzaj === 'lekcje' ? (
                  d.stan.lekcje.map((l) => (
                    <div key={l.nr} className="blok-studia">
                      <span className="czas-studia">
                        {l.od.replace(/^0/, '')}–{l.do.replace(/^0/, '')}
                      </span>
                      <KartaLekcji
                        lekcja={l}
                        kompakt
                        onKlik={() => otworzDzien(d.data)}
                        onDlugi={() => nowyWpis({ typ: 'notatka', data: d.data, lekcja: l.nr })}
                      />
                    </div>
                  ))
                ) : (
                  <div className="pusto">Brak zajęć</div>
                )}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TydzienSzkola({ data, ustawDate }: { data: DataISO; ustawDate: (d: DataISO) => void }) {
  const { wpisy, ustawienia, dzis, otworzDzien, nowyWpis } = useApp()
  const przewijanie = useRef<HTMLDivElement>(null)
  // W weekend pokazujemy nadchodzący tydzień.
  const poniedzialek = poczatekTygodnia(dzienTygodnia(data) > 4 ? dodajDni(data, 2) : data)
  const dni = [0, 1, 2, 3, 4].map((i) => opisDnia(dodajDni(poniedzialek, i), wpisy, ustawienia))
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
