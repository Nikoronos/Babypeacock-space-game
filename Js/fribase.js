// BPC Space Firebase Setup
// Sayaç + Ülke Kaydı Sistemi

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://bpc-space-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global sayaç artırıcı
window.BPC_incrementOnStart = async function () {
  try {
    const statsRef = db.ref("stats");
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data.country_name || "Unknown";

    // Toplam oynanma
    const playRef = db.ref("stats/totalStarts");
    playRef.transaction((current) => (current || 0) + 1);

    // Ülke bazında
    const locRef = db.ref("stats/locations/" + country);
    locRef.transaction((current) => (current || 0) + 1);

    // Son ülke
    db.ref("stats/lastCountry").set(country);
  } catch (err) {
    console.error("Firebase kayıt hatası:", err);
  }
};

// Sayaç görüntüleme (sadece toplam gösterilir)
window.BPC_displayCounter = function () {
  const ref = db.ref("stats/totalStarts");
  ref.on("value", (snapshot) => {
    const count = snapshot.val() || 0;
    const el = document.getElementById("globalCounter");
    if (el) el.innerText = `🌍 Played ${count} times`;
  });
};
