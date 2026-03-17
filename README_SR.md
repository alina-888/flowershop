# FlowerShop — Tehnička Dokumentacija

Veb aplikacija za online cvećaru. Kupci mogu pregledati cveće i bukete, dodavati artikle u korpu i kreirati rezervacije sa prilagođenim opcijama (pakovanje, čestitka). Osoblje upravlja porudžbinama putem namenskog admin panela uz obaveštenja u realnom vremenu.

---

## Sadržaj

- [Tehnološki Stek](#tehnološki-stek)
- [Struktura Projekta](#struktura-projekta)
- [Arhitektura Baze Podataka (ER Dijagram)](#arhitektura-baze-podataka-er-dijagram)
- [Instalacija i Podešavanje](#instalacija-i-podešavanje)
- [API Referenca](#api-referenca)
- [Uputstvo za Korisnike](#uputstvo-za-korisnike)
- [Opis Funkcija](#opis-funkcija)

---

## Tehnološki Stek

| Sloj      | Tehnologija                                          |
|-----------|------------------------------------------------------|
| Backend   | Python 3, Django 5.2, Django REST Framework 3.16     |
| Frontend  | React 19, React Router 7, Vite                       |
| Baza      | SQLite3 (podrazumevano)                              |
| Autentikacija | DRF Token Authentication                        |
| Slike     | Pillow (automatsko smanjivanje, JPG optimizacija)    |
| CORS      | django-cors-headers                                  |
| Konfiguracija | python-decouple (.env)                          |

---

## Struktura Projekta

```
flowershop/
├── config/                 # Django podešavanja, root URL-ovi, middleware
│   ├── settings.py
│   ├── urls.py
│   └── middleware.py       # Middleware za keširanje medija (24h)
│
├── catalog/                # Cveće i buketi (proizvodi)
│   ├── models.py           # Flower, Bouquet, BouquetItem
│   ├── serializers.py
│   ├── api_views.py
│   └── api_urls.py
│
├── cart/                   # Korpa po korisniku
│   ├── models.py           # CartItem
│   ├── api_views.py
│   └── api_urls.py
│
├── reservations/           # Porudžbine i obaveštenja
│   ├── models.py           # Reservation, ReservationItem, Notification
│   ├── serializers.py
│   ├── api_views.py
│   └── api_urls.py
│
├── users/                  # Autentikacija
│   ├── api_views.py        # Register, Login, Logout, Me
│   └── api_urls.py
│
├── frontend/               # React SPA (Vite)
│   └── src/
│       ├── api.js
│       ├── context/        # AuthContext, CartContext, NotificationContext
│       ├── components/     # Navbar, ProductCard, StatusBadge
│       └── pages/          # CatalogPage, CartPage, CheckoutPage, StaffPanelPage, ...
│
├── media/                  # Slike koje otpremaju korisnici (flowers/, bouquets/)
├── static/                 # Statičke datoteke (CSS)
├── db.sqlite3
├── manage.py
└── requirements.txt
```

---

## Arhitektura Baze Podataka (ER Dijagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTH_USER (Django ugrađeni model)              │
│  PK  id          │  username  │  password  │  is_staff  │  ...  │
└────────────────────────────────────┬────────────────────────────┘
                                     │ 1
              ┌──────────────────────┼──────────────────────┐
              │ N                    │ N                     │ N
              ▼                      ▼                       ▼
┌─────────────────────┐  ┌───────────────────────┐  ┌─────────────────────┐
│      CartItem       │  │     Reservation        │  │    Notification     │
│─────────────────────│  │───────────────────────│  │─────────────────────│
│ PK  id              │  │ PK  id                 │  │ PK  id              │
│ FK  user_id         │  │ FK  customer_id        │  │ FK  user_id         │
│ FK  bouquet_id (opt)│  │     status             │  │ FK  reservation_id  │
│ FK  flower_id  (opt)│  │     total_price        │  │     message         │
│     quantity        │  │     greeting_card      │  │     is_read         │
│     added_at        │  │     message            │  │     created_at      │
└──────┬──────┬───────┘  │     wrapping_color     │  └─────────────────────┘
       │      │          │     estimated_ready    │
       │      │          │     created_at         │
       │      │          │     updated_at         │
       │      │          └────────────┬───────────┘
       │      │                       │ 1
       │      │                       │ N
       │      │          ┌────────────▼───────────┐
       │      │          │    ReservationItem      │
       │      │          │────────────────────────│
       │      │          │ PK  id                  │
       │      │          │ FK  reservation_id      │
       │      │          │ FK  bouquet_id (opt)    │
       │      │          │ FK  flower_id  (opt)    │
       │      │          │     quantity            │
       │      │          │     price (snimak)      │
       │      │          └────────┬───────┬────────┘
       │      │                   │       │
       │      └───────────────────┤       │
       │              (FK: flower)│       │(FK: bouquet)
       │                          │       │
       │ (FK: flower ili bouquet) │       │
       │                          ▼       ▼
       │                   ┌──────────┐  ┌──────────────────────┐
       │                   │  Flower  │  │       Bouquet        │
       │                   │──────────│  │──────────────────────│
       └──────────────────►│ PK  id   │  │ PK  id               │
                           │  title   │  │  title               │
                           │  desc    │  │  description         │
                           │  stock   │  │  number_in_stock     │
                           │  price   │  │  price               │
                           │  image   │  │  image               │
                           └────┬─────┘  └──────────┬───────────┘
                                │ N                  │ 1
                                │                    │ N
                                │         ┌──────────▼───────────┐
                                │         │    BouquetItem        │
                                │         │──────────────────────│
                                └────────►│ PK  id               │
                          (FK: flower)    │ FK  bouquet_id        │
                                          │ FK  flower_id         │
                                          │     quantity          │
                                          └──────────────────────┘

Reservation.status opcije:      pending | read | in_progress | ready | completed | cancelled
Reservation.wrapping_color:     white | pink | red | yellow | green | purple | blue
```

### Pregled Relacija

| Relacija | Tip | Opis |
|---|---|---|
| User → CartItem | 1 : N | Svaki korisnik ima sopstvene stavke u korpi |
| User → Reservation | 1 : N | Korisnik može imati više rezervacija |
| User → Notification | 1 : N | Obaveštenja su vezana za konkretnog korisnika |
| Reservation → ReservationItem | 1 : N | Svaka porudžbina sadrži jednu ili više stavki |
| Reservation → Notification | 1 : N | Promene statusa generišu obaveštenja |
| Bouquet → BouquetItem | 1 : N | Buket je sastavljen od stavki cveća |
| Flower → BouquetItem | 1 : N | Cvet se može pojaviti u više buketa |
| Bouquet/Flower → CartItem | 1 : N (opciono) | Stavka korpe referencira buket ili cvet |
| Bouquet/Flower → ReservationItem | 1 : N (opciono) | Stavka porudžbine referencira buket ili cvet |

---

## Instalacija i Podešavanje

### Preduslovi

- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
# 1. Klonirajte repozitorijum
git clone <repo-url>
cd flowershop

# 2. Kreirajte i aktivirajte virtuelno okruženje
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# 3. Instalirajte Python zavisnosti
pip install -r requirements.txt

# 4. Kreirajte .env fajl u korenom direktorijumu projekta
echo "SECRET_KEY=vas-tajni-kljuc-ovde" > .env
echo "DEBUG=True" >> .env

# 5. Primenite migracije
python manage.py migrate

# 6. Kreirajte superkorisnika (admin nalog)
python manage.py createsuperuser

# 7. Pokrenite razvojni server
python manage.py runserver
```

Backend je dostupan na: `http://127.0.0.1:8000`
Django Admin: `http://127.0.0.1:8000/admin/`

### Frontend

```bash
cd frontend

# Instalirajte zavisnosti
npm install

# Pokrenite Vite razvojni server
npm run dev
```

Frontend je dostupan na: `http://localhost:5173`

---

## API Referenca

Bazni URL: `/api/`

Autentikacija: zaglavlje `Authorization: Token <token>` (obavezno za zaštićene endpointe)

### Autentikacija

| Metod | Endpoint | Auth | Opis |
|-------|----------|------|------|
| POST | `/api/auth/register/` | Ne | Registracija novog korisnika. Telo: `{username, password, password2}` |
| POST | `/api/auth/login/` | Ne | Prijava. Telo: `{username, password}`. Vraća: `{token, username, is_staff}` |
| POST | `/api/auth/logout/` | Da | Poništava trenutni token |
| GET | `/api/auth/me/` | Da | Vraća informacije o trenutnom korisniku |

### Katalog

| Metod | Endpoint | Auth | Opis |
|-------|----------|------|------|
| GET | `/api/catalog/flowers/` | Ne | Lista svih cveta (paginirana, 20/stranica) |
| GET | `/api/catalog/flowers/{id}/` | Ne | Detalji cveta |
| GET | `/api/catalog/bouquets/` | Ne | Lista svih buketa sa ugnježdenim sastavom cveća |
| GET | `/api/catalog/bouquets/{id}/` | Ne | Detalji buketa |

### Korpa

| Metod | Endpoint | Auth | Opis |
|-------|----------|------|------|
| GET | `/api/cart/` | Da | Preuzima sve stavke u korpi trenutnog korisnika |
| DELETE | `/api/cart/` | Da | Briše celokupnu korpu |
| POST | `/api/cart/add/` | Da | Dodaje stavku. Telo: `{type: "bouquet"\|"flower", id, qty}` |
| PATCH | `/api/cart/items/{id}/` | Da | Ažurira količinu. Telo: `{quantity}` |
| DELETE | `/api/cart/items/{id}/` | Da | Uklanja određenu stavku iz korpe |

### Rezervacije

| Metod | Endpoint | Auth | Opis |
|-------|----------|------|------|
| GET | `/api/reservations/` | Da | Lista rezervacija trenutnog korisnika |
| POST | `/api/reservations/` | Da | Kreira rezervaciju iz stavki korpe |
| GET | `/api/reservations/{id}/` | Da | Detalji rezervacije |
| GET | `/api/reservations/options/` | Da | Dostupne opcije statusa i boje pakovanja |
| GET | `/api/reservations/staff/` | Osoblje | Pregled svih rezervacija |
| PATCH | `/api/reservations/{id}/staff-update/` | Osoblje | Ažurira status, procenjeno vreme spremnosti |

#### Telo Zahteva za Kreiranje Rezervacije

```json
{
  "greeting_card": true,
  "message": "Sretan rođendan!",
  "wrapping_color": "pink",
  "items": [
    {"type": "bouquet", "id": 1, "quantity": 1},
    {"type": "flower", "id": 3, "quantity": 5}
  ]
}
```

### Obaveštenja

| Metod | Endpoint | Auth | Opis |
|-------|----------|------|------|
| GET | `/api/reservations/notifications/` | Da | Lista svih obaveštenja |
| POST | `/api/reservations/notifications/{id}/read/` | Da | Označava jedno kao pročitano |
| POST | `/api/reservations/notifications/read-all/` | Da | Označava sva kao pročitana |
| POST | `/api/reservations/notifications/reservation/{id}/read/` | Da | Označava sva obaveštenja za rezervaciju kao pročitana |

---

## Uputstvo za Korisnike

### Za Kupce

#### 1. Kreiranje Naloga
1. Otvorite aplikaciju i kliknite **Register** u navigacionoj traci.
2. Unesite jedinstveno korisničko ime i lozinku (najmanje 8 karaktera).
3. Potvrdite lozinku i pošaljite formu.
4. Nakon registracije ste automatski prijavljeni.

#### 2. Pregledanje Kataloga
- Idite na **Catalog** za pregled svih proizvoda.
- Koristite stranicu **Flowers** za pregled pojedinačnih cveta.
- Koristite stranicu **Bouquets** za pregled gotovih aranžmana. Na stranici buketa vidite sastav cveća.
- Kliknite na karticu proizvoda da otvorite detaljan prikaz sa opisom i cenom.

#### 3. Dodavanje u Korpu
1. Otvorite stranicu sa detaljima proizvoda (cvet ili buket).
2. Podesite željenu količinu.
3. Kliknite **Add to Cart**.
4. Ikonica korpe u navigaciji se ažurira sa trenutnim brojem stavki.

#### 4. Upravljanje Korpom
- Idite na **Cart** da vidite sve dodane stavke.
- Promenite količinu direktno u korpi.
- Uklonite pojedinačne stavke ili ispraznite čitavu korpu.

#### 5. Kreiranje Rezervacije
1. Na stranici Korpe kliknite **Checkout**.
2. Na stranici za plaćanje podesite opcione dodatke:
   - **Greeting Card** — označite da uključite personalizovanu čestitku.
   - **Message** — napišite ličnu poruku (pojavljuje se na čestitki).
   - **Wrapping Color** — izaberite od: Bela, Roza, Crvena, Žuta, Zelena, Ljubičasta, Plava.
3. Proverite ukupnu cenu.
4. Kliknite **Place Reservation**.
5. Zalihe se automatski smanjuju po potvrdi.

#### 6. Praćenje Rezervacija
1. Idite na **My Reservations** da vidite sve vaše porudžbine.
2. Kliknite na rezervaciju da vidite njene detalje i status.

**Tok Statusa Porudžbine:**

```
pending → read → in_progress → ready (spreman za preuzimanje) → completed
                                                              ↘ cancelled
```

| Status | Značenje |
|--------|---------|
| Pending | Porudžbina primljena, čeka pregled osoblja |
| Read | Osoblje je videlo porudžbinu |
| In Progress | Porudžbina se priprema |
| Ready | Porudžbina je spremna za preuzimanje |
| Completed | Porudžbina je preuzeta |
| Cancelled | Porudžbina je otkazana |

#### 7. Obaveštenja
- Zvonce za obaveštenja u navigaciji prikazuje nepročitana obaveštenja.
- Dobijate obaveštenje svaki put kada se status vaše rezervacije promeni.
- Kliknite na obaveštenje da vidite povezanu rezervaciju.
- Označite obaveštenja kao pročitana pojedinačno ili sva odjednom.

---

### Za Osoblje / Administratore

#### Pristup Panelu Osoblja
- Prijavite se sa nalogom osoblja (`is_staff = True`).
- Idite na **Staff Panel** u navigacionoj traci (vidljivo samo osoblju).

#### Upravljanje Porudžbinama
1. Staff Panel prikazuje sve porudžbine kupaca.
2. Kliknite na rezervaciju da je otvorite.
3. Ažurirajte **status** (read → in_progress → ready → completed / cancelled).
4. Opciono postavite **Estimated Ready** datum i vreme.
5. Sačuvajte izmene — kupac automatski dobija obaveštenje.

#### Django Admin Panel
- Dostupan na `/admin/`.
- Upravljajte Cvećem, Buketima (sa ugrađenim sastavom cveća), Rezervacijama i Korisnicima.
- Dodajte ili uredite slike proizvoda i nivoe zaliha direktno.

---

## Opis Funkcija

### Katalog Proizvoda
- **Cveće** (Flowers) i **Buketi** (Bouquets) se upravljaju kao posebni entiteti.
- Buketi definišu svoj sastav kroz `BouquetItem` zapise (koje cveće, u kojoj količini).
- Svi proizvodi prikazuju: naziv, opis, cenu, stanje na zalihama i sliku.
- Slike se automatski smanjuju pri otpremanju na maksimum 1200px i čuvaju kao optimizovani JPEG fajlovi.

### Korpa za Kupovinu
- Svaki autentifikovani korisnik ima personalnu korpu pohranjenu u bazi podataka.
- Stavke korpe mogu referencirati cvet ili buket (ne oba istovremeno).
- Količine se mogu ažurirati ili stavke ukloniti pre naplate.

### Rezervacije / Porudžbine
- Rezervacija se kreira iz trenutnog sadržaja korpe.
- Cena svake stavke se beleži u trenutku kreiranja rezervacije (promene cena ne utiču na postojeće porudžbine).
- Zalihe se automatski smanjuju pri kreiranju rezervacije.
- Porudžbine podržavaju opcionalne dodatke: čestitku, ličnu poruku i boju pakovanja.

### Sistem Obaveštenja
- Obaveštenja se automatski generišu kada osoblje promeni status rezervacije.
- Svako obaveštenje je vezano i za korisnika i za konkretnu rezervaciju.
- Broj nepročitanih obaveštenja se prikazuje na bedžu u navigaciji.

### Autentikacija i Autorizacija
- Token-bazirana autentikacija (DRF `authtoken`).
- Pregledanje kataloga je javno (nije potrebna prijava).
- Korpa, naplata i upravljanje rezervacijama zahtevaju prijavu.
- Endpointi samo za osoblje proveravaju `is_staff` zastavicu i vraćaju HTTP 403 u suprotnom.

### Optimizacija i Keširanje Slika
- Pri čuvanju modela, slike se smanjuju na ≤1200px (duža strana) i ponovo čuvaju kao JPEG sa 85% kvaliteta.
- `MediaCacheMiddleware` dodaje `Cache-Control: public, max-age=86400` zaglavlje svim `/media/` odgovorima (24-satno keširanje u pregledaču).

### Paginacija
- Svi list endpointi koriste `PageNumberPagination` sa podrazumevanom veličinom stranice od 20 stavki.