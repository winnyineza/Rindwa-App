#!/usr/bin/env node

const axios = require('axios');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkService(name, url, expectedStatus = 200) {
  return new Promise((resolve) => {
    axios.get(url, { timeout: 5000 })
      .then(response => {
        if (response.status === expectedStatus) {
          log(`✅ ${name} is running`, 'green');
          resolve(true);
        } else {
          log(`❌ ${name} returned status ${response.status}`, 'red');
          resolve(false);
        }
      })
      .catch(error => {
        log(`❌ ${name} is not accessible: ${error.message}`, 'red');
        resolve(false);
      });
  });
}

function checkDatabase() {
  return new Promise((resolve) => {
    try {
      // Check if PostgreSQL is running
      execSync('docker-compose ps postgres', { stdio: 'pipe' });
      log('✅ PostgreSQL container is running', 'green');
      resolve(true);
    } catch (error) {
      log('❌ PostgreSQL container is not running', 'red');
      resolve(false);
    }
  });
}

function checkDependencies() {
  const requiredDirs = ['frontend', 'backend', 'admin-dashboard'];
  const results = [];
  
  requiredDirs.forEach(dir => {
    try {
      const packageJson = require(`../${dir}/package.json`);
      log(`✅ ${dir} dependencies found`, 'green');
      results.push(true);
    } catch (error) {
      log(`❌ ${dir} package.json not found`, 'red');
      results.push(false);
    }
  });
  
  return results.every(result => result);
}

async function main() {
  log('🔍 Rindwa App Health Check', 'bold');
  log('========================', 'blue');
  
  // Check dependencies
  log('\n📦 Checking Dependencies...', 'blue');
  const depsOk = checkDependencies();
  
  // Check database
  log('\n🗄️  Checking Database...', 'blue');
  const dbOk = await checkDatabase();
  
  // Check services
  log('\n🌐 Checking Services...', 'blue');
  const services = [
    { name: 'Backend API', url: 'http://localhost:3000/api/health' },
    { name: 'Admin Dashboard', url: 'http://localhost:3001' },
    { name: 'Nginx Proxy', url: 'http://localhost:80' }
  ];
  
  const serviceResults = await Promise.all(
    services.map(service => checkService(service.name, service.url))
  );
  
  // Summary
  log('\n📊 Health Check Summary', 'bold');
  log('========================', 'blue');
  
  const allServicesOk = serviceResults.every(result => result);
  const overallStatus = depsOk && dbOk && allServicesOk;
  
  if (overallStatus) {
    log('🎉 All systems are operational!', 'green');
    log('Your Rindwa App is ready to use.', 'green');
  } else {
    log('⚠️  Some issues detected. Please check the errors above.', 'yellow');
    log('Refer to DEPLOYMENT.md for troubleshooting steps.', 'yellow');
  }
  
  // Recommendations
  log('\n💡 Next Steps:', 'blue');
  log('1. Start the Expo development server: cd frontend && npm start', 'reset');
  log('2. Access the admin dashboard at http://localhost:3001', 'reset');
  log('3. Test the API endpoints using the documentation', 'reset');
  log('4. Set up monitoring and analytics as needed', 'reset');
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Health check failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main }; 