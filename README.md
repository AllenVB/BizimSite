# BizimSite - Apartman Yönetim Sistemi

Modern bir web uygulaması ile apartmanlarınız ve daigreleri yönetin.

## Teknoloji Stack

- **Backend:** ASP.NET Core 9.0
- **Frontend:** React 18
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Containerization:** Docker & Docker Compose

## Hızlı Başlangıç

### Gereksinimler
- Docker Desktop kurulu
- Docker Compose kurulu

### 1. Uygulamayı Başlat

```bash
docker-compose up --build -d
```

Bu komut:
- PostgreSQL veritabanını başlatır
- Backend API'yi derler ve çalıştırır
- Frontend React uygulamasını başlatır

### 2. Erişim

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **PostgreSQL:** localhost:5432

### 3. Test Et

1. http://localhost:3000 adresine giderek uygulamaya erişin
2. "Kayıt Ol" butonuna tıklayın
3. Yeni bir kullanıcı oluşturun
4. Giriş yapın ve Dashboard'a erişin

## Docker Komutları

### Başlatma
```bash
docker-compose up --build -d
```

### Durdurmak
```bash
docker-compose down
```

### Logs'ı Görüntülemek
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Tüm Containers'ı Restart Etmek
```bash
docker-compose restart
```

## Veritabanı

- **Database Name:** bizimsite
- **Username:** postgres
- **Password:** postgres
- **Port:** 5432

PostgreSQL'e doğrudan bağlanmak için:
```bash
psql -h localhost -U postgres -d bizimsite
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Yeni kullanıcı oluştur
- `POST /api/users/login` - Giriş yap
- `GET /api/users/profile` - Profil bilgisi getir (Authorized)
- `PUT /api/users/profile` - Profil güncelle (Authorized)

### Apartments (Yakında)
- `GET /api/apartments` - Tüm daireleri listele
- `POST /api/apartments` - Yeni daire ekle
- `PUT /api/apartments/{id}` - Daire güncelle

## Geliştirme

### Local'de Çalıştırma (Docker olmadan)

#### Backend
```bash
cd BizimSite
dotnet run
```

#### Frontend
```bash
cd ClientApp
npm install
npm start
```

**Not:** Local'de çalışırken appsettings.json dosyasında veritabanı bağlantı stringini doğru ayarla.

## Proje Yapısı

```
BizimSite/
├── Controllers/        # API Controllers
├── Services/          # Business Logic
├── Models/            # Data Models
├── Data/              # Database Context
├── DTOs/              # Data Transfer Objects
├── ClientApp/         # React Frontend
│   └── src/
│       ├── pages/     # React Pages
│       ├── components/ # React Components
│       └── services/  # API Client
├── Dockerfile         # Backend Docker image
├── docker-compose.yml # Docker Compose configuration
└── Program.cs         # Application entry point
```

## Migrasyonlar

Veritabanında yapılan değişiklikler otomatik olarak migration'lar üzerinden uygulanır.

Yeni migration oluşturmak:
```bash
dotnet ef migrations add MigrationName
```

## Lisans

MIT

## İletişim

Sorularınız veya önerileriniz için bizimle iletişime geçin.
