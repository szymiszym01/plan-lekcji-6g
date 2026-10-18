import { useRef } from 'react'
import { Godzina, KartaLekcji, Naglowek, Paski, WpisChip } from '../components/Elementy'
import { POCZATEK_ZAJEC } from '../data/schoolCalendar'
import {
  DNI, dataSlownie, dodajDni, dzienTygodnia, minuty, roznicaDni, wielka, zakresSlownie, zaIleDni,
} from '../logic/dates'
import { najblizszyDzienZLekcjami, opisDnia, type Dzien, type LekcjaWidok } from '../logic/schedule'
import { useSwipe, useTeraz } from '../hooks'
import { useApp } from '../kontekst'
import { ETYKIETY_WOLNEGO, type DataISO } from '../model'

const czyLekcja = (l: LekcjaWidok) => !l.swietlica && !l.zajecia.every((z) => z.odwolana)

function formatCzas(sekundy: number) {
  const s = Math.max(0, Math.round(sekundy))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`
  return `${m}:${String(ss).padStart(2, '0')}`
}

function Odliczanie({ lekcje, teraz, studia }: { lekcje: LekcjaWidok[]; teraz: Date; studia: boolean }) {
  const sek = teraz.getHours() * 3600 + teraz.getMinutes() * 60 + teraz.getSeconds()
  const biezaca = lekcje.find((l) => sek >= minuty(l.od) * 60 && sek < minuty(l.do) * 60)
  const nastepna = lekcje.find((l) => minuty(l.od) * 60 > sek)
  const nazwa = (l: LekcjaWidok) =>
    l.swietlica ? 'Świetlica' : l.zajecia.map((z) => z.przedmiot + (z.odwolana ? ' (odwołana)' : '')).join(' / ')

  if (biezaca) {
    return (
      <div className="odliczanie" aria-live="polite">
        <span className="odliczanie-czas">{formatCzas(minuty(biezaca.do) * 60 - sek)}</span>
        <span className="odliczanie-opis">
          {studia ? 'do końca zajęć' : `do końca lekcji ${biezaca.nr}`}
          <small>{nazwa(biezaca)}{nastepna ? ` · potem ${nazwa(nastepna)}` : ''}</small>
        </span>
      </div>
    )
  }
  if (nastepna) {
    return (
      <div className="odliczanie" aria-live="polite">
        <span className="odliczanie-czas">{formatCzas(minuty(nastepna.od) * 60 - sek)}</span>
        <span className="odliczanie-opis">
          {studia
            ? nastepna.nr === 1 ? 'do początku zajęć' : 'do następnych zajęć'
            : `${nastepna.nr === 1 ? 'do początku lekcji' : 'do lekcji'} ${nastepna.nr}`}
          <small>{nazwa(nastepna)} · {nastepna.od}</small>
        </span>
      </div>
    )
  }
  return null
}

function ListaLekcji({ dzien, teraz, czyDzis }: { dzien: Dzien; teraz?: Date; czyDzis: boolean }) {
  const { nowyWpis } = useApp()
  if (dzien.stan.rodzaj !== 'lekcje') return null
  const min = teraz ? teraz.getHours() * 60 + teraz.getMinutes() : -1
  return (
    <div className="lista-lekcji">
      {dzien.stan.lekcje.map((l) => {
        const aktualna = czyDzis && min >= minuty(l.od) && min < minuty(l.do)
        const minela = czyDzis && min >= minuty(l.do)
        const grupa = l.zajecia.length === 1 ? l.zajecia[0].grupa : undefined
        return (
          <div key={l.nr} className={`wiersz${minela ? ' minela' : ''}`}>
            <Godzina nr={l.nr} od={l.od} doGodz={l.do} />
            <KartaLekcji
              lekcja={l}
              aktualna={aktualna}
              pokazWpisy
              onDlugi={() => nowyWpis({ typ: 'notatka', data: dzien.data, lekcja: l.nr, grupa })}
            />
          </div>
        )
      })}
    </div>
  )
}

function PodgladNajblizszego({ od }: { od: DataISO }) {
  const { wpisy, ustawienia, dzis, otworzDzien } = useApp()
  const nast = najblizszyDzienZLekcjami(od, wpisy, ustawienia)
  if (!nast || nast.stan.rodzaj !== 'lekcje') return null
  const lekcje = nast.stan.lekcje.filter((l) => czyLekcja(l) || l.wpisy.length)
  const ile = roznicaDni(dzis, nast.data)
  return (
    <>
      <h2 className="sekcja-tytul">
        {ustawienia.profil === 'studia' ? 'Najbliższe zajęcia' : 'Najbliższe lekcje'}{' '}
        <small>
          {wielka(DNI[dzienTygodnia(nast.data)])}, {dataSlownie(nast.data)}
          {ile >= 0 ? ` · ${zaIleDni(ile)}` : ''}
        </small>
      </h2>
      {[...nast.wydarzenia, ...nast.luzne].length > 0 && (
        <div className="sekcja-wpisow">
          {[...nast.wydarzenia, ...nast.luzne].map((w) => (
            <WpisChip key={w.id} wpis={w} duzy />
          ))}
        </div>
      )}
      <div className="lista-lekcji">
        {lekcje.map((l) => (
          <div key={l.nr} className="wiersz">
            <Godzina nr={l.nr} od={l.od} doGodz={l.do} />
            <KartaLekcji lekcja={l} pokazWpisy onKlik={() => otworzDzien(nast.data)} />
          </div>
        ))}
      </div>
    </>
  )
}

export function WidokDzien({ data, ustawDate }: { data: DataISO; ustawDate: (d: DataISO) => void }) {
  const { wpisy, ustawienia, dzis, nowyWpis, edytujWpis } = useApp()
  const teraz = useTeraz(1000)
  const kierunek = useRef<'lewo' | 'prawo' | null>(null)
  const czyDzis = data === dzis
  const studia = ustawienia.profil === 'studia'
  const dzien = opisDnia(data, wpisy, ustawienia)

  const idz = (n: number) => {
    kierunek.current = n > 0 ? 'lewo' : 'prawo'
    ustawDate(dodajDni(data, n))
  }
  const swipe = useSwipe(
    () => idz(1),
    () => idz(-1),
  )

  const roznica = roznicaDni(dzis, data)
  const ktory =
    roznica === 0 ? 'dziś' : roznica === 1 ? 'jutro' : roznica === -1 ? 'wczoraj' : null

  let podsumowanie: string | null = null
  if (dzien.stan.rodzaj === 'lekcje') {
    const lekcje = dzien.stan.lekcje.filter(czyLekcja)
    const ostatnia = lekcje[lekcje.length - 1]
    if (ostatnia && studia) podsumowanie = `zajęcia ${lekcje[0].od.replace(/^0/, '')}–${ostatnia.do}`
    else if (ostatnia)
      podsumowanie = `${lekcje.length} ${lekcje.length === 1 ? 'lekcja' : lekcje.length < 5 ? 'lekcje' : 'lekcji'} · do ${ostatnia.do}`
  }

  const { stan } = dzien
  let blok: JSX.Element | null = null
  if (stan.rodzaj === 'przed')
    blok = (
      <Paski
        duze
        pigulka="Przed rokiem szkolnym"
        tytul="Rok szkolny jeszcze się nie zaczął"
        podpis={`Pierwszy dzień zajęć: ${DNI[dzienTygodnia(POCZATEK_ZAJEC)]}, ${dataSlownie(POCZATEK_ZAJEC)}`}
      />
    )
  else if (stan.rodzaj === 'po')
    blok = (
      <Paski
        duze
        pigulka="Wakacje"
        tytul={stan.wolne?.nazwa ?? 'Wakacje'}
        podpis="Rok szkolny się skończył"
        onKlik={stan.wolne ? () => edytujWpis(stan.wolne!) : undefined}
      />
    )
  else if (stan.rodzaj === 'wolne')
    blok = (
      <Paski
        duze
        pigulka={ETYKIETY_WOLNEGO[stan.wolne.rodzaj]}
        tytul={stan.wolne.nazwa}
        podpis={stan.wolne.od !== stan.wolne.do ? zakresSlownie(stan.wolne.od, stan.wolne.do) : 'Dzień wolny od zajęć'}
        onKlik={() => edytujWpis(stan.wolne)}
      />
    )
  else if (stan.rodzaj === 'weekend')
    blok = <Paski duze pigulka="Weekend" tytul={wielka(DNI[dzienTygodnia(data)])} podpis="Brak lekcji" />
  else if (stan.rodzaj === 'brak')
    blok = <Paski duze pigulka="Studia" tytul="Brak zajęć" podpis={`${wielka(DNI[dzienTygodnia(data)])}, ${dataSlownie(data)}`} />

  return (
    <div {...swipe}>
      <Naglowek
        tytul={wielka(DNI[dzienTygodnia(data)])}
        onWstecz={() => idz(-1)}
        onDalej={() => idz(1)}
        etykietaWstecz="Poprzedni dzień"
        etykietaDalej="Następny dzień"
        onDlugi={() => nowyWpis({ typ: 'wydarzenie', data })}
        podtytul={
          <>
            <span>
              {dataSlownie(data)}
              {ktory ? ` · ${ktory}` : ''}
              {podsumowanie ? ` · ${podsumowanie}` : ''}
            </span>
            {!czyDzis && (
              <button
                className="przycisk-dzis"
                onClick={() => {
                  kierunek.current = data > dzis ? 'prawo' : 'lewo'
                  ustawDate(dzis)
                }}
              >
                Dziś
              </button>
            )}
          </>
        }
      />

      <div
        key={data}
        className={kierunek.current === 'lewo' ? 'przesun-lewo' : kierunek.current === 'prawo' ? 'przesun-prawo' : ''}
      >
        {czyDzis && stan.rodzaj === 'lekcje' && <Odliczanie lekcje={stan.lekcje} teraz={teraz} studia={studia} />}

        {dzien.wydarzenia.length + dzien.luzne.length > 0 && (
          <div className="sekcja-wpisow">
            {dzien.wydarzenia.map((w) => (
              <WpisChip key={w.id} wpis={w} duzy />
            ))}
            {dzien.luzne.map((w) => (
              <WpisChip key={w.id} wpis={w} duzy />
            ))}
          </div>
        )}

        {blok}
        <ListaLekcji dzien={dzien} teraz={czyDzis ? teraz : undefined} czyDzis={czyDzis} />
        {stan.rodzaj !== 'lekcje' && <PodgladNajblizszego od={data} />}
      </div>
    </div>
  )
}
