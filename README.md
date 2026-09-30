# Gym Gallery

**Artystyczny Silnik Architektury Sylwetki i Hipertrofii** — planer mezocyklu treningowego w formie procesu twórczego:
szkic na pergaminie → płótno olejne → marmurowa rzeźba.

Aplikacja SPA bez backendu: cały stan (podział, objętość, pigmenty, ciężary, pomiary, deload) zapisuje się w
`localStorage` przeglądarki pod kluczem `gym-gallery/state/v1`.

## Uruchomienie

```bash
npm install
npm run dev        # serwer deweloperski
npm run build      # typecheck (tsc -b) + build produkcyjny do dist/
npm run preview    # podgląd buildu
npm run lint       # oxlint
```

Wymagany Node.js 20.19+ lub 22.12+ (Vite 8).

## Wdrożenie na GitHub Pages

`vite.config.ts` ma ustawione `base: './'`, więc build działa pod dowolnym adresem
(`https://<użytkownik>.github.io/<repozytorium>/`) bez zmian w konfiguracji.

1. Wypchnij repozytorium na GitHub (gałąź `main`).
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/deploy.yml` zbuduje i opublikuje aplikację przy każdym pushu na `main`.

## Trzy etapy

| Etap | Co robisz | Mechanika |
| --- | --- | --- |
| **I. Szkic** (pergamin, ołówek, sangwina) | Projektujesz szkielet mezocyklu | Szablon *5-Day V-Taper Split* (Upper / Lower / Push / Pull / Legs) z edycją dni i partii; klikalna płyta anatomiczna (przód + tył); wskaźniki MEV / MAV / MRV liczone na bieżąco. Gdy każda partia mieści się w MEV–MAV, pojawia się pieczęć. |
| **II. Płótno olejne** | Dobierasz ćwiczenia według krzywej oporu | Paleta pigmentów: faza rozciągnięcia vs. opór szczytowy (każda partia potrzebuje obu); mapa nasycenia — partie poniżej MEV są wyblakłe, ponad MAV/MRV ciemnieją; wskaźnik SFR i budżety zmęczenia osiowego i stawowego; kompozycja tygodnia rozpisana na sesje. |
| **III. Marmurowa rzeźba** | Oceniasz proporcje, progresję i zmęczenie | Wskaźnik V-taper (barki : talia vs. φ 1.618) z projekcją; e1RM ze wzoru Brzyckiego i tonaż tydzień po tygodniu; matryca obciążenia względem MRV; pęknięcia marmuru przy przekroczeniu MRV lub zdolności centralnej; **Carve Deload** — odcina 40% objętości i generuje gotowy plan tygodnia regeneracyjnego (kopiuj / drukuj). |

Przejścia między etapami: kubistyczne plamy farby (Canvas 2D) oraz dłuto rozbijające blok marmuru (Canvas 2D).
Przy włączonym w systemie „ograniczeniu ruchu” animacje są skracane.

## Struktura

```
src/
  types/                 typy domenowe (MuscleId, GalleryState, MesoWeek…)
  data/                  partie i punkty MEV/MAV/MRV, biblioteka ćwiczeń, szablon V-Taper
  lib/                   czysta logika (bez Reacta):
    volume.ts            status objętości, rozkład serii na dni, analiza szkicu
    sfr.ts               SFR, budżety zmęczenia, podział serii na ćwiczenia, auto-kompozycja
    schedule.ts          rozpisanie tygodnia na sesje i ćwiczenia
    progression.ts       Brzycki, rampa objętości, wykrywanie MRV, deload −40%
    vtaper.ts            proporcja barki:talia i projekcja
  state/                 reducer, walidacja localStorage, kontekst z wyliczeniami
  components/
    anatomy/             geometria sylwetki + warianty: szkic, olej, marmur
    transitions/         intro ołówkiem, przejście farbą, przejście dłutem
    charts/              lekkie wykresy SVG z podpowiedziami
    common/              pieczęć, nawigacja „proweniencji”, liczniki, paski progów
  stages/                sketch/ · oil/ · marble/
```

## Założenia modelu

Widełki MEV / MAV / MRV, skale bodźca i zmęczenia ćwiczeń, budżety zmęczenia oraz projekcja V-taper to
heurystyki orientacyjne dla średniozaawansowanego trenującego — punkt wyjścia do własnych obserwacji, nie porada
medyczna. Wszystkie stałe są w `src/data` i na początku plików w `src/lib`, więc łatwo je dostroić.

Fonty (Caveat, EB Garamond, Playfair Display, Cormorant Garamond, Cinzel, Space Mono) są hostowane lokalnie przez
pakiety `@fontsource` — aplikacja nie wysyła zapytań do Google Fonts.
