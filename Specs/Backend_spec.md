# Backend_spec.md - Sunucu ve API Spesifikasyonu

## 1. Mimari Prensipler ve Standartlar
Bu projenin sunucu (Backend) katmanı, modüler yapıda ve düşük teknik borç (Low Technical Debt) ilkesiyle tasarlanmıştır.
* **Domain-Driven Design (DDD):** Kod yapısı, teknik isimlerle değil iş süreçleriyle (Domain) adlandırılacaktır. Klasörler ve yönlendirmeler finansal terminolojiye uygun olacaktır (örn: `transaction.controller.js`).
* **Clean Code:** Her bir fonksiyon tek bir işten sorumlu olacaktır (Single Responsibility). Yapay zeka ile haberleşen kodlar, veritabanı ile haberleşen kodlardan izole edilecektir.
* **Hata Yönetimi (Error Handling):** Tüm API uç noktalarında `try...catch` blokları kullanılacak, ön tarafa (Frontend) her zaman anlaşılır, standart JSON hata mesajları döndürülecektir.

## 2. Teknoloji Seçimi
* **Platform:** Node.js
* **Web Çatısı:** Express.js (Hızlı ve minimal API kurulumu için)
* **Veritabanı ORM:** Mongoose (MongoDB ile haberleşmek ve şema kurallarını uygulamak için)
* **Yapay Zeka:** Groq SDK (LLM Modeli: `llama-3.3-70b-versatile`)

## 3. Klasör Mimarisi (Clean Architecture)
Projeye yeni özellikler eklemeyi kolaylaştırmak için aşağıdaki katmanlı yapı kullanılacaktır:

  | Alan | Açıklama |
| :--- | :--- |
  | /src | **#içerisinde */config*, */models*, */services*, */controllers*, */routes* ve *server.js* dosyalarını bulunduran klasör** |
  | /config | # Veritabanı ve çevre değişkenleri (MongoDB URI vb.) |
  | /models | # Mongoose Şemaları (Database_spec.md'deki yapı) |
  | /services | # Dış servis bağlantıları (Groq AI API istekleri burada yapılır) |
  | /controllers | # Gelen istekleri işleyen, veritabanı ve servisleri yöneten mantık |
  | /routes | # API Uç noktalarının (Endpoints) tanımlandığı adresler |
  | server.js | # Express sunucusunun ana başlangıç dosyası |

## 4. API Uç Noktaları (RESTful Endpoints)
Kullanıcı arayüzünün, arka plan ile haberleşeceği temel köprüler:

### 4.1. İşlem Yönetimi (Transactions)
* **POST `/api/transactions/process-text`**
  * **İşlev:** Kullanıcıdan gelen serbest metni (prompt) alır. Groq AI servisine göndererek JSON'a çevirir. Dönen yapılandırılmış JSON verisini MongoDB'ye kaydeder.
* **GET `/api/transactions`**
  * **İşlev:** Arayüzdeki kontrol tablosunu (Data Grid) doldurmak için kayıtları listeler.
* **PUT `/api/transactions/:id`**
  * **İşlev:** Kullanıcının arayüzdeki tablodan yapacağı manuel güncellemeleri (kategori düzeltmesi vb.) veritabanına işler.

### 4.2. Finansal Analiz (Analytics & Budgets)
* **GET `/api/analytics/summary`**
  * **İşlev:** Chart.js grafikleri için verileri (aylık toplam, kategori bazlı pasta dilimi verileri) hesaplayıp arayüze sunar.
* **GET `/api/analytics/check-budget`**
  * **İşlev:** O anki bütçe durumunu sorgular. Limit aşıldıysa arayüzü uyarmak için `alert: true` döndürür.