# 🚀 Yapay Zeka Destekli Harcama Takip Sistemi

Bu proje, kullanıcıların doğal dille yazdığı serbest finansal işlem metinlerini büyük dil modelleri (LLM) kullanarak analiz eden, yapılandırılmış veri formatına dönüştüren ve görsel grafiklerle bütçe takibi sunan tam yığın (Full-Stack) bir web uygulamasıdır.

## 📐 Sistem Mimarisi

![schema](image.png)

## ✨ Özellikler

* **Doğal Dil İşleme (Sohbet Arayüzü):** "Marketten 450 TL'lik mutfak alışverişi yaptım" veya "Freelance projeden 5000 TL yattı" gibi düz metinleri işler.
* **Akıllı Bütçe ve Limit Yönetimi:** Yapay zeka sadece harcamaları değil, hedefleri de anlar. "Yemek için 5000 TL limit belirle" komutunu algılayarak dinamik bütçe kotaları oluşturur.
* **Görsel Kontrol Paneli (Dashboard):** Chart.js entegrasyonu ile kategori dağılımlarını (Pasta Grafik) ve aylık harcama eğilimlerini (Çizgi Grafik) görselleştirir. Limit doluluk oranlarını ilerleme çubukları ile (%80 uyarısı, aşım uyarısı) gösterir.
* **Tam CRUD Desteği:** Dashboard üzerinden geçmiş işlemleri manuel olarak düzenleme ve silme imkanı sunar, veriler anında grafiklere yansır.
* **Türkçe Kategorizasyon:** Yapay zeka sistem komutları (Prompt Engineering) kullanılarak tüm harcamalar Türkçeye uygun şekilde (Eğitim, Mutfak, Elektronik vb.) otomatik sınıflandırılır.
* **Defensive & Stabil Veritabanı:** Node.js v24 sürümlerindeki DNS çözümleme (SRV) sorunlarını aşmak için doğrudan fiziksel IP/Host bağlantısı kullanan sağlam bir MongoDB mimarisi içerir.

## 🛠️ Kullanılan Teknolojiler

**Ön Yüz (Frontend)**
* **İskelet ve Stil:** HTML5, CSS3, Bootstrap 5
* **Mantık ve API Haberleşmesi:** Vanilla JavaScript (KISS Prensibi)
* **Veri Görselleştirme:** Chart.js

**Arka Uç (Backend)**
* **Çalışma Ortamı:** Node.js (v24.x)
* **Web Çerçevesi:** Express.js
* **Veritabanı:** MongoDB Atlas & Mongoose (v8)
* **Yapay Zeka Motoru:** Groq API (Llama Modelleri)

## ⚙️ Kurulum Adımları

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla izleyebilirsiniz:

### 1. Gereksinimler
* Bilgisayarınızda **Node.js** yüklü olmalıdır.
* Aktif bir **MongoDB Atlas** hesabı ve Cluster'ı bulunmalıdır.
* Geliştirici portalından alınmış bir **Groq API Anahtarı** olmalıdır.

### 2. Projeyi Klonlayın
Terminale aşağıdaki komutları yazarak projeyi yerel makinenize indirin:
```bash
git clone [https://github.com/KULLANICI_ADINIZ/AI-Based-Development-SemesterProject-Harcama-Takibi.git](https://github.com/KULLANICI_ADINIZ/AI-Based-Development-SemesterProject-Harcama-Takibi.git)
cd AI-Based-Development-SemesterProject-Harcama-Takibi
```

### 3. Bağımlılıkları Yükleyin
Projenin ihtiyaç duyduğu Node paketlerini kurun:
```bash
npm install
```

### 4. Çevre Değişkenlerini Ayarlayın
Proje ana dizininde bir `.env` dosyası oluşturun ve aşağıdaki şablonu kendi bilgilerinizle doldurun:
```env
PORT=3000
# Node.js v24 IPv6/SRV çakışmalarını önlemek için Standard Connection String kullanılmıştır.
MONGODB_URI=mongodb://KULLANICI_ADI:SIFRE@SUNUCU_ADRESLERI/VERITABANI_ADI?authSource=admin&replicaSet=REPLICA_SET_ADI&tls=true
GROQ_API_KEY=senin_groq_api_anahtarin
```

### 5. Sunucuyu (Backend) Başlatın
Uygulamayı ayağa kaldırın:
```bash
node server.js
```
Terminalde `✓ Connected to MongoDB Atlas successfully!` mesajını görüyorsanız arka uç sisteminiz istek almaya hazırdır!

### 6. Arayüzü (Frontend) Çalıştırın
Arka uç çalışırken, projeyi tarayıcınızda görüntülemek için:
* VS Code kullanıyorsanız `frontend/index.html` dosyasına sağ tıklayıp **"Open with Live Server"** seçeneğine tıklayın.
* Veya doğrudan bilgisayarınızdan `frontend` klasörüne girip `index.html` dosyasına çift tıklayarak tarayıcıda açın.

---

## 🧪 Geliştiriciler İçin API Testi
Arayüzü kullanmak yerine sistemi doğrudan terminal üzerinden test etmek isterseniz (Örn: PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"text": "Udemy üzerinden 129.90 TL tutarında yazılım kursu satın aldım."}'
```

**Beklenen JSON Yanıtı:**
```json
{
  "user_id": "unknown",
  "type": "expense",
  "amount": 129.9,
  "category": "Eğitim",
  "description": "yazilim kursu satin aldim",
  "is_recurring": false,
  "_id": "69f4cc3e...",
  "createdAt": "2026-05-01T15:52:30.009Z",
  "updatedAt": "2026-05-01T15:52:30.009Z"
}
```

---
*Bu proje, Yapay Zeka Destekli Geliştirme (Dönem Projesi) kapsamında geliştirilmiştir.*