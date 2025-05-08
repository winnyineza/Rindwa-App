import React, { useState, useEffect } from 'react';

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      // Replace with your weather API endpoint
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=San Francisco&appid=73c107d10d3e7418528bfe3786a4686f');
      const data = await response.json();
      setWeatherData(data);
    };

    fetchWeatherData();
  }, []);

  if (!weatherData) {
    return <div>Loading weather data...</div>;
  }

  return (
    <div>
      <h2>Weather in {weatherData.name}</h2>
      <p>Temperature: {weatherData.main.temp}°C</p>
      <p>Description: {weatherData.weather[0].description}</p>
    </div>
  );
}

export default WeatherWidget;
