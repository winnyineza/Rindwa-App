import React, { useState, useEffect } from 'react';

function StatusCard() {
  const [statusData, setStatusData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('http://localhost:3001/status', {
        headers: {
          'Authorization': token,
          'sessionId': sessionId,
        },
      });
      const data = await response.json();
      setStatusData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="status-card">
      <h3>System Status</h3>
      <p>Operational Mode: {statusData.operationalMode}</p>
      <p>Overall Status: {statusData.overallStatus}</p>
      <p>Active Alerts: {statusData.activeAlerts}</p>
      <p>Power Consumption: {statusData.powerConsumption} kW</p>
      <p>Cooling Capacity: {statusData.coolingCapacity} kW</p>
      <p>Efficiency: {statusData.efficiency} COP</p>
    </div>
  );
}

export default StatusCard;
