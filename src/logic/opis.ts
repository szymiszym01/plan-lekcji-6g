import { ETYKIETY_WOLNEGO, type Wpis } from '../model'
import { zakresSlownie } from './dates'

/** Krótka etykieta typu i tekst wpisu do wyświetlenia na liście lub pod lekcją. */
export function opisWpisu(w: Wpis, zPrzedmiotem = true): { etykieta: string; tekst: string } {
  switch (w.typ) {
    case 'notatka':
      return { etykieta: 'Notatka', tekst: w.tekst }
    case 'sprawdzian': {
      const etykieta = w.rodzaj === 'kartkowka' ? 'Kartkówka' : 'Sprawdzian'
      const czesci = [zPrzedmiotem ? w.przedmiot : '', w.zakres ?? ''].filter(Boolean)
      return { etykieta, tekst: czesci.join(' — ') || w.przedmiot }
    }
    case 'wydarzenie': {
      const godz = w.godzOd ? ` ${w.godzOd}${w.godzDo ? `–${w.godzDo}` : ''}` : ''
      const miejsce = w.miejsce ? ` · ${w.miejsce}` : ''
      return { etykieta: 'Wydarzenie', tekst: `${w.tytul}${godz}${miejsce}` }
    }
    case 'wolne':
      return { etykieta: ETYKIETY_WOLNEGO[w.rodzaj], tekst: `${w.nazwa} · ${zakresSlownie(w.od, w.do)}` }
    case 'zmiana': {
      const gr = w.grupa ? ` (gr ${w.grupa})` : ''
      if (w.odwolana) return { etykieta: 'Odwołana', tekst: `Lekcja ${w.lekcja}${gr}` }
      const co = [w.przedmiot, w.nauczyciel, w.sala ? `s. ${w.sala}` : ''].filter(Boolean).join(', ')
      return { etykieta: 'Zastępstwo', tekst: `Lekcja ${w.lekcja}${gr}: ${co}` }
    }
  }
}
