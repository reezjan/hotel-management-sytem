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
  const res = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  if (res.status === 200 && res.headers['set-cookie']) {
    sessionCookie = res.headers['set-cookie'][0].split(';')[0];
    return res.data;
  }
  return null;
}

async function testEndpoint(method, endpoint, data, description) {
  const res = await request(endpoint, {
    method,
    headers: { 'Cookie': sessionCookie },
    body: data ? JSON.stringify(data) : undefined
  });
  
  const success = res.status >= 200 && res.status < 300;
  const status = success ? '✅' : '❌';
  console.log(`${status} ${description}: ${method} ${endpoint} (${res.status})`);
  
  if (!success && res.data) {
    console.log(`   ⚠️  Error: ${JSON.stringify(res.data).substring(0, 100)}`);
  }
  
  return res;
}

async function checkBusinessLogic() {
  console.log('\n🔍 CHECKING BUSINESS LOGIC LOOPS & ISSUES\n');
  console.log('='.repeat(60));
  
  // Login as manager
  const manager = await login('manager', 'manager');
  if (!manager) {
    console.log('❌ Cannot test - manager login failed');
    return;
  }
  
  console.log('\n📝 TEST 1: Vendor Payment Creation & Void');
  console.log('-'.repeat(60));
  
  // Test vendor payment creation
  const vendorPayment = await testEndpoint('POST', '/api/transactions', {
    hotelId: manager.hotelId,
    txnType: 'vendor_payment',
    amount: '100.00',
    currency: 'NPR',
    paymentMethod: 'cash',
    purpose: 'Test vendor payment',
    reference: 'TEST-REF-001',
    createdBy: manager.id
  }, 'Create vendor payment');
  
  // Check if payment was created successfully
  if (vendorPayment.status === 201) {
    // Try to void with short reason (should fail)
    await testEndpoint('POST', `/api/transactions/${vendorPayment.data.id}/void`, {
      reason: 'short'
    }, 'Void with short reason (should fail)');
    
    // Void with proper reason (should succeed)
    await testEndpoint('POST', `/api/transactions/${vendorPayment.data.id}/void`, {
      reason: 'This is a test void with proper reason length'
    }, 'Void with proper reason (should succeed)');
  }
  
  console.log('\n📝 TEST 2: Cash Deposit Request Loop Check');
  console.log('-'.repeat(60));
  
  // Create cash deposit request
  const cashDeposit = await testEndpoint('POST', '/api/transactions', {
    hotelId: manager.hotelId,
    txnType: 'cash_deposit_request',
    amount: '500.00',
    currency: 'NPR',
    paymentMethod: 'cash',
    purpose: 'Cash deposit to bank',
    reference: 'DEPOSIT-TEST-001',
    createdBy: manager.id
  }, 'Create cash deposit request');
  
  // Login as finance to approve
  const finance = await login('finance', 'finance');
  if (finance && cashDeposit.status === 201) {
    // Approve cash deposit
    await testEndpoint('PUT', `/api/transactions/${cashDeposit.data.id}`, {
      reference: `${cashDeposit.data.reference} - APPROVED by ${finance.username}`
    }, 'Approve cash deposit request');
    
    // Try to approve again (check for double-approval loop)
    await testEndpoint('PUT', `/api/transactions/${cashDeposit.data.id}`, {
      reference: `${cashDeposit.data.reference} - APPROVED by ${finance.username} - APPROVED by ${finance.username}`
    }, 'Try double-approval (business logic check)');
  }
  
  console.log('\n📝 TEST 3: User Creation & Deletion Loop');
  console.log('-'.repeat(60));
  
  // Create test user
  const newUser = await testEndpoint('POST', '/api/users', {
    username: 'test_temp_user_' + Date.now(),
    password: 'test123456',
    email: 'test@example.com',
    phone: '1234567890',
    fullName: 'Test User',
    address: 'Test Address',
    roleId: 11, // waiter role
    hotelId: manager.hotelId
  }, 'Create test user');
  
  if (newUser.status === 201) {
    // Delete the user
    await testEndpoint('DELETE', `/api/users/${newUser.data.id}`, null, 'Delete test user');
    
    // Try to delete again (should fail)
    await testEndpoint('DELETE', `/api/users/${newUser.data.id}`, null, 'Try to delete non-existent user (should fail)');
  }
  
  console.log('\n📝 TEST 4: Room Status Loop Check');
  console.log('-'.repeat(60));
  
  // Get first room
  const roomsRes = await request('/api/hotels/current/rooms', {
    headers: { 'Cookie': sessionCookie }
  });
  
  if (roomsRes.data && roomsRes.data.length > 0) {
    const room = roomsRes.data[0];
    
    // Try to update room status multiple times
    await testEndpoint('PATCH', `/api/hotels/${manager.hotelId}/rooms/${room.id}/status`, {
      status: 'clean'
    }, 'Update room to clean');
    
    await testEndpoint('PATCH', `/api/hotels/${manager.hotelId}/rooms/${room.id}/status`, {
      status: 'dirty'
    }, 'Update room to dirty');
    
    await testEndpoint('PATCH', `/api/hotels/${manager.hotelId}/rooms/${room.id}/status`, {
      status: 'maintenance'
    }, 'Update room to maintenance');
  }
  
  console.log('\n📝 TEST 5: Inventory Stock Update Loop');
  console.log('-'.repeat(60));
  
  // Login as owner
  const owner = await login('owner', 'owner123');
  if (owner) {
    // Create test inventory item
    const inventory = await testEndpoint('POST', '/api/hotels/current/inventory-items', {
      name: 'Test Item ' + Date.now(),
      sku: 'TEST-' + Date.now(),
      baseUnit: 'kg',
      baseStockQty: '10.000',
      reorderLevel: '5.000',
      costPerUnit: '100.00'
    }, 'Create test inventory item');
    
    if (inventory.status === 201) {
      // Update stock multiple times
      await testEndpoint('PUT', `/api/hotels/current/inventory-items/${inventory.data.id}`, {
        baseStockQty: '20.000'
      }, 'Increase inventory stock');
      
      await testEndpoint('PUT', `/api/hotels/current/inventory-items/${inventory.data.id}`, {
        baseStockQty: '5.000'
      }, 'Decrease inventory stock');
      
      await testEndpoint('PUT', `/api/hotels/current/inventory-items/${inventory.data.id}`, {
        baseStockQty: '0.000'
      }, 'Set inventory to zero');
      
      // Delete test item
      await testEndpoint('DELETE', `/api/hotels/current/inventory-items/${inventory.data.id}`, null, 'Delete test inventory item');
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Business Logic Test Complete!\n');
}

checkBusinessLogic().catch(console.error);
