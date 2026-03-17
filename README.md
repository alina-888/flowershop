# FlowerShop

A full-stack web application for an online flower shop. Customers can browse flowers and bouquets, add items to a cart, and place reservations with custom options (gift wrapping, greeting card). Staff manage orders through a dedicated admin panel with real-time status updates and notifications.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Architecture (ER Diagram)](#database-architecture-er-diagram)
- [Installation & Setup](#installation--setup)
- [API Reference](#api-reference)
- [User Manual](#user-manual)
- [Feature Descriptions](#feature-descriptions)

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python 3, Django 5.2, Django REST Framework 3.16 |
| Frontend  | React 19, React Router 7, Vite          |
| Database  | SQLite3 (default)                       |
| Auth      | DRF Token Authentication                |
| Images    | Pillow (auto-resize, JPG optimization)  |
| CORS      | django-cors-headers                     |
| Config    | python-decouple (.env)                  |

---

## Project Structure

```
flowershop/
├── config/                 # Django project settings, root URLs, middleware
│   ├── settings.py
│   ├── urls.py
│   └── middleware.py       # Media cache middleware (24h)
│
├── catalog/                # Flowers & Bouquets (products)
│   ├── models.py           # Flower, Bouquet, BouquetItem
│   ├── serializers.py
│   ├── api_views.py
│   └── api_urls.py
│
├── cart/                   # Per-user shopping cart
│   ├── models.py           # CartItem
│   ├── api_views.py
│   └── api_urls.py
│
├── reservations/           # Orders & notifications
│   ├── models.py           # Reservation, ReservationItem, Notification
│   ├── serializers.py
│   ├── api_views.py
│   └── api_urls.py
│
├── users/                  # Authentication
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
├── media/                  # User-uploaded images (flowers/, bouquets/)
├── static/                 # Static assets (CSS)
├── db.sqlite3
├── manage.py
└── requirements.txt
```

---

## Database Architecture (ER Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTH_USER (Django built-in)              │
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
       │      │          │     price (snapshot)    │
       │      │          └────────┬───────┬────────┘
       │      │                   │       │
       │      └───────────────────┤       │
       │              (FK: flower)│       │(FK: bouquet)
       │                          │       │
       │ (FK: flower or bouquet)  │       │
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

Reservation.status choices:   pending | read | in_progress | ready | completed | cancelled
Reservation.wrapping_color:   white | pink | red | yellow | green | purple | blue
```

### Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| User → CartItem | 1 : N | Each user has their own cart items |
| User → Reservation | 1 : N | A user can have multiple reservations |
| User → Notification | 1 : N | Notifications are linked to a specific user |
| Reservation → ReservationItem | 1 : N | Each order contains one or more items |
| Reservation → Notification | 1 : N | Status changes generate notifications |
| Bouquet → BouquetItem | 1 : N | A bouquet is composed of flower items |
| Flower → BouquetItem | 1 : N | A flower can appear in multiple bouquets |
| Bouquet/Flower → CartItem | 1 : N (optional) | Cart items reference either a bouquet or flower |
| Bouquet/Flower → ReservationItem | 1 : N (optional) | Order items reference either a bouquet or flower |

---

## Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend

```bash
# 1. Clone the repository
git clone <repo-url>
cd flowershop

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux/macOS
venv\Scripts\activate           # Windows

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create a .env file in the project root
echo "SECRET_KEY=your-secret-key-here" > .env
echo "DEBUG=True" >> .env

# 5. Apply migrations
python manage.py migrate

# 6. Create a superuser (admin account)
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`
Django Admin: `http://127.0.0.1:8000/admin/`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Reference

Base URL: `/api/`

Authentication: `Authorization: Token <token>` header (required for protected endpoints)

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register new user. Body: `{username, password, password2}` |
| POST | `/api/auth/login/` | No | Login. Body: `{username, password}`. Returns: `{token, username, is_staff}` |
| POST | `/api/auth/logout/` | Yes | Invalidates current token |
| GET | `/api/auth/me/` | Yes | Returns current user info |

### Catalog

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/catalog/flowers/` | No | List all flowers (paginated, 20/page) |
| GET | `/api/catalog/flowers/{id}/` | No | Flower detail |
| GET | `/api/catalog/bouquets/` | No | List all bouquets with nested flower composition |
| GET | `/api/catalog/bouquets/{id}/` | No | Bouquet detail |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart/` | Yes | Get all items in current user's cart |
| DELETE | `/api/cart/` | Yes | Clear the entire cart |
| POST | `/api/cart/add/` | Yes | Add item. Body: `{type: "bouquet"\|"flower", id, qty}` |
| PATCH | `/api/cart/items/{id}/` | Yes | Update quantity. Body: `{quantity}` |
| DELETE | `/api/cart/items/{id}/` | Yes | Remove a specific cart item |

### Reservations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reservations/` | Yes | List current user's reservations |
| POST | `/api/reservations/` | Yes | Create reservation from cart items |
| GET | `/api/reservations/{id}/` | Yes | Reservation detail |
| GET | `/api/reservations/options/` | Yes | Available status/wrapping color choices |
| GET | `/api/reservations/staff/` | Staff | View all reservations |
| PATCH | `/api/reservations/{id}/staff-update/` | Staff | Update status, estimated ready time |

#### Create Reservation Body

```json
{
  "greeting_card": true,
  "message": "Happy Birthday!",
  "wrapping_color": "pink",
  "items": [
    {"type": "bouquet", "id": 1, "quantity": 1},
    {"type": "flower", "id": 3, "quantity": 5}
  ]
}
```

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reservations/notifications/` | Yes | List all notifications |
| POST | `/api/reservations/notifications/{id}/read/` | Yes | Mark one as read |
| POST | `/api/reservations/notifications/read-all/` | Yes | Mark all as read |
| POST | `/api/reservations/notifications/reservation/{id}/read/` | Yes | Mark all for a reservation as read |

---

## User Manual

### For Customers

#### 1. Creating an Account
1. Open the app and click **Register** in the navigation bar.
2. Enter a unique username and a password (minimum 8 characters).
3. Confirm the password and submit.
4. You are automatically logged in after registration.

#### 2. Browsing the Catalog
- Navigate to **Catalog** to view all products.
- Use the **Flowers** page to browse individual flowers.
- Use the **Bouquets** page to browse pre-made arrangements. Each bouquet page shows its flower composition.
- Click any product card to open the detail view with full description and pricing.

#### 3. Adding Items to Cart
1. Open a product detail page (flower or bouquet).
2. Set the desired quantity.
3. Click **Add to Cart**.
4. The cart icon in the navbar updates with the current item count.

#### 4. Managing the Cart
- Navigate to **Cart** to view all added items.
- Adjust quantities directly in the cart.
- Remove individual items or clear the entire cart.

#### 5. Placing a Reservation
1. From the Cart page, click **Checkout**.
2. On the Checkout page, configure the optional extras:
   - **Greeting Card** — check to include a personalized card.
   - **Message** — write a personal note (appears on the greeting card).
   - **Wrapping Color** — choose from: White, Pink, Red, Yellow, Green, Purple, Blue.
3. Review the total price.
4. Click **Place Reservation**.
5. Stock is automatically deducted upon confirmation.

#### 6. Tracking Reservations
1. Go to **My Reservations** to see all your orders.
2. Click on a reservation to see its full details and status.

**Order Status Flow:**

```
pending → read → in_progress → ready (for pickup) → completed
                                                  ↘ cancelled
```

| Status | Meaning |
|--------|---------|
| Pending | Order received, awaiting staff review |
| Read | Staff has seen the order |
| In Progress | Order is being prepared |
| Ready | Order is ready for pickup |
| Completed | Order has been picked up |
| Cancelled | Order was cancelled |

#### 7. Notifications
- A notification bell in the navbar shows unread notifications.
- You receive a notification each time your reservation status changes.
- Click a notification to view the related reservation.
- Mark notifications as read individually or all at once.

---

### For Staff / Administrators

#### Accessing the Staff Panel
- Log in with a staff account (`is_staff = True`).
- Navigate to **Staff Panel** in the navbar (visible only to staff).

#### Managing Orders
1. The Staff Panel lists all customer reservations.
2. Click a reservation to open it.
3. Update the **status** (read → in_progress → ready → completed / cancelled).
4. Optionally set an **Estimated Ready** date and time.
5. Save changes — the customer automatically receives a notification.

#### Django Admin Panel
- Available at `/admin/`.
- Manage Flowers, Bouquets (with inline flower composition), Reservations, and Users.
- Add or edit product images and stock levels directly.

---

## Feature Descriptions

### Product Catalog
- **Flowers** and **Bouquets** are managed as separate entities.
- Bouquets define their composition through `BouquetItem` records (which flower, how many).
- All products expose: title, description, price, stock count, and image.
- Images are auto-resized on upload to a maximum of 1200px and saved as optimized JPEGs.

### Shopping Cart
- Each authenticated user has a personal cart stored in the database.
- Cart items can reference either a Flower or a Bouquet (not both simultaneously).
- Quantities can be updated or items removed before checkout.

### Reservations / Orders
- A reservation is created from the current cart contents.
- Each item's price is snapshotted at the time of reservation (price changes do not affect existing orders).
- Stock is decremented immediately when a reservation is created.
- Orders support optional extras: greeting card, personal message, and gift wrapping color.

### Notification System
- Notifications are generated automatically when staff changes a reservation's status.
- Each notification is linked to both the user and the specific reservation.
- Unread notification count is displayed in the navbar badge.

### Authentication & Authorization
- Token-based authentication (DRF `authtoken`).
- Catalog browsing is public (no login required).
- Cart, checkout, and reservation management require a login.
- Staff-only endpoints verify `is_staff` flag and return HTTP 403 otherwise.

### Image Optimization & Caching
- On model save, images are resized to ≤1200px (longest side) and re-saved as JPEG at 85% quality.
- `MediaCacheMiddleware` adds a `Cache-Control: public, max-age=86400` header to all `/media/` responses (24-hour browser cache).

### Pagination
- All list endpoints use `PageNumberPagination` with a default page size of 20 items.