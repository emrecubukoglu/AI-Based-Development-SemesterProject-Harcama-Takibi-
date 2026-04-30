# Database_spec.md - Veritabanı Spesifikasyonu

## 1. Mimari Prensipler ve Standartlar
Bu projenin veritabanı katmanı, sürdürülebilir ve hatasız bir geliştirme süreci için aşağıdaki kurallara bağlıdır:

* **Clean Code & Low Technical Debt:** Veritabanı alan adları (field names) kısaltma içermez, işlevini tam olarak açıklar. Teknik borcu önlemek için şema yapısı esnek ancak tip güvenliği (type safety) yüksek tutulmuştur.
* **Domain-Driven Design (DDD):** "Ubiquitous Language" (Ortak Dil) prensibi uyarınca, kod ve veritabanındaki tüm isimlendirmeler finansal alan terimlerinden seçilmiştir. (Örn: `Transaction`, `RecurringIncome`, `BudgetLimit`).
* **Modülerlik:** Veritabanı, gelecekte eklenebilecek "Çoklu Kullanıcı" veya "Gelişmiş Raporlama" gibi özelliklere uyumlu, gevşek bağlı (loosely coupled) bir yapıda tasarlanmıştır.

## 2. Teknoloji Seçimi
* **Motor:** MongoDB Atlas (Cloud Database)
* **Model:** Document-Oriented (NoSQL) - JSON tabanlı esnek yapı.
* **Bağlantı:** Node.js üzerinde **Mongoose ODM** (Object Data Modeling) kütüphanesi kullanılacaktır.

## 3. Veri Modelleri (Schemas)

### 3.1. Transactions (Finansal Hareketler)
Bu koleksiyon, her türlü gelir ve gider hareketini saklar.

| Alan | Veri Tipi | Açıklama | DDD Terimi |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB tarafından atanan benzersiz kimlik. | - |
| `user_id` | String | Kaydın kime ait olduğu (Gelecek planı için). | `AccountOwner` |
| `type` | String | Enum: `income` (Gelir) veya `expense` (Gider). | `TransactionType` |
| `amount` | Number | İşlemin sayısal tutarı (Hatasız hesaplama için Number). | `TransactionValue` |
| `category` | String | AI veya kullanıcı tarafından belirlenen etiket. | `DomainCategory` |
| `description` | String | İşlemin detayı (Kullanıcı metni veya AI özeti). | `ContextDetail` |
| `date` | Date | İşlemin gerçekleştiği tarih. | `OccurrenceDate` |
| `is_recurring` | Boolean | Bu işlemin düzenli olup olmadığı (Maaş, kira vb.). | `IsRecurring` |
| `recurring_info` | Object | Eğer `is_recurring: true` ise periyot bilgisi tutulur. | `RecurringPattern` |

**Recurring Info Detayı:**
```json
{
  "frequency_days": 30, // Kaç günde bir tekrarlıyor?
  "last_processed_date": "2024-04-15" // En son ne zaman işlendi?
}
```
### 3.2. Budgets (Kategori Bazlı Limitler)
Kullanıcının harcama kontrolü için belirlediği limitleri saklar.

| Alan | Veri Tipi | Açıklama |
| :--- | :--- | :--- |
| `category` | String | Limitin geçerli olduğu kategori (Örn: "Dışarıda Yemek"). |
| `limit_amount` | Number | Belirlenen maksimum tutar. |
| `start_date` | Date | Bütçe periyodunun başlangıcı. |
| `end_date` | Date | Bütçe periyodunun bitişi. |
| `alert_threshold` | Number | Uyarı verilecek oran (Varsayılan: 0.80 -> %80). |

## 4. İş Kuralları ve Doğrulama (Business Logic)
* **Maaş/Gelir Akışı:** AI bir girdiyi `type: income` olarak saptarsa, kullanıcıya `is_recurring` sorgusu butonla yapılır. `true` dönerse `recurring_info` objesi oluşturulur. * **Bütçe Aşımı:** Harcama kaydedilirken, o kategorideki aktif `Budget` kontrol edilir. Eğer `amount / limit_amount > 0.80` ise arayüze uyarı bayrağı gönderilir.
* **Veri Bütünlüğü:** `amount` değeri asla negatif olamaz.
