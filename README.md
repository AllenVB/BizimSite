# 🏢 BizimSite — Apartman Yönetim Sistemi

Modern apartman ve site yönetimi için geliştirilmiş, çok kiracılı (multi-tenant) bir web uygulaması.
Yöneticiler, sakinler ve kapıcılar için ayrı paneller sunar; aidat takibi, duyurular, şikayetler, mali yönetim ve daha fazlasını tek çatı altında toplar.

---

## 🚀 Özellikler

### 👔 Yönetici Paneli
- **Genel Bakış** — Toplam sakin, aidat geliri, ödeme durumu ve borç özeti
- **Sakin Yönetimi** — Sakin ekleme, düzenleme, silme; blok, daire, telefon bilgisi
- **Mali Yönetim** — Gelir/gider takibi, aidat dönem yönetimi, IBAN/hesap bilgisi girişi, bekleyen dekont onayları
- **Raporlar** — Ödeme oranları, aidat gelirleri, şikayet istatistikleri
- **Duyurular** — Duyuru oluşturma ve yönetme
- **Şikayetler** — Sakinlerin şikayetlerini görüntüleme ve yanıtlama
- **Sohbet Paneli** — Floating chat widget ile sakinlerle anlık mesajlaşma
- **Çöp Takibi** — Çöp toplama durumu yönetimi
- **Ödünç Sistemi** — Eşya ödünç isteklerini yönetme

### 🏠 Sakin Paneli
- **Anasayfa** — Borç/ödeme durumu, reddedilen dekont bildirimi, aidat özeti
- **Aidat Öde** — IBAN bilgisi görüntüleme, dekont (makbuz) yükleme; ödeme admin onayına kadar beklemede
- **Ödeme Geçmişi** — Geçmiş ödemeleri durum rozetiyle görüntüleme (beklemede / onaylı / reddedildi)
- **Mali Durum** — Site gider dağılımı ve raporlar
- **Duyurular** — Okundu/okunmadı takibi, bildirim sistemi
- **Şikayet/Talep** — Yeni şikayet oluşturma, durum takibi
- **Yöneticiler** — Yönetici listesi ve doğrudan mesaj gönderme
- **Çöp Takibi** — Kendi çöp durumunu işaretleme
- **Ödünç Sistemi** — Eşya ödünç isteği oluşturma ve tekliflere yanıt verme
- **Profil Ayarları** — Ad, e-posta, telefon, şifre güncelleme (veritabanına kaydedilir)

### 🧹 Kapıcı Paneli
- Çöp toplama takibi
- Duyuruları görüntüleme
- Şikayet bildirimi

### ⭐ Süper Admin Paneli
- Kiracı (tenant) oluşturma ve yönetimi
- Plan yönetimi (Basic / Premium / Enterprise)
- Tüm kiracıları izleme

---

## 💳 Aidat Ödeme Akışı

1. Admin **Mali Yönetim** ekranından IBAN numarası ve hesap sahibi adını girer
2. Sakin **Aidat Öde** sayfasında IBAN bilgisini görür, havale/EFT yaptıktan sonra dekont görselini yükler
3. Ödeme **"Beklemede"** durumuna geçer; sakin dashboard'unda sarı rozet görünür
4. Admin dekontı inceler:
   - **Onayla** → ödeme onaylı, sakin borcu kapandı
   - **Reddet** → sakin dashboard'unda kırmızı bildirim banner'ı çıkar, red gerekçesi gösterilir, yeniden yükleme butonu açılır

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

### Veritabanı & Altyapı
| Servis | Kullanım |
|---|---|
| PostgreSQL (Supabase) | Ana veritabanı |
| Railway | Backend hosting |
| Vercel | Frontend hosting |

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

# appsettings.json veya ortam değişkenlerine ekle:
# ConnectionStrings__Default  → PostgreSQL bağlantı dizesi
# Jwt__Key                    → JWT imzalama anahtarı (min 32 karakter)
# Jwt__Issuer                 → Token yayıncı
# Jwt__Audience               → Token hedef kitle

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

# .env dosyası oluştur
echo "VITE_API_URL=http://localhost:5223" > .env

# Geliştirme sunucusunu başlat
npm run dev
# → http://localhost:5173
```

---

## 🔐 Kullanıcı Rolleri

| Rol | Yetkiler |
|---|---|
| `superadmin` | Tüm kiracıları yönetir, plan atar |
| `admin` | Kendi binasını tam yönetir, dekont onaylar/reddeder |
| `resident` | Aidat öder, dekont yükler, şikayet oluşturur |
| `kapici` | Çöp takibi, duyurular, şikayet bildirimi |

> Varsayılan süper admin:
> E-posta: `superadmin@bizimsite.com`
> Şifre: `BizimSite2026!`

---

## 🌐 API Endpoint'leri (Özet)

```
POST   /api/auth/login
POST   /api/auth/self-register          # Bina şifresiyle kendi kaydını oluştur

GET    /api/users
PUT    /api/users/me                    # Kendi profilini güncelle
PUT    /api/users/{id}                  # Admin: kullanıcı güncelle
DELETE /api/users/{id}

GET    /api/payments
POST   /api/payments                    # Dekont yükle (pending)
PUT    /api/payments/{id}/status        # Admin: onayla / reddet

GET    /api/expenses
POST   /api/expenses
DELETE /api/expenses/{id}

GET    /api/announcements
POST   /api/announcements
DELETE /api/announcements/{id}

GET    /api/complaints
POST   /api/complaints
PUT    /api/complaints/{id}

GET    /api/aidat/config
PUT    /api/aidat/config                # IBAN, tutar, dönem
POST   /api/aidat/new-month
POST   /api/aidat/rollback-month

GET    /api/messages
POST   /api/messages

GET    /api/borrow
POST   /api/borrow
POST   /api/borrow/{id}/respond

GET    /api/superadmin/tenants
POST   /api/superadmin/tenants
PUT    /api/superadmin/tenants/{id}
DELETE /api/superadmin/tenants/{id}
```

Her istek `Authorization: Bearer <token>` ve `X-Tenant-Slug: <slug>` header'ı gerektirir.

---

## 🏗️ Çok Kiracılı Mimari

Tek bir PostgreSQL veritabanında tüm apartmanlar ortak tablolarda tutulur; her kayıtta `TenantId` kolonu bulunur. Her API isteği `X-Tenant-Slug` header'ından kiracıyı tespit eder ve tüm sorgular `WHERE TenantId = X` filtresiyle çalışır. Gül Sitesi sakini Belgrad Sitesi'nin hiçbir verisine erişemez.

---

## 🎨 Tasarım Sistemi

- **Glassmorphism** login sayfası
- **Animated background orbs** — blur ve float animasyonları
- **Gradient butonlar** — shimmer sweep efekti
- **Card hover** — yumuşak yükseklik ve gölge geçişi
- **Sayfa geçişleri** — `page-enter` keyframe animasyonu
- **Renk paleti** — Indigo / Blue / Slate ağırlıklı

---

## 📄 Lisans

Bu proje özel kullanım amaçlı geliştirilmiştir.
