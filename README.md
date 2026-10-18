# Plan lekcji 6G

Aplikacja PWA z planem lekcji klasy 6G (rok szkolny 2026/2027) i kalendarzem: notatki do lekcji,
sprawdziany, wycieczki, dni wolne, odwołane lekcje i zastępstwa. Działa offline, dane zostają na telefonie.

## Edycja danych

- Plan lekcji: `src/data/timetable.ts`
- Ramy roku i dni wolne z kalendarza MEN: `src/data/schoolCalendar.ts`
  (wczytywane tylko przy pierwszym uruchomieniu; później użyj „Przywróć domyślny kalendarz szkolny” w Ustawieniach)

## Praca lokalna

```bash
npm install
npm run dev      # podgląd z automatycznym odświeżaniem
npm run build    # wersja produkcyjna do folderu dist/
npm run preview  # podgląd wersji produkcyjnej (z service workerem)
```

Ikony generuje `npm run icons` z pliku `public/kot-rycerz.png` (skrypt `scripts/ikona.mjs`).

## Publikacja na GitHub Pages

1. Załóż konto na github.com (jeśli go nie masz) i utwórz nowe repozytorium, np. `plan-lekcji-6g`.
   Na darmowym koncie GitHub Pages działa tylko dla repozytoriów **publicznych** — kod (w tym nazwiska
   nauczycieli z planu) będzie widoczny. Twoje wpisy w aplikacji nie trafiają do repozytorium.
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. W folderze projektu wyślij kod (zamień `LOGIN` na swoją nazwę użytkownika):

   ```bash
   git init
   git add .
   git commit -m "Plan lekcji 6G"
   git branch -M main
   git remote add origin https://github.com/LOGIN/plan-lekcji-6g.git
   git push -u origin main
   ```

4. Zakładka **Actions** pokaże workflow „Publikacja na GitHub Pages”. Po zielonym znaczniku (ok. 1 min)
   aplikacja jest pod adresem `https://LOGIN.github.io/plan-lekcji-6g/`.
   Jeśli pierwsze uruchomienie się nie powiodło, bo Pages nie było jeszcze włączone, kliknij „Re-run jobs”.

Ścieżka bazowa (`/plan-lekcji-6g/`) jest ustawiana automatycznie z nazwy repozytorium.
Wyjątek: repozytorium o nazwie `LOGIN.github.io` — wtedy w `.github/workflows/deploy.yml` ustaw `BASE_PATH: /`.

Każdy kolejny `git push` publikuje nową wersję; telefon pobierze ją przy następnym uruchomieniu z internetem.

## Instalacja na iPhonie

1. Otwórz adres aplikacji w **Safari** (nie w Chrome ani innej przeglądarce).
2. Poczekaj, aż strona się w pełni załaduje.
3. Stuknij **Udostępnij** (kwadrat ze strzałką) → **Do ekranu początkowego** → **Dodaj**.
4. Uruchom aplikację z nowej ikony „Plan 6G” raz z internetem — od tej chwili działa także offline.

## Dane i kopia zapasowa

- Wpisy są zapisane w IndexedDB tylko na tym urządzeniu (bez kont i serwera).
- Usunięcie ikony aplikacji z ekranu początkowego **usuwa też dane**.
- Regularnie rób kopię: **Ustawienia → Eksportuj JSON → Zachowaj w Plikach** (np. na iCloud Drive).
  Przywracanie: **Importuj JSON** (dołącz do obecnych lub zastąp wszystkie).
