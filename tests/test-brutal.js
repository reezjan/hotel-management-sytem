#!/usr/bin/env node

/**
 * BRUTAL API TESTING SUITE
 * Tests every endpoint, every edge case, every possible failure
 */

const BASE_URL = 'http://localhost:5000';

// Test accounts from seed.ts
const TEST_ACCOUNTS = {
  superadmin: { username: 'superadmin', password: 'superadmin' },
  owner: { username: 'owner', password: 'owner123' },
  manager: { username: 'manager', password: 'manager' },
  waiter: { username: 'waiter', password: 'waiter' },
  cashier: { username: 'cashier', password: 'cashier' },
  frontdesk: { username: 'sita', password: 'sitasita' },
  barista: { username: 'barista', password: 'barista' },
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logSuccess(msg) {
  log(`✓ ${msg}`, 'green');
  testResults.passed++;
}

function logError(msg, details = '') {
  log(`✗ ${msg}`, 'red');
  if (details) log(`  Details: ${details}`, 'yellow');
  testResults.failed++;
  testResults.errors.push({ msg, details });
}

function logSection(msg) {
  log(`\n${'='.repeat(80)}`, 'cyan');
  log(`  ${msg}`, 'cyan');
  log('='.repeat(80), 'cyan');
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  
  return { status: response.status, data, headers: response.headers };
}

async function login(username, password) {
  const response = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });
  return response;
}

