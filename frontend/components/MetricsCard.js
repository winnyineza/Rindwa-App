import React, { useState, useEffect } from 'react';

function MetricsCard() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3001/metrics', {
        headers: {
          'Authorization': token,
          'sessionId': sessionId,
        },
      });
      const data = await response.json();
      setMetrics(data);
    };

    fetchData();
  }, []);

  return (
    <div className="metrics-card">
      <h3>Performance Metrics</h3>
      <p>Energy Efficiency: {metrics.energyEfficiency} COP</p>
      <p>Cooling Capacity: {metrics.coolingCapacity} kW</p>
      <p>CO2 Savings: {metrics.environmentalImpact?.co2Savings} kg</p>
    </div>
  );
}

export default MetricsCard;
