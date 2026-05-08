# 🚀 Yapay Zeka Destekli Harcama Takip Sistemi

Bu proje, kullanıcıların doğal dille yazdığı serbest finansal işlem metinlerini büyük dil modelleri (LLM) kullanarak analiz eden, yapılandırılmış veri formatına dönüştüren, sohbet bağlamını hatırlayan ve görsel grafiklerle bütçe takibi sunan tam yığın (Full-Stack) bir web uygulamasıdır.

## 📐 Sistem Mimarisi

![schema](image.png)

## ✨ Özellikler

* **Sohbet Hafızalı Yapay Zeka Asistanı:** Uygulama sadece tekil komutları değil, sohbet geçmişini de anlar. "Marketten alışveriş yaptım" dediğinizde size "Ne kadar harcadınız?" diye sorar. Eksik bilgi varsa tamamlatır, bağlam dışı yanıtlarda işlemi güvenle iptal eder.
* **Düzenli İşlemler (Abonelik/Maaş) Takibi:** "Her ayın 15'inde 80.000 TL maaş alıyorum" veya "Kira ödüyorum" gibi komutları algılayarak bu işlemleri özel bir "Düzenli İşlemler" panosuna sabitler ve periyodik döngülerini tanır.
* **Hibrit Veri Girişi:** İster yapay zeka ile doğal dilde sohbet ederek, ister Dashboard üzerindeki şık Modal formunu kullanarak manuel olarak (AI olmadan) gelir/gider işlemleri ekleyebilirsiniz.
* **Otomatik PDF Raporlama:** Tek tıkla geçmişe dönük Haftalık veya Aylık harcama dökümlerinizi `jsPDF` altyapısı ile şık, tablolu ve profesyonel PDF dosyaları olarak cihazınıza indirebilirsiniz.
* **Akıllı Bütçe ve Limit Yönetimi:** Yapay zeka harcamaların yanı sıra finansal hedefleri de anlar. "Yemek için 5000 TL limit belirle" komutuyla, doluluk oranını (%80 sarı, %100 kırmızı) hesaplayan ilerleme çubuklu dinamik bütçe kotaları oluşturur.
* **Yapay Zeka Halüsinasyon Koruması (Defensive Backend):** LLM'lerin uydurma veri üretmesini (örneğin kira tutarını bilmeden 0 TL atamasını veya kategorileri uzatmasını) engelleyen katı bir arka uç doğrulama ve düzeltme (override) mekanizması içerir.
* **Tam CRUD Desteği:** Dashboard üzerinden geçmiş işlemleri manuel olarak düzenleme (tarih, tutar, kategori değiştirme) ve silme imkanı sunar. Veriler anında Chart.js grafiklerine yansır.

## 🛠️ Kullanılan Teknolojiler

**Ön Yüz (Frontend)**
* **İskelet ve Stil:** HTML5, CSS3, Bootstrap 5
* **Mantık ve API Haberleşmesi:** Vanilla JavaScript (KISS Prensibi)
* **Veri Görselleştirme:** Chart.js (Dinamik Grafikler)
* **Doküman Çıktısı:** jsPDF & jsPDF-AutoTable (Tarayıcı tabanlı PDF oluşturma)

**Arka Uç (Backend)**
* **Çalışma Ortamı:** Node.js (v24.x)
* **Web Çerçevesi:** Express.js
* **Veritabanı:** MongoDB Atlas & Mongoose (v8)
* **Yapay Zeka Motoru:** Groq API (Llama-3.3-70b-versatile LLM Modeli)

## ⚙️ Kurulum Adımları

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla izleyebilirsiniz:

### 1. Gereksinimler
* Bilgisayarınızda **Node.js** yüklü olmalıdır.
* Aktif bir **MongoDB Atlas** hesabı ve Cluster'ı bulunmalıdır.
* Geliştirici portalından alınmış bir **Groq API Anahtarı** olmalıdır.

### 2. Projeyi Klonlayın
Terminale aşağıdaki komutları yazarak projeyi yerel makinenize indirin:
```bash
git clone [https://github.com/emrecubukoglu/AI-Based-Development-SemesterProject-Harcama-Takibi-.git](https://github.com/emrecubukoglu/AI-Based-Development-SemesterProject-Harcama-Takibi-.git)
cd AI-Based-Development-SemesterProject-Harcama-Takibi-
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
Arka uç mimarimiz sohbet hafızasını destekleyecek şekilde güncellenmiştir. Arayüzü kullanmak yerine sistemi doğrudan terminal üzerinden test etmek isterseniz (Örn: PowerShell):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"messages": [{"role": "user", "content": "Udemy üzerinden 129.90 TL tutarında yazılım kursu satın aldım."}]}'
```

**Beklenen JSON Yanıtı:**
```json
{
  "status": "complete",
  "message": "✅ Kaydedildi!",
  "data": {
    "user_id": "test_user_123",
    "type": "expense",
    "amount": 129.9,
    "category": "Eğitim",
    "description": "yazılım kursu satın aldım",
    "is_recurring": false,
    "_id": "69f4cc3e...",
    "createdAt": "2026-05-09T15:52:30.009Z",
    "updatedAt": "2026-05-09T15:52:30.009Z"
  }
}
```

---
*Bu proje, Yapay Zeka Destekli Geliştirme (Dönem Projesi) kapsamında geliştirilmiştir.*