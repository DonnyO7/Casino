# Nuotraukos svetainei „Plieno Pulsas“

Svetainė **jau įkelta su tikromis nuotraukomis** — pagal nutylėjimą jos
traukiamos iš nemokamo „Pexels.com“ banko (Pexels licencija: nemokama
naudoti, atribucija neprivaloma). Nuorodos surašytos `MEDIA` sąraše,
svetainės `<script>` bloko viršuje (`plieno-pulsas.html`).

> Nuotraukos užsikrauna atidarius failą su interneto ryšiu. Jei kuri nors
> nuoroda nepasiekiama, toje vietoje automatiškai lieka firminis tamsus
> „lydyto plieno“ CSS fonas — svetainė niekada neatrodo sugadinta.

## Kuri nuotrauka kurioje vietoje

| Vieta svetainėje                         | Pexels nuotrauka |
|------------------------------------------|------------------|
| Pradžios ekranas (`hero`)                | https://www.pexels.com/photo/9665344/  (kibirkštys nuo šlifuoklio, tamsu) |
| „Apie mus“ kortelė (`about`)             | https://www.pexels.com/photo/19757234/ (suvirintojas tamsiose dirbtuvėse) |
| Darbai → Konstrukcijos karkasas (`work-1`)| https://www.pexels.com/photo/29976478/ (suvirinimas su kibirkštimis) |
| Darbai → Poliruotas turėklas (`work-2`)  | https://www.pexels.com/photo/18651254/ (darbas šlifuokliu) |
| Darbai → Profilių pjovimas (`work-3`)    | https://www.pexels.com/photo/7461112/  (metalo pjovimas) |
| Darbai → Kalimas ir formavimas (`work-4`)| https://www.pexels.com/photo/16456724/ (įkaitintas metalas) |
| Darbai → Įrenginio korpusas (`work-5`)   | https://www.pexels.com/photo/2760343/  (suvirinimas) |
| Darbai → Galutinė apdaila (`work-6`)     | https://www.pexels.com/photo/13296065/ (šlifavimas) |

## Kaip pakeisti savo nuotraukomis

Atidarykite `plieno-pulsas.html`, raskite `MEDIA` sąrašą (viršuje, `<script>`
bloke) ir kiekvienai vietai įrašykite arba:

- **savo internetinę nuorodą**, pvz. `hero: 'https://.../mano-nuotrauka.jpg'`,
  arba
- **vietinį failą**: įdėkite paveikslėlį į šį `assets/` aplanką ir nurodykite
  `hero: 'assets/hero.jpg'` (laikykite HTML ir `assets/` kartu).

**Dydžiai (rekomendacija):** `hero` ~1920 px pločio; darbų kadrai ~1200 px.
Tinka `.jpg`, `.png`, `.webp`.
