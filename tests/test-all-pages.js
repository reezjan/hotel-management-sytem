#!/usr/bin/env node

import http from 'http';

const BASE_URL = 'http://localhost:5000';

// Helper to make API requests
async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Store session cookie
let sessionCookie = '';

async function login(username, password) {
  console.log(`\n🔐 Logging in as ${username}...`);
  const res = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (res.status === 200 && res.headers['set-cookie']) {
    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
    console.log(`✅ Logged in successfully`);
    return res.data;
  }
  console.log(`❌ Login failed: ${res.status}`);
  return null;
}

async function testAPI(endpoint, description) {
  const res = await request(endpoint, {
    headers: { 'Cookie': sessionCookie }
  });
  
  const status = res.status === 200 ? '✅' : '❌';
  console.log(`${status} ${description}: ${endpoint} (${res.status})`);
  
  if (res.status === 200 && res.data) {
    const dataLength = Array.isArray(res.data) ? res.data.length : 'object';
    console.log(`   📊 Data: ${dataLength} items`);
  }
  
  return res;
}

async function runTests() {
  console.log('🧪 COMPREHENSIVE PAGE TEST - Hotel Management System\n');
  console.log('='.repeat(60));
  
  // Test Finance Role
  console.log('\n📊 TESTING FINANCE ROLE');
  console.log('-'.repeat(60));
  
  const financeUser = await login('finance', 'finance');
  if (financeUser) {
    console.log(`   User ID: ${financeUser.id}`);
    console.log(`   Hotel ID: ${financeUser.hotelId || 'MISSING!'}`);
    console.log(`   Role: ${financeUser.role?.name || 'MISSING!'}`);
    
    await testAPI('/api/hotels/current/transactions', 'Fetch Transactions');
    await testAPI('/api/hotels/current/maintenance-requests', 'Fetch Maintenance Requests');
    await testAPI('/api/hotels/current/vendors', 'Fetch Vendors');
    await testAPI('/api/halls', 'Fetch Halls');
  }
  
  // Test Manager Role
  console.log('\n👔 TESTING MANAGER ROLE');
  console.log('-'.repeat(60));
  
  const managerUser = await login('manager', 'manager');
  if (managerUser) {
    console.log(`   User ID: ${managerUser.id}`);
    console.log(`   Hotel ID: ${managerUser.hotelId || 'MISSING!'}`);
    console.log(`   Role: ${managerUser.role?.name || 'MISSING!'}`);
    
    await testAPI('/api/hotels/current/users', 'Fetch Staff');
    await testAPI('/api/hotels/current/transactions', 'Fetch Transactions');
    await testAPI('/api/hotels/current/vendors', 'Fetch Vendors');
    await testAPI('/api/hotels/current/guests', 'Fetch Guests');
  }
  
  // Test Owner Role
  console.log('\n👑 TESTING OWNER ROLE');
  console.log('-'.repeat(60));
  
  const ownerUser = await login('owner', 'owner123');
  if (ownerUser) {
    console.log(`   User ID: ${ownerUser.id}`);
    console.log(`   Hotel ID: ${ownerUser.hotelId || 'MISSING!'}`);
    console.log(`   Role: ${ownerUser.role?.name || 'MISSING!'}`);
    
    await testAPI('/api/hotels/current/transactions', 'Fetch Transactions');
    await testAPI('/api/hotels/current/rooms', 'Fetch Rooms');
    await testAPI('/api/hotels/current/users', 'Fetch Users');
    await testAPI('/api/hotels/current/inventory-items', 'Fetch Inventory');
  }
  
  // Test Storekeeper Role
  console.log('\n📦 TESTING STOREKEEPER ROLE');
  console.log('-'.repeat(60));
  
  const storekeeperUser = await login('storekeeper', 'storekeeper');
  if (storekeeperUser) {
    console.log(`   User ID: ${storekeeperUser.id}`);
    console.log(`   Hotel ID: ${storekeeperUser.hotelId || 'MISSING!'}`);
    console.log(`   Role: ${storekeeperUser.role?.name || 'MISSING!'}`);
    
    await testAPI('/api/hotels/current/inventory-items', 'Fetch Inventory');
    await testAPI('/api/hotels/current/stock-requests', 'Fetch Stock Requests');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Test Complete!\n');
}

runTests().catch(console.error);
