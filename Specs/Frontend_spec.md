# Frontend_spec.md - Kullanıcı Arayüzü Spesifikasyonu

## 1. Mimari Prensipler ve Standartlar
Bu projenin ön yüz (Frontend) katmanı, kullanıcı dostu ve performansı yüksek bir deneyim sunmak için tasarlanmıştır.
* **KISS Prensibi (Keep It Simple, Stupid):** Karmaşık framework'ler (React/Vue) kullanılmayacak, tamamen Vanilla JavaScript (Saf JS) ile DOM manipülasyonu yapılacaktır.
* **Responsive Design (Duyarlı Tasarım):** Uygulama, Bootstrap 5 grid sistemi kullanılarak hem mobilde hem de masaüstünde kusursuz çalışacak şekilde tasarlanacaktır.
* **Sayfa Ayrımı (Separation of Concerns):** Veri girişi (Sohbet) ile Veri Analizi (Grafikler) karmaşayı önlemek amacıyla ayrı HTML sayfalarında tutulacaktır.

## 2. Teknoloji Seçimi
* **İskelet ve Stil:** HTML5, CSS3, Bootstrap 5 (Hazır UI bileşenleri ve grid için).
* **Etkileşim ve API Haberleşmesi:** Vanilla JavaScript (`fetch` API ve `async/await` yapısı).
* **Veri Görselleştirme:** Chart.js (Hafif ve animasyonlu grafikler için).

## 3. Sayfa Yapısı ve Sayfa İçi Modüller

### 3.1. index.html (Akıllı Girdi ve Sohbet Ekranı)
Kullanıcının yapay zeka ile konuştuğu ana sayfadır.
* **Chat Container:** Kullanıcı mesajlarının sağda, AI cevaplarının solda balonlar halinde göründüğü klasik sohbet arayüzü.
* **Input Area:** Metin giriş kutusu ve "Gönder" butonu.
* **İş Mantığı:** Kullanıcı mesajı yazıp gönderdiğinde, arkada Node.js API'sine (`/api/transactions/process-text`) istek atılacak ve dönen cevap (veya sorulan bağlam sorusu) ekrana basılacaktır.

### 3.2. dashboard.html (Finansal Kontrol Paneli)
Kullanıcının verilerini analiz ettiği ve manuel düzenlemeler yaptığı sayfadır.
* **Özet Kartları (Summary Cards):** En üstte yan yana duran "Toplam Gelir", "Toplam Gider", "Kalan Bütçe" kartları.
* **Grafik Alanı (Charts):**
  * *Kategori Dağılımı:* Chart.js ile çizilmiş bir Pasta Grafiği (Pie Chart).
  * *Harcama Eğrisi:* Ay içindeki harcama hızını gösteren Çizgi Grafik (Line Chart).
* **Veri Tablosu (Data Grid):** Kaydedilen verilerin listelendiği tablo. Kullanıcı bu tablodaki bir satıra tıklayıp düzenleme yapabilir.

## 4. API Haberleşme Katmanı (Services)
Frontend kodlarının içinde, backend ile konuşacak olan JS fonksiyonları (`fetch` istekleri) ayrı ve modüler fonksiyonlar halinde yazılacaktır.
* Tüm arayüz uyarıları (Bütçe aşımı kırmızı uyarıları vb.) doğrudan Backend'den gelen verilere göre tetiklenecektir.