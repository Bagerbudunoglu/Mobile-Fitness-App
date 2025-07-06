# Fitness Uygulaması - React Native & Node.js

![Fitness App Banner](https://example.com/path/to/banner-image.jpg)

Eğitmenler ve sporcular için kapsamlı bir fitness çözümü sunan mobil uygulama. Kalori takibi, egzersiz rehberi, antrenör-öğrenci etkileşimi ve mesajlaşma özellikleri içerir.

## Öne Çıkan Özellikler

### 🏋️ Egzersiz Modülü
- 500+ egzersiz video rehberi
- Set ve tekrar takip sistemi
- Kişiselleştirilmiş antrenman planları
- Egzersiz kütüphanesi (vücut bölgesine göre filtreleme)

### 🍏 Beslenme Takibi
- Akıllı yemek veritabanı (1000+ besin)
- Öğün planlama ve kalori hesaplama
- Streak (üst üste kayıt) sistemi
- Beslenme istatistikleri ve grafikler

### 👥 Eğitmen-Öğrenci Etkileşimi
- Anlık mesajlaşma sistemi
- Performans değerlendirme ve puanlama
- Ödev/antrenman atama
- İlerleme takibi

### 📊 İstatistikler
- Aylık performans analizleri
- Kilo ve vücut ölçüsü takibi
- Başarı rozetleri ve ödüller

## Teknoloji Stack'i

### Frontend
- **React Native** (iOS & Android)
- **Redux** (State management)
- **React Navigation** (Routing)
- **Axios** (API calls)
- **Socket.IO** (Realtime messaging)

### Backend
- **Node.js** (Runtime)
- **Express.js** (API framework)
- **MongoDB** (Database)
- **Mongoose** (ODM)
- **JWT** (Authentication)
- **Firebase** (Push notifications)
- **Cloudinary** (Media storage)

### Ek Hizmetler
- **Stripe** (Ödeme sistemi)
- **OneSignal** (Bildirimler)
- **Google Fitness API** (Sağlık verileri)

## Kurulum

### Ön Gereksinimler
- Node.js v16+
- npm/yarn
- MongoDB Atlas hesabı
- React Native geliştirme ortamı

### Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### Frontend Kurulumu
```bash
cd mobile
npm install
cp .env.example .env
# API URL'lerini ve configleri ayarlayın
npx react-native run-android # veya run-ios
```

## Veritabanı Yapısı

```
User {
  _id: ObjectId
  name: String
  email: String (unique)
  password: String
  role: Enum ['trainer', 'trainee']
  profileImage: String
  ...
}

Exercise {
  _id: ObjectId
  name: String
  description: String
  muscleGroup: String
  videoUrl: String
  ...
}

Workout {
  _id: ObjectId
  traineeId: ObjectId (ref: User)
  trainerId: ObjectId (ref: User)
  exercises: [{
    exerciseId: ObjectId (ref: Exercise)
    sets: Number
    reps: Number
    completed: Boolean
  }]
  ...
}

Meal {
  _id: ObjectId
  userId: ObjectId (ref: User)
  date: Date
  foods: [{
    name: String
    calories: Number
    protein: Number
    carbs: Number
    fat: Number
  }]
  ...
}

Message {
  _id: ObjectId
  sender: ObjectId (ref: User)
  receiver: ObjectId (ref: User)
  content: String
  read: Boolean
  createdAt: Date
}
```


## Katkıda Bulunma

Katkılarınızı bekliyoruz! Katkıda bulunmak için:

1. Forklayın (https://github.com/sizin-repo/fitness-app/fork)
2. Yeni branch oluşturun (`git checkout -b feature/fooBar`)
3. Değişikliklerinizi commit edin (`git commit -am 'Add some fooBar'`)
4. Push yapın (`git push origin feature/fooBar`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakınız.
