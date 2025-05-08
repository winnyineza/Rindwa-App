import React, { useState, useEffect } from 'react';
import StatusCard from './components/StatusCard';
import AlertsSection from './components/AlertsSection';
import MetricsCard from './components/MetricsCard';
import Map from './components/Map';
import WeatherWidget from './components/WeatherWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Dashboard() {
  const [statusData, setStatusData] = useState({});
  const [userRole, setUserRole] = useState('');
  const [manualControl, setManualControl] = useState({
    operationalMode: '',
    setpointAdjustment: 0,
    equipmentStatus: '',
  });

  const data = [
    { name: '00:00', uv: 4000, pv: 2400, amt: 2400 },
    { name: '03:00', uv: 3000, pv: 1398, amt: 2210 },
    { name: '06:00', uv: 2000, pv: 9800, amt: 2290 },
    { name: '09:00', uv: 2780, pv: 3908, amt: 2000 },
    { name: '12:00', uv: 1890, pv: 4800, amt: 2181 },
    { name: '15:00', uv: 2390, pv: 3800, amt: 2500 },
    { name: '18:00', uv: 3490, pv: 4300, amt: 2100 },
  ];

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

    setUserRole(localStorage.getItem('role'));
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
      {userRole === 'admin' && <StatusCard />}
      <AlertsSection />
      <MetricsCard />
      <Map />
      <WeatherWidget />
      <LineChart width={500} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pv" stroke="#8884d8" />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
      <h2>Manual Controls</h2>
      <div className="manual-controls">
        <label>
          Operational Mode:
          <select
            value={manualControl.operationalMode}
            onChange={(e) => setManualControl({ ...manualControl, operationalMode: e.target.value })}
          >
            <option value="">Select Mode</option>
            <option value="normal">Normal</option>
            <option value="eco">Eco</option>
            <option value="performance">Performance</option>
          </select>
        </label>
        <label>
          Setpoint Adjustment:
          <input
            type="number"
            value={manualControl.setpointAdjustment}
            onChange={(e) => setManualControl({ ...manualControl, setpointAdjustment: e.target.value })}
          />
        </label>
        <label>
          Equipment Status:
          <select
            value={manualControl.equipmentStatus}
            onChange={(e) => setManualControl({ ...manualControl, equipmentStatus: e.target.value })}
          >
            <option value="">Select Status</option>
            <option value="on">On</option>
            <option value="off">Off</option>
            <option value="standby">Standby</option>
          </select>
        </label>
        <button>Apply</button>
      </div>

      <h2>Advanced Controls</h2>
      <div className="advanced-controls">
        {/* Schedule Management */}
        <h3>Schedule Management</h3>
        <p>Here you can manage the system schedule.</p>

        {/* Parameter Tuning */}
        <h3>Parameter Tuning</h3>
        <p>Here you can tune various system parameters.</p>

        {/* Algorithm Status */}
        <h3>Algorithm Status</h3>
        <p>Here you can view the status of the algorithms.</p>

        {/* Model Training Controls */}
        <h3>Model Training Controls</h3>
        <p>Here you can control the model training process.</p>

        {/* Prediction Visualization */}
        <h3>Prediction Visualization</h3>
        <p>Here you can visualize the predictions.</p>
      </div>

      <h2>System Management</h2>
      <div className="system-management">
        {/* Optimization Results */}
        <h3>Optimization Results</h3>
        <p>Here you can view the optimization results.</p>

        {/* Learning Progress */}
        <h3>Learning Progress</h3>
        <p>Here you can track the learning progress.</p>

        {/* Algorithm Configuration */}
        <h3>Algorithm Configuration</h3>
        <p>Here you can configure the algorithms.</p>

        {/* Equipment Inventory */}
        <h3>Equipment Inventory</h3>
        <p>Here you can view the equipment inventory.</p>

        {/* Maintenance Scheduling */}
        <h3>Maintenance Scheduling</h3>
        <p>Here you can schedule maintenance.</p>

        {/* Component Performance */}
        <h3>Component Performance</h3>
        <p>Here you can view the component performance.</p>

        {/* Lifecycle Management */}
        <h3>Lifecycle Management</h3>
        <p>Here you can manage the lifecycle of the components.</p>
      </div>

      <h2>Support and Analysis</h2>
      <div className="support-and-analysis">
        {/* Documentation Access */}
        <h3>Documentation Access</h3>
        <p>Here you can access the system documentation.</p>

        {/* Spare Parts Management */}
        <h3>Spare Parts Management</h3>
        <p>Here you can manage spare parts.</p>

        {/* Alert Dashboard */}
        <h3>Alert Dashboard</h3>
        <p>Here you can view the alert dashboard.</p>

        {/* Diagnostic Tools */}
        <h3>Diagnostic Tools</h3>
        <p>Here you can use diagnostic tools.</p>

        {/* Root Cause Analysis */}
        <h3>Root Cause Analysis</h3>
        <p>Here you can perform root cause analysis.</p>

        {/* Resolution Tracking */}
        <h3>Resolution Tracking</h3>
        <p>Here you can track the resolution of issues.</p>

        {/* Historical Analysis */}
        <h3>Historical Analysis</h3>
        <p>Here you can perform historical analysis.</p>
      </div>

      <h2>Reporting and Analytics</h2>
      <div className="reporting-and-analytics">
        {/* Predictive Maintenance */}
        <h3>Predictive Maintenance</h3>
        <p>Here you can view predictive maintenance reports.</p>

        {/* Performance Reports */}
        <h3>Performance Reports</h3>
        <p>Here you can generate performance reports.</p>

        {/* Environmental Impact Analysis */}
        <h3>Environmental Impact Analysis</h3>
        <p>Here you can analyze the environmental impact.</p>

        {/* Comparative Benchmarking */}
        <h3>Comparative Benchmarking</h3>
        <p>Here you can perform comparative benchmarking.</p>

        {/* Cost Analysis */}
        <h3>Cost Analysis</h3>
        <p>Here you can analyze the costs.</p>

        {/* Custom Report Generation */}
        <h3>Custom Report Generation</h3>
        <p>Here you can generate custom reports.</p>

        {/* Export Functionality */}
        <h3>Export Functionality</h3>
        <p>Here you can export the data.</p>
      </div>

      <h2>Advanced Analytics and Modeling</h2>
      <div className="advanced-analytics-and-modeling">
        {/* System Simulation */}
        <h3>System Simulation</h3>
        <p>Here you can run system simulations.</p>

        {/* What-If Analysis */}
        <h3>What-If Analysis</h3>
        <p>Here you can perform what-if analysis.</p>

        {/* Parameter Sensitivity */}
        <h3>Parameter Sensitivity</h3>
        <p>Here you can analyze parameter sensitivity.</p>

        {/* Optimization Testing */}
        <h3>Optimization Testing</h3>
        <p>Here you can perform optimization testing.</p>

        {/* Weather Impact Modeling */}
        <h3>Weather Impact Modeling</h3>
        <p>Here you can model the impact of weather.</p>

        {/* Demand Variation Analysis */}
        <h3>Demand Variation Analysis</h3>
        <p>Here you can analyze demand variation.</p>

        {/* Building Connection Status */}
        <h3>Building Connection Status</h3>
        <p>Here you can view the building connection status.</p>
      </div>

      <h2>Building Management</h2>
      <div className="building-management">
        {/* Building-Level Controls */}
        <h3>Building-Level Controls</h3>
        <p>Here you can manage building-level controls.</p>

        {/* Thermal Comfort Feedback */}
        <h3>Thermal Comfort Feedback</h3>
        <p>Here you can view thermal comfort feedback.</p>

        {/* Building Energy Profile */}
        <h3>Building Energy Profile</h3>
        <p>Here you can view the building energy profile.</p>

        {/* Integration with BMS */}
        <h3>Integration with BMS</h3>
        <p>Here you can integrate with Building Management Systems (BMS).</p>

        {/* Tenant Reporting */}
        <h3>Tenant Reporting</h3>
        <p>Here you can generate tenant reports.</p>

        {/* User Management */}
        <h3>User Management</h3>
        <p>Here you can manage users.</p>
      </div>

      <h2>System Administration</h2>
      <div className="system-administration">
        {/* System Configuration */}
        <h3>System Configuration</h3>
        <p>Here you can configure the system.</p>

        {/* Database Management */}
        <h3>Database Management</h3>
        <p>Here you can manage the database.</p>

        {/* Security Administration */}
        <h3>Security Administration</h3>
        <p>Here you can administer security settings.</p>

        {/* Backup and Recovery */}
        <h3>Backup and Recovery</h3>
        <p>Here you can manage backups and recovery.</p>

        {/* Software Updates */}
        <h3>Software Updates</h3>
        <p>Here you can manage software updates.</p>

        {/* Mobile Application */}
        <h3>Mobile Application</h3>
        <p>Here you can access the mobile application.</p>
      </div>
    </div>
  );
}

export default Dashboard;
