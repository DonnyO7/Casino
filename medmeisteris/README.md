# MEDMEISTERIS — svetainė

Vieno puslapio (single-page) svetainė įmonei **MEDMEISTERIS, MB** (Rokiškis):
kubilai, geodeziniai kupolai ir gyvūnų formos griliai. „E-shop“ stiliaus —
produktai su kainomis, paspaudus galima iškart paskambinti / susisiekti.

Grynas **HTML + CSS + JavaScript**. Jokio build proceso — veikia bet kuriame
hostinge (Netlify, GitHub Pages, įprastas web serveris, ar tiesiog atidarius
`index.html` naršyklėje).

## Struktūra
```
medmeisteris/
├─ index.html          # visas puslapis (9 sekcijos)
├─ css/styles.css      # dizainas (tamsi + auksinė „deluxe“ tema)
├─ js/
│  ├─ products.js      # ⚙️ PRODUKTAI + KAINOS (redaguokite čia)
│  └─ main.js          # logika (modalai, galerija, animacijos)
└─ assets/img/         # 🖼️ NUOTRAUKOS (žr. assets/img/README.md)
```

## Sekcijos (9)
1. Pradžia (Hero) · 2. Apie mus · 3. Kubilai · 4. Kupolai · 5. Griliai ·
6. Galerija · 7. Privalumai · 8. Atsiliepimai · 9. Kontaktai

## Kaip redaguoti
- **Kainos / produktai** → `js/products.js` (viskas viename masyve).
- **Nuotraukos** → įkelkite į `assets/img/` nurodytais pavadinimais
  (žr. `assets/img/README.md`). Kol nuotraukos nėra — rodoma vietos žyma.
- **Telefonas / kontaktai** → `index.html` (paieška: `+37067701441`).

## Peržiūra lokaliai
Tiesiog atidarykite `index.html`, arba paleiskite paprastą serverį:
```
cd medmeisteris
python3 -m http.server 8080
# atidarykite http://localhost:8080
```

## Kontaktai (svetainėje)
☎ +370 677 01441 · Sodų g. 17, Panemunis, Rokiškio r. ·
facebook.com/nuoma.kubilas
