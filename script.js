
const apiKey = "fa098e6df702e7b786b8094f3f8f5a68";
const emojiDiv = document.querySelector(".emoji");
const emotionText = document.getElementById("emotion");
const tempText = document.getElementById("temp");
const timeText = document.getElementById("time");
const reloadBtn = document.getElementById("reloadBtn");
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

reloadBtn.addEventListener("click", startWeatherApp);
searchBtn.addEventListener("click", () => getWeatherByCity(cityInput.value));

function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    speechSynthesis.speak(utter);
  } else {
    console.warn('La synthèse vocale n\'est pas supportée par ce navigateur.');
  }
}

function startWeatherApp() {
  emotionText.textContent = "Mise à jour de la météo...";
  emojiDiv.textContent = "⏳";
  tempText.textContent = "";
  timeText.textContent = "";

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      err => showFromLocalStorage("Autorisation géolocalisation refusée.")
    );
  } else {
    showFromLocalStorage("Géolocalisation non disponible.");
  }
}

function getWeatherByCity(city) {
    let alert=document.getElementById("alert");
  if (city.trim() === "") {
    alert.textContent = "Veuillez entrer un nom de ville.";
    alert.classList.add("alert-danger");
    
    return;
  }
  else{
       alert.textContent = " "; 
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=fr&appid=${apiKey}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
         alert.textContent = "Ville non trouvée, veuillez essayer avec un autre nom.";
        return;
      }
      else{
        alert.textContent = " "; 
      }


      const condition = data.weather[0].main.toLowerCase();
      const temp = data.main.temp;
      const city = data.name;
      const offset = data.timezone;

      const emotion = meteoToEmotion(condition);

      setBackground(condition);
      emojiDiv.classList.remove("animate__fadeInDown");
      void emojiDiv.offsetWidth;
      emojiDiv.classList.add("animate__fadeInDown");
      emojiDiv.textContent = emotion.emoji;

      emotionText.textContent = emotion.message;
      tempText.textContent = `Il fait ${temp.toFixed(1)}°C à ${city}.`;
      timeText.textContent = `Heure locale : ${getLocalTime(offset)}`;

      speak(`${emotion.message} Il fait ${temp.toFixed(1)} degrés à ${city}.`);
      saveToLocalStorage(city, temp, condition, offset);
    })
    .catch(err => {
      showFromLocalStorage("Erreur de météo.");
      console.error(err);
    });

   
}

function getWeatherByCoords(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=fr&appid=${apiKey}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const condition = data.weather[0].main.toLowerCase();
      const temp = data.main.temp;
      const city = data.name;
      const offset = data.timezone;

      const emotion = meteoToEmotion(condition);

      setBackground(condition);
      emojiDiv.classList.remove("animate__fadeInDown");
      void emojiDiv.offsetWidth;
      emojiDiv.classList.add("animate__fadeInDown");
      emojiDiv.textContent = emotion.emoji;

      emotionText.textContent = emotion.message;
      tempText.textContent = `Il fait ${temp.toFixed(1)}°C à ${city}.`;
      timeText.textContent = `Heure locale : ${getLocalTime(offset)}`;

      speak(`${emotion.message} Il fait ${temp.toFixed(1)} degrés à ${city}.`);
      saveToLocalStorage(city, temp, condition, offset);
    })
    .catch(err => {
      showFromLocalStorage("Erreur de météo.");
      console.error(err);
    });
}

function setBackground(condition) {
  let bg = "";
  if (condition.includes("clear")) bg = " linear-gradient(rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0)),url('static/img/clear.jpg')";
  else if (condition.includes("rain")) bg = " linear-gradient(rgba(0, 0, 0, 0.651), rgba(0, 0, 0, 0)),url('static/img/rain.jpg')";
  else if (condition.includes("cloud")) bg = " linear-gradient(rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0)),url('static/img/cloud.png')";
  else if (condition.includes("snow")) bg = " linear-gradient(rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0)),url('static/img/bg.jpg')";
  else if (condition.includes("storm")) bg = " linear-gradient(rgba(0, 0, 0, 0.21), rgba(0, 0, 0, 0)),url('static/img/storm.jpg')";
  else bg = "static/img/bg.jpg')";
  document.body.style.backgroundImage = bg;
}

function getLocalTime(offsetInSeconds) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetInSeconds * 1000);
  return local.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function meteoToEmotion(condition) {
  if (condition.includes("clear")) return { emoji: "😎", message: "Soleil au top, bonne humeur garantie !" };
  if (condition.includes("rain")) return { emoji: "😩", message: "Pluie douce... journée cocooning ☕" };
  if (condition.includes("cloud")) return { emoji: "😁", message: "Ciel gris, pensées lumineuses 🌤️" };
  if (condition.includes("snow")) return { emoji: "🥶", message: "Neige féerique ! ❄️✨" };
  if (condition.includes("storm")) return { emoji: "🤯", message: "Orages en vue... restons au sec ⚡" };
  return { emoji: "🙄", message: "Temps variable, humeur arc-en-ciel 🙄" };
}

function saveToLocalStorage(city, temp, condition, offset) {
  const savedData = { city, temp, condition, offset };
  localStorage.setItem("lastWeather", JSON.stringify(savedData));
}

function showFromLocalStorage(message) {
  const data = localStorage.getItem("lastWeather");
  if (data) {
    const { city, temp, condition, offset } = JSON.parse(data);
    const emotion = meteoToEmotion(condition);
    setBackground(condition);

    emojiDiv.textContent = emotion.emoji;
    emotionText.textContent = message + " Données précédentes affichées.";
    tempText.textContent = `Il faisait ${temp.toFixed(1)}°C à ${city}.`;
    timeText.textContent = `Heure locale estimée : ${getLocalTime(offset)}`;
    speak(`${emotion.message} Il faisait ${temp.toFixed(1)} degrés à ${city}.`);
  } else {
    emojiDiv.textContent = "😢";
    emotionText.textContent = "Aucune donnée météo disponible.";
    tempText.textContent = "";
    timeText.textContent = "";
  }
}

startWeatherApp();