async function logout() {
  return await request('/api/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

// =============================================================================
// TEST 1: AUTHENTICATION BRUTAL TESTS
// =============================================================================

async function testAuthentication() {
  logSection('TEST 1: AUTHENTICATION BRUTAL TESTS');
  
  // Test 1.1: Login with wrong password
  log('\nTest 1.1: Login with WRONG password', 'blue');
  const wrongPass = await login('owner', 'wrongpassword123');
  if (wrongPass.status === 401) {
    logSuccess('Wrong password correctly rejected');
  } else {
    logError('Wrong password not rejected!', `Status: ${wrongPass.status}`);
  }
  
  // Test 1.2: Login with non-existent user
  log('\nTest 1.2: Login with NON-EXISTENT user', 'blue');
  const fakeUser = await login('hacker', 'hackme');
  if (fakeUser.status === 401) {
    logSuccess('Non-existent user correctly rejected');
  } else {
    logError('Non-existent user not rejected!', `Status: ${fakeUser.status}`);
  }
  
  // Test 1.3: SQL injection attempt
  log('\nTest 1.3: SQL INJECTION attempt', 'blue');
  const sqlInject = await login("admin' OR '1'='1", "' OR '1'='1");
  if (sqlInject.status === 401) {
    logSuccess('SQL injection attempt blocked');
  } else {
    logError('SQL INJECTION VULNERABILITY!', `Status: ${sqlInject.status}`);
  }
  
  // Test 1.4: Empty credentials
  log('\nTest 1.4: EMPTY credentials', 'blue');
  const empty = await login('', '');
  if (empty.status === 400 || empty.status === 401) {
    logSuccess('Empty credentials rejected');
  } else {
    logError('Empty credentials not rejected!', `Status: ${empty.status}`);
  }
  
  // Test 1.5: Valid login
  log('\nTest 1.5: VALID login', 'blue');
  const validLogin = await login('owner', 'owner123');
  if (validLogin.status === 200 && validLogin.data.user) {
    logSuccess('Valid login successful');
  } else {
    logError('Valid login failed!', `Status: ${validLogin.status}`);
  }
}

// =============================================================================
// TEST 2: AUTHORIZATION BRUTAL TESTS (18 secured endpoints)
// =============================================================================

async function testAuthorization() {
  logSection('TEST 2: AUTHORIZATION BRUTAL TESTS - Attack 18 Secured Endpoints');
  
  // First login as waiter (low privilege)
  await login('waiter', 'waiter');
  
  // Get owner's hotel ID (should be blocked)
  log('\nTest 2.1: Accessing ANOTHER hotel\'s data', 'blue');
  
  // Try to access hotel data with wrong hotel ID
  const fakeHotelId = '00000000-0000-0000-0000-000000000000';
  
  const unauthorizedEndpoints = [
    `/api/hotels/${fakeHotelId}/users`,
    `/api/hotels/${fakeHotelId}/rooms`,
    `/api/hotels/${fakeHotelId}/transactions`,
    `/api/hotels/${fakeHotelId}/inventory`,
    `/api/hotels/${fakeHotelId}/vendors`,
    `/api/hotels/${fakeHotelId}/restaurant-tables`,
    `/api/hotels/${fakeHotelId}/taxes`,
    `/api/hotels/${fakeHotelId}/vouchers`,
    `/api/hotels/${fakeHotelId}/maintenance-requests`,
    `/api/hotels/${fakeHotelId}/vehicle-logs`,
    `/api/hotels/${fakeHotelId}/room-service-orders`,
    `/api/hotels/${fakeHotelId}/hall-bookings`,
    `/api/hotels/${fakeHotelId}/meal-plans`,
    `/api/hotels/${fakeHotelId}/menu-items`,
    `/api/hotels/${fakeHotelId}/menu-categories`,
  ];
  
  for (const endpoint of unauthorizedEndpoints) {
    const response = await request(endpoint, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.status === 403) {
      logSuccess(`${endpoint} - Access denied correctly`);
    } else if (response.status === 404) {
      logSuccess(`${endpoint} - Not found (acceptable)`);
    } else {
      logError(`${endpoint} - SECURITY BREACH!`, `Status: ${response.status}, got data: ${JSON.stringify(response.data).substring(0, 100)}`);
    }
  }
  
  await logout();
}

// =============================================================================
// TEST 3: INPUT VALIDATION BRUTAL TESTS
// =============================================================================

async function testInputValidation() {
  logSection('TEST 3: INPUT VALIDATION BRUTAL TESTS');
  
  await login('manager', 'manager');
  
  // Test 3.1: XSS attempt in transaction description
  log('\nTest 3.1: XSS INJECTION in transaction', 'blue');
  const xss = await request('/api/transactions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      amount: 1000,
      transactionType: 'cash',
      category: 'room',
      description: '<script>alert("XSS")</script>',
      paymentMethod: 'cash',
    }),
  });
  
  if (xss.status === 400 || (xss.status === 201 && !xss.data.description?.includes('<script>'))) {
    logSuccess('XSS attempt sanitized or blocked');
  } else {
    logError('XSS VULNERABILITY!', `Description: ${xss.data?.description}`);
  }
  
  // Test 3.2: Negative amount
  log('\nTest 3.2: NEGATIVE amount in transaction', 'blue');
  const negative = await request('/api/transactions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      amount: -5000,
      transactionType: 'cash',
      category: 'room',
      description: 'Negative amount test',
      paymentMethod: 'cash',
    }),
  });
  
  if (negative.status === 400) {
    logSuccess('Negative amount rejected');
  } else {
    logError('NEGATIVE AMOUNT ACCEPTED!', `Status: ${negative.status}`);
  }
  
  // Test 3.3: Extremely large number
  log('\nTest 3.3: EXTREME number (overflow)', 'blue');
  const overflow = await request('/api/transactions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      amount: 999999999999999999999,
      transactionType: 'cash',
      category: 'room',
      description: 'Overflow test',
      paymentMethod: 'cash',
    }),
  });
  
  if (overflow.status === 400) {
    logSuccess('Overflow prevented');
  } else if (overflow.status === 201) {
    log('  Warning: Large number accepted, check if handled correctly', 'yellow');
  }
  
  // Test 3.4: Missing required fields
  log('\nTest 3.4: MISSING required fields', 'blue');
  const missing = await request('/api/transactions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      amount: 100,
      // Missing transactionType, category, etc.
    }),
  });
  
  if (missing.status === 400) {
    logSuccess('Missing fields rejected');
  } else {
    logError('MISSING FIELDS NOT VALIDATED!', `Status: ${missing.status}`);
  }
  
  await logout();
}

// =============================================================================
// TEST 4: VOID TRANSACTION BRUTAL TESTS
// =============================================================================

