import React, { useState } from "react";
import WeatherCard from "./WeatherCard";
import "./App.css";
import { BsTrash } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [savedCities, setSavedCities] = useState(() => {
  // Load from localStorage when app starts
  const stored = localStorage.getItem("savedCities");
  return stored ? JSON.parse(stored) : [];
});
const [savedCitiesWeather, setSavedCitiesWeather] = useState({});

// Fetch weather for all saved cities
const fetchSavedCitiesWeather = async () => {
  const weatherData = {};
  for (let city of savedCities) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.cod === 200) weatherData[city] = data;
    } catch (err) {
      console.error("Error fetching saved city weather:", err);
    }
  }
  setSavedCitiesWeather(weatherData);
};

// Call this whenever savedCities changes
React.useEffect(() => {
  if (savedCities.length > 0) fetchSavedCitiesWeather();
}, [savedCities]);

  const apiKey = "6287ed3aff7d460cf7cb833dc0744252";

  // Fetch weather by city
  const getWeather = async (cityData) => {
  try {
    let url = "";

    if (cityData && cityData.lat && cityData.lon) {
      // suggestion object clicked
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&appid=${apiKey}&units=metric`;
    } else if (city) {
      // manual typing + Enter
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else {
      setError("Please enter a city name!");
      return;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      setError(data.message || "City not found!");
      setWeather(null);
    } else {
      setWeather(data);
      setError("");
    }
  } catch (err) {
    setError("Failed to fetch weather data.");
    setWeather(null);
  }
};


  // Fetch city suggestions from Geo API
const fetchSuggestions = async (value) => {
  if (value.length === 0) {
    setSuggestions([]);
    return;
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    setSuggestions(data); // 🔑 store raw objects, not strings
  } catch (err) {
    console.error("Error fetching city suggestions:", err);
  }
};


  // Handle input typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);
    fetchSuggestions(value);
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getWeather();
      setSuggestions([]); // close dropdown
    }
  };
  const handleKeyDown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setHighlightIndex((prev) =>
      prev < suggestions.length - 1 ? prev + 1 : prev
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (highlightIndex >= 0 && suggestions[highlightIndex]) {
      handleSuggestionClick(suggestions[highlightIndex]);
    } else {
      getWeather();
      setSuggestions([]);
    }
  }
};

const saveCity = (cityName) => {
  if (!savedCities.includes(cityName)) {
    const updated = [...savedCities, cityName];
    setSavedCities(updated);
    localStorage.setItem("savedCities", JSON.stringify(updated));
  }
};



  // Handle suggestion click
const handleSuggestionClick = (cityObj) => {
  setCity(cityObj.name); // show city name in input
  setSuggestions([]);
  getWeather(cityObj); // pass full object (lat/lon)
};

const getWeatherEmoji = (condition) => {
  if (!condition) return "❓";
  condition = condition.toLowerCase();
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("clear")) return "☀️";
  if (condition.includes("snow")) return "❄️";
  return "🌡️";
};



  return (
    <div className="app-container">
      <h1 className="title">🌤️ Weather Forecast</h1>

      <div className="input-container">
  <div className="input-wrapper">
    <input
      type="text"
      placeholder="Enter city..."
      value={city}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
    />

    {/* Suggestions dropdown aligned with input */}
    {suggestions.length > 0 && (
  <ul className="suggestions">
    {suggestions.map((cityObj, index) => (
      <li
        key={index}
        onClick={() => handleSuggestionClick(cityObj)}
        className={highlightIndex === index ? "highlighted" : ""}
      >
        {cityObj.name}
        {cityObj.state ? `, ${cityObj.state}` : ""}, {cityObj.country}
      </li>
    ))}
  </ul>
)}
  </div>
  

  <button onClick={() => getWeather()}>Check</button>
</div>


      {error && <p className="error">{error}</p>}
      {weather && <WeatherCard weather={weather} onSave={saveCity} />}

{savedCities.length > 0 && (
  <div className="saved-cities">
    <h3><FaStar /></h3>
    <ul>
      {savedCities.map((cityName, i) => (
        <li key={i} className="saved-city-item">
          <span
  className="city-name"
  onClick={() => getWeather(cityName)}
>
  {cityName}{" "}
  {savedCitiesWeather[cityName] &&
    getWeatherEmoji(savedCitiesWeather[cityName].weather[0].main)}
</span>


          {/* Display weather info for this city */}
          {savedCitiesWeather[cityName] && (
            <span className="city-weather">
              {savedCitiesWeather[cityName].main.temp.toFixed(1)}°C,{" "}
              {savedCitiesWeather[cityName].weather[0].main}
            </span>
          )}

          <button
            className="unsave-btn"
            onClick={(e) => {
              e.stopPropagation();
              const updated = savedCities.filter((c) => c !== cityName);
              setSavedCities(updated);
              localStorage.setItem("savedCities", JSON.stringify(updated));
            }}
          >
            <BsTrash />
          </button>
        </li>
      ))}
    </ul>
  </div>
)}

    </div>
  );
  

}

export default App;
