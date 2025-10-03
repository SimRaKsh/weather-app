import React from "react";
import { FaTemperatureHigh, FaWind, FaTint } from "react-icons/fa";
import { WiCloud } from "react-icons/wi";
import { GoBookmarkFill } from "react-icons/go";


function WeatherCard({ weather, onSave }) {
  if (!weather || !weather.main || !weather.weather || !weather.sys) {
    return <p style={{ color: "red" }}>⚠️ No weather data available</p>;
  }

  return (
    <div className="weather-card">
      {/* Bookmark Save Button */}
      <div
       style={{ color:"#67c68d"}}
        className="bookmark"
        onClick={() => onSave(weather.name)}
        title="Save City"
      >
        <GoBookmarkFill />
      </div>
      <h2>
        {weather.name}, {weather.sys.country}
      </h2>
      <p>
        <FaTemperatureHigh style={{ color: "hotpink" }} /> Temp:{" "}
        {weather.main.temp} °C
      </p>
      <p>
        <WiCloud style={{ color: "lightgray" }} /> Condition:{" "}
        {weather.weather[0].description}
      </p>
      <p>
        <FaWind style={{ color: "purple" }} /> Wind: {weather.wind.speed} m/s
      </p>
      <p>
        <FaTint style={{ color: "dodgerblue" }} /> Humidity:{" "}
        {weather.main.humidity}%
      </p>
      
    </div>
  );
}

export default WeatherCard;
