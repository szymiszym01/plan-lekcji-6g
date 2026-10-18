import { useEffect, useRef, useState } from 'react'
import { Naglowek } from '../components/Elementy'
import { KONIEC_ZAJEC, POCZATEK_ZAJEC, ROK_SZKOLNY } from '../data/schoolCalendar'
import { eksportuj, importuj, odczytajKopie, poprosOTrwalyZapis, przywrocKalendarzMEN } from '../db'
import { dataSlownie, dzisiaj } from '../logic/dates'
import { useApp } from '../kontekst'
import type { WyborGrupy, WyborLektoratu } from '../model'

const GRUPY: { id: WyborGrupy; etykieta: string }[] = [
  { id: '1', etykieta: 'Grupa 1' },
  { id: '2', etykieta: 'Grupa 2' },
  { id: 'obie', etykieta: 'Obie' },
]

const LEKTORATY: { id: WyborLektoratu; etykieta: string }[] = [
  { id: 'ang', etykieta: 'Angielski' },
  { id: 'niem', etykieta: 'Niemiecki' },
  { id: 'oba', etykieta: 'Oba' },
]

export function WidokUstawienia() {
  const { ustawienia, zmienUstawienia, wpisy, odswiez, zapytaj, komunikat } = useApp()
  const plik = useRef<HTMLInputElement>(null)
  const [trwaly, setTrwaly] = useState<boolean | null | undefined>(undefined)

  useEffect(() => {
    navigator.storage?.persisted?.().then(setTrwaly, () => setTrwaly(null))
  }, [])

  // Plik kopii przygotowujemy z wyprzedzeniem: Safari na iPhonie otwiera arkusz udostępniania
  // tylko bezpośrednio po stuknięciu, bez czekania na odczyt z bazy.
  const [kopia, setKopia] = useState<File | null>(null)
  useEffect(() => {
    let aktualne = true
    eksportuj().then((blob) => {
      if (aktualne)
        setKopia(new File([blob], `plan-lekcji-6g-kopia-${dzisiaj()}.json`, { type: 'application/json' }))
    })
    return () => {
      aktualne = false
    }
  }, [wpisy, ustawienia])

  function pobierz(file: File) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  function eksport() {
    if (!kopia) return komunikat('Przygotowuję kopię, spróbuj za chwilę')
    // Na iPhonie arkusz udostępniania pozwala „Zachować w Plikach”.
    if (navigator.canShare?.({ files: [kopia] })) {
      navigator.share({ files: [kopia], title: 'Kopia zapasowa planu lekcji' }).then(
        () => komunikat('Kopia zapisana'),
        (e: Error) => {
          if (e.name === 'AbortError') return
          pobierz(kopia)
        },
      )
      return
    }
    pobierz(kopia)
  }

  async function wybranoPlik(f: File | undefined) {
    if (!f) return
    try {
      const { wpisy: nowe, ustawienia: u } = odczytajKopie(await f.text())
      const wybor = await zapytaj({
        tytul: 'Import kopii zapasowej',
        tresc: `Plik zawiera ${nowe.length} wpisów (z obu planów).`,
        przyciski: [
          { id: 'polacz', etykieta: 'Dołącz do obecnych', styl: 'glowny' },
          { id: 'zastap', etykieta: 'Zastąp wszystkie wpisy', styl: 'usun' },
          { id: 'anuluj', etykieta: 'Anuluj' },
        ],
      })
      if (wybor !== 'polacz' && wybor !== 'zastap') return
      await importuj(nowe, wybor, u)
      if (wybor === 'zastap' && u) zmienUstawienia({ ...ustawienia, ...u })
      await odswiez()
      komunikat(`Zaimportowano ${nowe.length} wpisów`)
    } catch (e) {
      await zapytaj({ tytul: 'Nie udało się zaimportować', tresc: (e as Error).message, przyciski: [{ id: 'ok', etykieta: 'OK', styl: 'glowny' }] })
    } finally {
      if (plik.current) plik.current.value = ''
    }
  }

  async function przywroc() {
    const ok = await zapytaj({
      tytul: 'Przywrócić domyślny kalendarz?',
      tresc:
        'Dni wolne z kalendarza MEN zostaną wczytane od nowa. Twoje zmiany w tych dniach przepadną. Pozostałe wpisy się nie zmienią.',
      przyciski: [
        { id: 'tak', etykieta: 'Przywróć', styl: 'glowny' },
        { id: 'nie', etykieta: 'Anuluj' },
      ],
    })
    if (ok !== 'tak') return
    await przywrocKalendarzMEN()
    await odswiez()
    komunikat('Przywrócono kalendarz szkolny')
  }

  return (
    <div>
      <Naglowek tytul="Ustawienia" />

      {ustawienia.profil === 'studia' ? (
        <section className="panel">
          <h3>Mój lektorat</h3>
          <p>W planie studiów są dwa lektoraty (Warsztaty kompetencji językowych 2). Drugi zostanie ukryty.</p>
          <div className="segmenty" role="radiogroup" aria-label="Lektorat">
            {LEKTORATY.map((g) => (
              <button
                key={g.id}
                role="radio"
                aria-checked={ustawienia.lektorat === g.id}
                className={ustawienia.lektorat === g.id ? 'wybrany' : ''}
                onClick={() => zmienUstawienia({ ...ustawienia, lektorat: g.id })}
              >
                {g.etykieta}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel">
          <h3>Moja grupa</h3>
          <p>Lekcje drugiej grupy będą ukryte w planie.</p>
          <div className="segmenty" role="radiogroup" aria-label="Grupa">
            {GRUPY.map((g) => (
              <button
                key={g.id}
                role="radio"
                aria-checked={ustawienia.grupa === g.id}
                className={ustawienia.grupa === g.id ? 'wybrany' : ''}
                onClick={() => zmienUstawienia({ ...ustawienia, grupa: g.id })}
              >
                {g.etykieta}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h3>Kopia zapasowa</h3>
        <p>
          Zapisz wszystkie wpisy (z obu planów) do pliku JSON, np. w aplikacji Pliki lub na iCloud Drive. Z tego pliku możesz
          je później przywrócić.
        </p>
        <div className="przyciski">
          <button className="przycisk" onClick={eksport}>
            Eksportuj JSON
          </button>
          <button className="przycisk obrys" onClick={() => plik.current?.click()}>
            Importuj JSON
          </button>
          <input
            ref={plik}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => wybranoPlik(e.target.files?.[0])}
          />
        </div>
      </section>

      {ustawienia.profil === 'szkola' && (
        <section className="panel">
          <h3>Kalendarz szkolny</h3>
          <p>
            Rok szkolny {ROK_SZKOLNY}: od {dataSlownie(POCZATEK_ZAJEC)} {POCZATEK_ZAJEC.slice(0, 4)} do{' '}
            {dataSlownie(KONIEC_ZAJEC)} {KONIEC_ZAJEC.slice(0, 4)}. Dni wolne z kalendarza MEN możesz edytować jak każdy wpis.
          </p>
          <button className="przycisk obrys" onClick={przywroc}>
            Przywróć domyślny kalendarz szkolny
          </button>
        </section>
      )}

      <section className="panel">
        <h3>Pamięć</h3>
        <p>
          Dane są zapisane tylko na tym urządzeniu.{' '}
          {trwaly === true
            ? 'Przeglądarka nie usunie ich automatycznie.'
            : trwaly === false
              ? 'Pamięć nie jest jeszcze oznaczona jako trwała. Dodaj aplikację do ekranu początkowego i rób kopie zapasowe.'
              : ''}
        </p>
        {trwaly === false && (
          <button
            className="przycisk obrys"
            onClick={async () => {
              const r = await poprosOTrwalyZapis()
              setTrwaly(r)
              komunikat(r ? 'Pamięć jest trwała' : 'Przeglądarka odmówiła')
            }}
          >
            Poproś o trwałą pamięć
          </button>
        )}
      </section>

      <p className="pusto" style={{ textAlign: 'center', fontSize: 13 }}>
        Plan lekcji 6G · wersja {__WERSJA__}
      </p>
    </div>
  )
}
