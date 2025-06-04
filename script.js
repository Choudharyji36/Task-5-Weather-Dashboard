const apiKey = "bec9f2b45e39d884ef7fe06e1da862b9";

async function getWeather(cityFromStorage = null) {
  const city = cityFromStorage || document.getElementById("cityInput").value.trim();
  const resultDiv = document.getElementById("weatherResult");
  const forecastDiv = document.getElementById("forecastResult");
  const loader = document.getElementById("loader");

  resultDiv.innerHTML = "";
  forecastDiv.innerHTML = "";
  loader.style.display = "block";

  if (!city) {
    resultDiv.innerHTML = "<p>Please enter a city name or ZIP code.</p>";
    loader.style.display = "none";
    return;
  }

  try {
    localStorage.setItem("lastCity", city);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const weatherHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
      <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
      <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
      <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
      <p><strong>Condition:</strong> ${data.weather[0].description}</p>
    `;
    resultDiv.innerHTML = weatherHTML;

    await getForecast(city);
  } catch (error) {
    resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    loader.style.display = "none";
  }
}

async function getForecast(city) {
  const forecastDiv = document.getElementById("forecastResult");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error("Forecast data not available");

    const data = await response.json();
    const dailyData = {};

    data.list.forEach((entry) => {
      const [date, time] = entry.dt_txt.split(" ");
      if (time === "12:00:00") {
        dailyData[date] = entry;
      }
    });

    let forecastHTML = "<h3>5-Day Forecast</h3><div class='forecast-container'>";
    Object.keys(dailyData).forEach((date) => {
      const entry = dailyData[date];
      const fullDate = new Date(date);
      const day = fullDate.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = fullDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      forecastHTML += `
        <div class="forecast-day">
          <p><strong>${day}</strong><br>${dateStr}</p>
          <img src="https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png" />
          <p><strong>${entry.main.temp}°C</strong></p>
          <p>Min: ${entry.main.temp_min}°C</p>
          <p>Max: ${entry.main.temp_max}°C</p>
          <p>Humidity: ${entry.main.humidity}%</p>
        </div>
      `;
    });
    forecastHTML += "</div>";
    forecastDiv.innerHTML = forecastHTML;
  } catch (error) {
    forecastDiv.innerHTML = `<p>Error loading forecast: ${error.message}</p>`;
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

let isHindi = false;

function toggleLanguage() {
  isHindi = !isHindi;
  localStorage.setItem("language", isHindi ? "hi" : "en");
  updateLanguage();
}

function updateLanguage() {
  document.querySelector("h1").innerText = isHindi ? "🌤️ मौसम डैशबोर्ड" : "🌤️ Weather Dashboard";
  document.getElementById("cityInput").placeholder = isHindi ? "शहर या ज़िप कोड दर्ज करें" : "Enter city or ZIP code";
  document.querySelector(".search-box button").innerText = isHindi ? "खोजें" : "Search";

  const forecastTitle = document.querySelector("#forecastResult h3");
  if (forecastTitle) {
    forecastTitle.innerText = isHindi ? "5-दिन का पूर्वानुमान" : "5-Day Forecast";
  }
}

window.onload = () => {
  // 🌙 Apply saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

 // Language apply
  const savedLang = localStorage.getItem("language");
  if (savedLang === "hi") {
    isHindi = true;
    updateLanguage();
  }
  
  // 🏙️ Auto-load last city
  const last = localStorage.getItem("lastCity");
  if (last) {
    document.getElementById("lastCity").innerHTML = `🔁 Last searched: <strong>${last}</strong>`;
    getWeather(last);
  }

  // 📍 Get user location
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      getWeather(data.name);
    });
  }
};
