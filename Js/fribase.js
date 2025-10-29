<!-- Firebase Core SDK -->
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.11/firebase-database-compat.js"></script>

<script>
/* ---------------------------
   🔥 BPC Space Firebase Setup
   Sayaç + Ülke Kaydı Sistemi
---------------------------- */

// 1. Firebase yapılandırma (KENDİ PROJE VERİNLE DEĞİŞTİR)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://bpc-space-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 2. Başlatma
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 3. Global sayaç artırıcı
window.BPC_incrementOnStart = async function () {
  try {
    const statsRef = db.ref("stats");

    // Lokasyon al (kullanıcıya görünmeden)
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data.country_name || "Unknown";

    // Transaction ile sayaç artır
    const playRef = db.ref("stats/totalStarts");
    playRef.transaction((current) => (current || 0) + 1);

    // Ülke bazında artır
    const locRef = db.ref("stats/locations/" + country);
    locRef.transaction((current) => (current || 0) + 1);

    // Son oynayan ülkeyi güncelle
    db.ref("stats/lastCountry").set(country);
  } catch (err) {
    console.error("Firebase kayıt hatası:", err);
  }
};

// 4. Sayaç gösterimi (oyunculara sadece toplam sayı gösterilir)
window.BPC_displayCounter = function () {
  const ref = db.ref("stats/totalStarts");
  ref.on("value", (snapshot) => {
    const count = snapshot.val() || 0;
    const el = document.getElementById("globalCounter");
    if (el) el.innerText = "🌍 Played " + count + " times";
  });
};
</script>