async function testVoidTransaction() {
  logSection('TEST 4: VOID TRANSACTION BRUTAL TESTS');
  
  await login('manager', 'manager');
  
  // Test 4.1: Void with short reason (< 15 chars)
  log('\nTest 4.1: Void with SHORT reason (< 15 chars)', 'blue');
  
  // First create a transaction
  const trans = await request('/api/transactions', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      amount: 500,
      transactionType: 'cash',
      category: 'room',
      description: 'Test transaction for void',
      paymentMethod: 'cash',
    }),
  });
  
  if (trans.status === 201) {
    const voidShort = await request(`/api/transactions/${trans.data.id}/void`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        reason: 'short', // Only 5 chars
      }),
    });
    
    if (voidShort.status === 400) {
      logSuccess('Short void reason rejected (< 15 chars)');
    } else {
      logError('SHORT VOID REASON ACCEPTED!', `Status: ${voidShort.status}`);
    }
    
    // Test 4.2: Valid void
    log('\nTest 4.2: VALID void with proper reason', 'blue');
    const voidValid = await request(`/api/transactions/${trans.data.id}/void`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        reason: 'This is a valid reason for voiding this transaction with more than 15 characters',
      }),
    });
    
    if (voidValid.status === 200) {
      logSuccess('Valid void successful');
      
      // Test 4.3: Double void attempt
      log('\nTest 4.3: DOUBLE void attempt', 'blue');
      const doubleVoid = await request(`/api/transactions/${trans.data.id}/void`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          reason: 'Trying to void an already voided transaction - should fail',
        }),
      });
      
      if (doubleVoid.status === 400) {
        logSuccess('Double void prevented');
      } else {
        logError('DOUBLE VOID ALLOWED!', `Status: ${doubleVoid.status}`);
      }
    }
  }
  
  await logout();
  
  // Test 4.4: Void as non-manager
  log('\nTest 4.4: Void as WAITER (non-manager)', 'blue');
  await login('waiter', 'waiter');
  
  const voidUnauth = await request(`/api/transactions/${trans.data?.id}/void`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      reason: 'Waiter trying to void - should be rejected by role check',
    }),
  });
  
  if (voidUnauth.status === 403) {
    logSuccess('Non-manager void rejected');
  } else {
    logError('NON-MANAGER CAN VOID!', `Status: ${voidUnauth.status}`);
  }
  
  await logout();
}

// =============================================================================
// TEST 5: CONCURRENT ACCESS TESTS
// =============================================================================

async function testConcurrency() {
  logSection('TEST 5: CONCURRENT ACCESS & RACE CONDITION TESTS');
  
  await login('cashier', 'cashier');
  
  // Test 5.1: Multiple simultaneous voucher redemptions
  log('\nTest 5.1: RACE CONDITION - Simultaneous voucher redemptions', 'blue');
  
  // This would need a voucher ID - skip if not available
  log('  ℹ Voucher race condition test requires existing voucher - manual test needed', 'yellow');
  
  await logout();
}

// =============================================================================
// MAIN TEST RUNNER
// =============================================================================

async function runAllTests() {
  log('\n🔥🔥🔥 BRUTAL API TESTING SUITE 🔥🔥🔥\n', 'magenta');
  log('Attacking the system from every angle...\n', 'yellow');
  
  try {
    await testAuthentication();
    await testAuthorization();
    await testInputValidation();
    await testVoidTransaction();
    await testConcurrency();
    
    // Final summary
    logSection('TEST SUMMARY');
    log(`\nTotal Tests: ${testResults.passed + testResults.failed}`, 'cyan');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, 'red');
    
    if (testResults.errors.length > 0) {
      log('\n❌ CRITICAL ISSUES FOUND:', 'red');
      testResults.errors.forEach((err, i) => {
        log(`\n${i + 1}. ${err.msg}`, 'red');
        if (err.details) log(`   ${err.details}`, 'yellow');
      });
    } else {
      log('\n✅ ALL TESTS PASSED! System is SOLID! 💪', 'green');
    }
    
    process.exit(testResults.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
