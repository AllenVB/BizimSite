# BizimSite Proje Planı

## 1. Proje Temizliği
- [x] ClientApp'i daha detaylı incele ve gerekli bağımlılıkları kontrol et
- [ ] `bizimsite-client` klasörünü sil (gereksiz, bozuk şablon)

## 2. Backend Geliştirme (ASP.NET Core)

### 2.1 Veri Modelleri (Models)
- [x] **Daire** (Apartment) - Id, DaireNo, Blok, Kat, SahipAdi, SahipTel, Email
- [x] **Kullanıcı** (User) - Id, Ad, Soyad, Email, Sifre, Rol (Yönetici/Sakin)
- [x] **Aidat** (Due) - Id, DaireId, Yıl, Ay, Tutar, Odendi, OdemeTarihi
- [x] **Duyuru** (Announcement) - Id, Baslik, Icerik, YayinTarihi
- [x] **Gider** (Expense) - Id, Kategori, Tutar, Aciklama, Tarih

### 2.2 Database Context
- [x] Entity Framework Core DbContext oluştur
- [x] SQLite bağlantısı yapılandırıldı
- [x] Migration oluşturuldu ve database güncellendi

### 2.3 Excel İçe Aktarım
- [x] Excel dosyasından Daire listesi import etme endpoint'i
- [x] EPPlus paketi kullan
- [x] ApartmentsController oluşturuldu (CRUD + Import)

## Tamamlanan İşler:
1. ✅ Veri Modelleri oluşturuldu (Apartment, User, Due, Announcement, Expense)
2. ✅ Entity Framework Core DbContext + SQLite yapılandırıldı
3. ✅ Migration oluşturuldu ve database güncellendi
4. ✅ Excel içe aktarım endpoint'i eklendi
5. ✅ CORS yapılandırması eklendi
6. ✅ API Controller (Apartments) oluşturuldu

