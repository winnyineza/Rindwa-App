import React, { useState, useEffect } from 'react';

function AlertsSection() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3001/alerts', {
        headers: {
          'Authorization': token,
          'sessionId': sessionId,
        },
      });
      const data = await response.json();
      setAlerts(data);
    };

    fetchData();
  }, []);

  return (
    <div className="alerts-section">
      <h3>Critical Alerts</h3>
      <ul>
        {alerts.map(alert => (
          <li key={alert.id}>
            {alert.message} ({alert.severity})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AlertsSection;
