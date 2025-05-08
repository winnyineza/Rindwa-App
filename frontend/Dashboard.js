import React, { useState, useEffect } from 'react';
import StatusCard from './components/StatusCard';
import AlertsSection from './components/AlertsSection';
import MetricsCard from './components/MetricsCard';
import Map from './components/Map';

function Dashboard() {
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

    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = event => {
      console.log(`Received message: ${event.data}`);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
  }, []);

  return (
    <div>
      <h1>System Dashboard</h1>
      <div className="system-overview">
        <h2>System Overview</h2>
        <p>Operational Mode: {statusData.operationalMode}</p>
        <p>Overall Status: {statusData.overallStatus}</p>
        <p>Active Alerts: {statusData.activeAlerts}</p>
        <p>Power Consumption: {statusData.powerConsumption} kW</p>
        <p>Cooling Capacity: {statusData.coolingCapacity} kW</p>
        <p>Efficiency: {statusData.efficiency} COP</p>
      </div>
      <StatusCard />
      <AlertsSection />
      <MetricsCard />
      <Map />
      {/* Real-time charts */}
      {/* Weather conditions widget */}
    </div>
  );
}

export default Dashboard;
