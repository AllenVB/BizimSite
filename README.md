# 🏢 BizimSite — Apartman Yönetim Sistemi

Modern apartman ve site yönetimi için geliştirilmiş, çok kiracılı (multi-tenant) bir web uygulaması.  
Yöneticiler, sakinler ve kapıcılar için ayrı paneller sunar; aidat takibi, duyurular, şikayetler, mali yönetim ve daha fazlasını tek çatı altında toplar.

---

## 🚀 Özellikler

### 👔 Yönetici Paneli
- **Genel Bakış** — Toplam sakin, aidat geliri, ödeme durumu ve borç özeti
- **Sakin Yönetimi** — Sakin ekleme, düzenleme, silme; blok ve daire bilgisi
- **Blok Yönetimi** — Blok oluşturma, sakin listesi görüntüleme, detay modalı
- **Mali Yönetim** — Gelir/gider takibi, aidat dönem yönetimi, gider kategorileri
- **Raporlar** — Ödeme oranları, aidat gelirleri, şikayet istatistikleri
- **Duyurular** — Duyuru oluşturma ve yönetme
- **Şikayetler** — Sakinlerin şikayetlerini görüntüleme ve yanıtlama
- **Sohbet Paneli** — Floating chat widget ile sakinlerle anlık mesajlaşma
- **Çöp Takibi** — Çöp toplama durumu yönetimi
- **Ödünç Sistemi** — Eşya ödünç isteklerini yönetme

### 🏠 Sakin Paneli
- **Anasayfa** — Borç/ödeme durumu, duyuru bildirimi, aidat özeti
- **Aidat Öde** — Kredi kartı ile güvenli aidat ödeme
- **Ödeme Geçmişi** — Geçmiş aidat ödemelerini görüntüleme
- **Mali Durum** — Site gider dağılımı ve raporlar
- **Duyurular** — Okundu/okunmadı takibi, bildirim sistemi
- **Şikayet/Talep** — Yeni şikayet oluşturma, durum takibi
- **Yöneticiler** — Yönetici listesi ve doğrudan mesaj gönderme
- **Çöp Takibi** — Kendi çöp durumunu işaretleme
- **Ödünç Sistemi** — Eşya ödünç isteği oluşturma ve tekliflere yanıt verme

### 🧹 Kapıcı Paneli
- Çöp toplama takibi
- Duyuruları görüntüleme
- Şikayet bildirimi

### ⭐ Süper Admin Paneli
- Kiracı (tenant) oluşturma ve yönetimi
- Plan yönetimi (Basic / Premium / Enterprise)
- Tüm kiracıları izleme

---

## 🛠️ Teknoloji Yığını

### Frontend
| Teknoloji | Versiyon |
|---|---|
| React | 19 |
| Vite | 6 |
| React Router | v7 |
| Tailwind CSS | v4 |
| Lucide React | İkonlar |
| Axios | HTTP İstemci |

### Backend
| Teknoloji | Versiyon |
|---|---|
| ASP.NET Core | .NET 8 |
| Entity Framework Core | PostgreSQL |
| BCrypt.Net-Next | Şifre hash |
| JWT Bearer | Kimlik doğrulama |
| Npgsql | PostgreSQL sürücüsü |

### Veritabanı
- **PostgreSQL** (Google Cloud SQL)

---

## 📁 Proje Yapısı

```
BizimSite/
├── BizimSite/              # React frontend
│   └── src/
│       ├── pages/          # Sayfa bileşenleri
│       ├── components/     # Ortak bileşenler (Sidebar, ChatWidget, AnnouncementBell...)
│       ├── services/
│       │   └── api.js      # Tüm API çağrıları
│       └── index.css       # Global stiller ve animasyonlar
│
└── BizimSite.API/          # ASP.NET Core backend
    ├── Controllers/        # API endpoint'leri
    ├── Models/             # Entity modeller
    ├── DTOs/               # Request/Response DTO'ları
    ├── Services/           # TenantContext, JWT vb.
    └── Migrations/         # EF Core migration'ları
```

---

## ⚙️ Kurulum

### Gereksinimler
- Node.js 18+
- .NET 8 SDK
- PostgreSQL veritabanı

### Backend

```bash
cd BizimSite.API

# Bağlantı dizesini ayarla (appsettings.json)
# "ConnectionStrings": { "Default": "Host=...;Database=...;Username=...;Password=..." }

# Migration uygula
dotnet ef database update

# API'yi başlat
dotnet run
# → http://localhost:5223
```

### Frontend

```bash
cd BizimSite

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
# → http://localhost:5173
```

---

## 🔐 Kullanıcı Rolleri

| Rol | Giriş Yolu | Yetkiler |
|---|---|---|
| `superadmin` | `/login` | Tüm kiracıları yönetir |
| `admin` | `/login` | Kendi kiracısını tam yönetir |
| `resident` | `/login` | Kendi bilgilerini görür, aidat öder |
| `kapici` | `/login` | Çöp takibi ve duyurular |

> Varsayılan süper admin:  
> E-posta: `superadmin@bizimsite.com`  
> Şifre: `7355608Ks`

---

## 🌐 API Endpoint'leri (Özet)

```
POST   /api/auth/login
GET    /api/users
GET    /api/payments
POST   /api/payments
GET    /api/expenses
POST   /api/expenses
GET    /api/announcements
POST   /api/announcements
GET    /api/complaints
PUT    /api/complaints/{id}
GET    /api/aidat/config
PUT    /api/aidat/config
POST   /api/aidat/new-month
GET    /api/blocks
GET    /api/borrow
POST   /api/borrow
GET    /api/messages
POST   /api/messages
GET    /api/superadmin/tenants
POST   /api/superadmin/tenants
```

Her istek `Authorization: Bearer <token>` ve `X-Tenant-Slug: <slug>` header'ı gerektirir.

---

## 🎨 Tasarım Sistemi

- **Glassmorphism** login sayfası
- **Animated background orbs** — blur ve float animasyonları
- **Gradient butonlar** — shimmer sweep efekti
- **Card hover** — yumuşak yükseklik ve gölge geçişi
- **Sayfa geçişleri** — `page-enter` keyframe animasyonu
- **Renk paleti** — Indigo / Blue / Slate ağırlıklı

---

## 📌 Notlar

- Çok kiracılı mimari: her kiracı (`tenant`) kendi kullanıcı ve veri izolasyonuna sahiptir
- Aidat dönemi `periodStartDate` / `periodEndDate` ile tanımlanır; borç/ödeme durumu bu döneme göre hesaplanır
- Duyuru okunma durumu `localStorage` ile kullanıcı tarafında takip edilir
- Ödünç sistemi teklif/kabul/red mekanizması içerir

---

## 📄 Lisans

Bu proje özel kullanım amaçlı geliştirilmiştir.
```
