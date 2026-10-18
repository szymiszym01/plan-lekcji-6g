import type { ReactNode } from 'react'
import { ROK_SZKOLNY } from '../data/schoolCalendar'
import type { LekcjaWidok } from '../logic/schedule'
import { opisWpisu } from '../logic/opis'
import { useLongPress } from '../hooks'
import { useApp } from '../kontekst'
import type { Wpis } from '../model'
import { IkonaDalej, IkonaWstecz } from './Ikony'

export function Chipy() {
  return (
    <div className="chipy">
      <span className="chip pelny">klasa 6G</span>
      <span className="chip">rok szkolny {ROK_SZKOLNY}</span>
    </div>
  )
}

export function Naglowek(props: {
  tytul: string
  podtytul?: ReactNode
  onWstecz?: () => void
  onDalej?: () => void
  onDlugi?: () => void
  etykietaWstecz?: string
  etykietaDalej?: string
}) {
  const lp = useLongPress(props.onDlugi)
  return (
    <header className="naglowek">
      <Chipy />
      <div className="naglowek-wiersz" style={{ marginTop: 14 }}>
        <h1 className="tytul" {...lp}>
          {props.tytul}
        </h1>
        {props.onWstecz && (
          <button className="strzalka" onClick={props.onWstecz} aria-label={props.etykietaWstecz ?? 'Wstecz'}>
            <IkonaWstecz />
          </button>
        )}
        {props.onDalej && (
          <button className="strzalka" onClick={props.onDalej} aria-label={props.etykietaDalej ?? 'Dalej'}>
            <IkonaDalej />
          </button>
        )}
      </div>
      {props.podtytul && <div className="podtytul">{props.podtytul}</div>}
    </header>
  )
}

export function WpisChip({ wpis, zPrzedmiotem = true, duzy }: { wpis: Wpis; zPrzedmiotem?: boolean; duzy?: boolean }) {
  const { edytujWpis } = useApp()
  const { etykieta, tekst } = opisWpisu(wpis, zPrzedmiotem)
  return (
    <button
      className={`wpis ${wpis.typ}${duzy ? ' duzy' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        edytujWpis(wpis)
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <span className="typ">{etykieta}</span>
      <span>{tekst}</span>
    </button>
  )
}

export function Kropki({ wpisy }: { wpisy: Wpis[] }) {
  if (!wpisy.length) return null
  return (
    <span className="kropki" aria-label={`${wpisy.length} wpisów`}>
      {wpisy.slice(0, 4).map((w) => (
        <i key={w.id} className={`kropka ${w.typ}`} />
      ))}
    </span>
  )
}

export function KartaLekcji(props: {
  lekcja: LekcjaWidok
  aktualna?: boolean
  kompakt?: boolean
  pokazWpisy?: boolean
  onKlik?: () => void
  onDlugi?: () => void
}) {
  const { lekcja, aktualna, kompakt, pokazWpisy } = props
  const lp = useLongPress(props.onDlugi, props.onKlik)
  const zmiany = lekcja.zajecia.map((z) => z.zmiana).filter((z): z is NonNullable<typeof z> => !!z)
  const kropki = kompakt ? <Kropki wpisy={[...lekcja.wpisy, ...new Set(zmiany)]} /> : null

  if (lekcja.swietlica) {
    const odwolana = lekcja.zajecia.every((z) => z.odwolana)
    return (
      <div
        className="paski"
        role="button"
        tabIndex={0}
        aria-label={`Lekcja ${lekcja.nr}: Świetlica`}
        {...lp}
        style={{ position: 'relative' }}
      >
        <span className="pigulka" style={odwolana ? { textDecoration: 'line-through', opacity: 0.5 } : undefined}>
          Świetlica
        </span>
        {!kompakt && <small>sala nr {lekcja.zajecia[0].sala}</small>}
        {kropki}
        {pokazWpisy && lekcja.wpisy.length > 0 && (
          <div className="wpisy" style={{ width: '100%' }}>
            {lekcja.wpisy.map((w) => (
              <WpisChip key={w.id} wpis={w} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const grupy = lekcja.zajecia.some((z) => z.grupa)
  return (
    <div
      className={`karta${grupy ? ' grupy' : ''}${aktualna ? ' aktualna' : ''}${lekcja.zajecia.every((z) => z.odwolana) ? ' odwolana-cala' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Lekcja ${lekcja.nr}: ${lekcja.zajecia.map((z) => (z.grupa ? `gr ${z.grupa} ` : '') + z.przedmiot).join(', ')}`}
      {...lp}
    >
      {aktualna && <span className="znacznik-teraz">TERAZ</span>}
      {kropki}
      {lekcja.zajecia.map((z, i) => (
        <div key={i} className={`zajecia${z.grupa ? '' : ' bez-grupy'}${z.odwolana ? ' odwolana' : ''}`}>
          {z.grupa && <span className="gr">gr {z.grupa}</span>}
          <div style={{ minWidth: 0 }}>
            {z.zmiana && <span className="etykieta-zmiany">{z.odwolana ? 'Odwołana' : 'Zastępstwo'}</span>}
            <div className="przedmiot">{z.przedmiot}</div>
            {z.nauczyciel && <div className="nauczyciel">{z.nauczyciel}</div>}
          </div>
          <span className="sala">s. {z.sala}</span>
        </div>
      ))}
      {pokazWpisy && lekcja.wpisy.length > 0 && (
        <div className="wpisy">
          {lekcja.wpisy.map((w) => (
            <WpisChip key={w.id} wpis={w} zPrzedmiotem={false} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Godzina({ nr, od, doGodz }: { nr: number; od: string; doGodz: string }) {
  return (
    <div className="godzina">
      <span className="numer">{nr}</span>
      <span className="czasy">
        {od.replace(/^0/, '')}
        <span>{doGodz.replace(/^0/, '')}</span>
      </span>
    </div>
  )
}

export function Paski(props: {
  pigulka: string
  tytul?: string
  podpis?: string
  duze?: boolean
  onKlik?: () => void
  className?: string
}) {
  return (
    <div
      className={`paski${props.duze ? ' duze' : ''} ${props.className ?? ''}`}
      role={props.onKlik ? 'button' : undefined}
      onClick={props.onKlik}
    >
      <span className="pigulka">{props.pigulka}</span>
      {props.tytul && (props.duze ? <h2>{props.tytul}</h2> : <h3>{props.tytul}</h3>)}
      {props.podpis && <small>{props.podpis}</small>}
    </div>
  )
}
