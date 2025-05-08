import React, { useState, useEffect } from 'react';

function WeatherWidget() {
  const [weatherData, setWeatherData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3001/weather', {
        headers: {
          'Authorization': token,
          'sessionId': sessionId,
        },
      });
      const data = await response.json();
      setWeatherData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="weather-widget">
      <h3>Weather</h3>
      {Object.keys(weatherData).map(city => (
        <div key={city}>
          <h4>{city}</h4>
          <p>Temperature: {weatherData[city]?.temperature}°C</p>
          <p>Description: {weatherData[city]?.description}</p>
          <img src={`http://openweathermap.org/img/w/${weatherData[city]?.icon}.png`} alt="Weather Icon" />
        </div>
      ))}
    </div>
  );
}

export default WeatherWidget;
