/* ======================================================================
   MEDMEISTERIS — PRODUKTŲ KATALOGAS / PRODUCT CATALOG
   ----------------------------------------------------------------------
   ⚠️  KAINOS / PRICES:
       Žemiau esančios kainos yra LAIKINOS (placeholder). Pakeiskite jas į
       tikras kainas — tiesiog redaguokite "price" lauką.
       (The prices below are placeholders — edit the "price" field.)

   🖼️  NUOTRAUKOS / PHOTOS:
       "img" laukas nurodo failo pavadinimą aplanke  assets/img/
       Įkelkite tikrą nuotrauką tokiu pat pavadinimu ir ji atsiras
       automatiškai. Kol failo nėra — rodoma graži vietos žyma.
       (Drop a real photo with the same filename into assets/img/.)
   ====================================================================== */

const PRODUCTS = [
  /* ----------------------------- KUBILAI ----------------------------- */
  {
    id: "kubilas-thermo-oval",
    category: "kubilai",
    tag: "Termomedis",
    name: "Ovalus kubilas „Thermo“",
    img: "kubilai-thermowood-oval.jpg",
    price: "nuo 2 890 €",
    priceNote: "su krosnele",
    desc: "Stiklo pluošto ovalus kubilas su termiškai apdorotos medienos apdaila ir nerūdijančio plieno apvadu. Integruota arba išorinė krosnelė.",
    specs: ["Talpa: 2–4 asmenys", "Apdaila: termomedis", "Nerūdijančio plieno apvadas", "Krosnelė: integruota / išorinė"]
  },
  {
    id: "kubilas-anthracite",
    category: "kubilai",
    tag: "WPC kompozitas",
    name: "Ovalus kubilas „Antracitas“",
    img: "kubilai-anthracite-oval.jpg",
    price: "nuo 2 690 €",
    priceNote: "bazinė komplektacija",
    desc: "Modernus ovalus kubilas su pilkos WPC kompozito imitacija — nereikalauja priežiūros, atsparus orams. Tamsus akrilo vidus.",
    specs: ["Talpa: 2–4 asmenys", "Apdaila: WPC kompozitas", "Nereikia priežiūros", "Spalva pagal RAL pageidavimą"]
  },
  {
    id: "kubilas-round-grey",
    category: "kubilai",
    tag: "Apvalus",
    name: "Apvalus kubilas „Nordic“",
    img: "kubilai-round-grey.jpg",
    price: "nuo 2 790 €",
    priceNote: "su laiptais",
    desc: "Klasikinės apvalios formos kubilas su pilka medienos apdaila ir blizgiu nerūdijančio plieno apvadu. Tobula skandinaviška estetika.",
    specs: ["Talpa: 4–6 asmenys", "Apvali forma", "Mediniai laiptai komplekte", "Integruota krosnelė"]
  },
  {
    id: "kubilas-white-oval",
    category: "kubilai",
    tag: "Premium",
    name: "Ovalus kubilas „Snow“",
    img: "kubilai-white-oval.jpg",
    price: "nuo 2 990 €",
    priceNote: "premium klasė",
    desc: "Elegantiškas kubilas su šviesiu akrilo vidumi ir natūralios medienos apdaila — jaukus akcentas bet kuriame kieme, ypač žiemą.",
    specs: ["Talpa: 2–4 asmenys", "Šviesus akrilo vidus", "Natūralios medienos apdaila", "LED apšvietimas (pasirinktinai)"]
  },
  {
    id: "spa-square-6",
    category: "kubilai",
    tag: "SPA · 6 vietų",
    name: "SPA baseinas „Marble“ (6 v.)",
    img: "kubilai-spa-square.jpg",
    price: "nuo 4 500 €",
    priceNote: "su hidromasažu",
    desc: "Kvadratinis SPA baseinas su marmuro rašto akrilu, hidromasažo bei oro sistemomis ir LED apšvietimu. Termomedžio apdaila.",
    specs: ["Talpa: 6 asmenų", "Hidromasažas + oro sistema", "Marmuro rašto akrilas", "LED apšvietimas"]
  },

  /* ----------------------------- KUPOLAI ----------------------------- */
  {
    id: "kupolas-glass-4",
    category: "kupolai",
    tag: "Ø 4 m",
    name: "Geodezinis kupolas 4 m",
    img: "kupolai-glass-4m.jpg",
    price: "nuo 3 500 €",
    priceNote: "karkasas + stiklas",
    desc: "Kompaktiškas geodezinis kupolas su panoraminiu stiklu ir mediniu karkasu. Puikiai tinka poilsiui ar glampingui mažoje erdvėje.",
    specs: ["Skersmuo: 4 m", "Panoraminis stiklas", "Medinis karkasas", "Durys + ventiliacija"]
  },
  {
    id: "kupolas-glass-6",
    category: "kupolai",
    tag: "Ø 6 m",
    name: "Geodezinis kupolas 6 m",
    img: "kupolai-glass-6m.jpg",
    price: "nuo 5 900 €",
    priceNote: "pilna komplektacija",
    desc: "Erdvus kupolas su tamsinto stiklo segmentais ant medinės terasos. Tinka ištisus metus — vasarą ir žiemą.",
    specs: ["Skersmuo: 6 m", "Tamsinto stiklo segmentai", "Medinė terasa", "Atidaromi langai"]
  },
  {
    id: "kupolas-frame",
    category: "kupolai",
    tag: "Pagal matmenis",
    name: "Kupolas pagal individualius matmenis",
    img: "kupolai-frame.jpg",
    price: "Kaina sutartinė",
    priceNote: "pagal projektą",
    desc: "Gaminame geodezinius kupolus 4–8 m skersmens pagal Jūsų pageidaujamus matmenis ir komplektaciją. Montavimas visoje Lietuvoje.",
    specs: ["Skersmuo: 4–8 m", "Individualus projektas", "Montavimas vietoje", "Spalva pagal RAL"]
  },

  /* ----------------------------- GRILIAI ----------------------------- */
  {
    id: "grilis-briedis",
    category: "griliai",
    tag: "Briedis",
    name: "Grilis-mangalas „Briedis“",
    img: "griliai-moose.jpg",
    price: "nuo 350 €",
    priceNote: "1553 × 1628 mm",
    desc: "Įspūdingo dydžio lazeriu pjauto plieno grilis briedžio formos. Efektingas ir funkcionalus akcentas Jūsų kiemui.",
    specs: ["Matmenys: 1553 × 1628 × 779 mm", "Lazeriu pjautas plienas", "Milteliniai dažai", "Surenkamas"]
  },
  {
    id: "grilis-elnias",
    category: "griliai",
    tag: "Elnias",
    name: "Grilis-mangalas „Elnias“",
    img: "griliai-deer.jpg",
    price: "nuo 350 €",
    priceNote: "didelis dydis",
    desc: "Didingas elnio formos grilis su išraiškingais ragais. Pagamintas iš storo plieno, padengtas atspariais milteliniais dažais.",
    specs: ["Didelis dydis", "Lazeriu pjautas plienas", "Atsparūs milteliniai dažai", "Surenkamas"]
  },
  {
    id: "grilis-liutas",
    category: "griliai",
    tag: "Liūtas",
    name: "Grilis-mangalas „Liūtas“",
    img: "griliai-lion.jpg",
    price: "nuo 390 €",
    priceNote: "1776 × 1172 mm",
    desc: "Karališkas liūto formos grilis-mangalas — tikras dėmesio centras kiekvienoje šventėje.",
    specs: ["Matmenys: 1776 × 774 × 1172 mm", "Lazeriu pjautas plienas", "Milteliniai dažai", "Surenkamas"]
  },
  {
    id: "grilis-bulius",
    category: "griliai",
    tag: "Bulius",
    name: "Grilis-mangalas „Bulius“",
    img: "griliai-bull.jpg",
    price: "nuo 390 €",
    priceNote: "1785 × 1129 mm",
    desc: "Galingo buliaus formos grilis su charakteringais ragais. Tvirta konstrukcija ilgaamžiam naudojimui.",
    specs: ["Matmenys: 1785 × 570 × 1129 mm", "Lazeriu pjautas plienas", "Milteliniai dažai", "Surenkamas"]
  },
  {
    id: "grilis-sernas",
    category: "griliai",
    tag: "Šernas",
    name: "Grilis-mangalas „Šernas“",
    img: "griliai-boar.jpg",
    price: "nuo 350 €",
    priceNote: "kompaktiškas",
    desc: "Šerno formos grilis-mangalas — originalus ir tvirtas. Puikiai tinka medžiotojų sodyboms.",
    specs: ["Kompaktiškas dydis", "Lazeriu pjautas plienas", "Milteliniai dažai", "Surenkamas"]
  },
  {
    id: "grilis-suo",
    category: "griliai",
    tag: "Vilkas / šuo",
    name: "Grilis-mangalas „Vilkas“",
    img: "griliai-wolf.jpg",
    price: "nuo 350 €",
    priceNote: "1758 × 1124 mm",
    desc: "Dinamiškos vilko formos grilis-mangalas. Detalus dizainas ir patogus grilinimo paviršius.",
    specs: ["Matmenys: 1758 × 461 × 1124 mm", "Lazeriu pjautas plienas", "Milteliniai dažai", "Surenkamas"]
  }
];

/* Galerijos nuotraukos / Gallery images (filenames in assets/img/) */
const GALLERY = [
  { img: "gallery-1.jpg", label: "Kubilas žiemą" },
  { img: "gallery-2.jpg", label: "Kupolas terasoje" },
  { img: "gallery-3.jpg", label: "Termomedžio kubilas" },
  { img: "gallery-4.jpg", label: "Grilių kolekcija" },
  { img: "gallery-5.jpg", label: "Stiklo kupolas" },
  { img: "gallery-6.jpg", label: "SPA baseinas" },
  { img: "gallery-7.jpg", label: "Antracito kubilas" },
  { img: "gallery-8.jpg", label: "Briedžio grilis" }
];
