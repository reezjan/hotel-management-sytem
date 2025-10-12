#!/usr/bin/env node

/**
 * BRUTAL API TESTING SUITE V2
 * Fixed cookie/session handling
 */

const BASE_URL = 'http://localhost:5000';

let cookies = '';
let testResults = { passed: 0, failed: 0, errors: [] };

const colors = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m', magenta: '\x1b[35m',
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
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (cookies) {
    headers['Cookie'] = cookies;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Store cookies from response
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookies = setCookie.split(';')[0];
  }
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  
  return { status: response.status, data };
}

async function login(username, password) {
  const response = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return response;
}

async function logout() {
  const res = await request('/api/logout', { method: 'POST' });
  cookies = ''; // Clear cookies
  return res;
}

// =============================================================================
// BRUTAL TESTS
// =============================================================================

async function runTests() {
  log('\n🔥🔥🔥 BRUTAL API TESTING SUITE V2 🔥🔥🔥\n', 'magenta');
  
  // ===== TEST 1: Authentication Attacks =====
  logSection('TEST 1: AUTHENTICATION ATTACKS');
  
  log('\n[1.1] SQL Injection in login', 'blue');
  const sql = await login("admin' OR '1'='1", "anything");
  (sql.status === 401) ? logSuccess('SQL injection blocked') : logError('SQL INJECTION POSSIBLE!', JSON.stringify(sql));
  
  log('\n[1.2] XSS in username', 'blue');
  const xss = await login("<script>alert('xss')</script>", "test");
  (xss.status === 401) ? logSuccess('XSS in username blocked') : logError('XSS ACCEPTED!', JSON.stringify(xss));
  
  log('\n[1.3] Null bytes', 'blue');
  const nullbyte = await login("admin\x00", "test\x00");
  (nullbyte.status === 401) ? logSuccess('Null bytes blocked') : logError('NULL BYTES ACCEPTED!');
  
  log('\n[1.4] Valid login', 'blue');
  const valid = await login('manager', 'manager');
  if (valid.status === 200 && valid.data?.user) {
    logSuccess(`Logged in as ${valid.data.user.username}`);
  } else {
    logError('Valid login failed!', JSON.stringify(valid));
  }
  
  // ===== TEST 2: Authorization Bypass =====
  logSection('TEST 2: AUTHORIZATION BYPASS ATTACKS');
  
  log('\n[2.1] Access another hotel\'s data', 'blue');
  const fakeId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const bypass = await request(`/api/hotels/${fakeId}/users`, { method: 'GET' });
  (bypass.status === 403 || bypass.status === 404) ? 
    logSuccess('Cross-hotel access blocked') : 
    logError('AUTHORIZATION BYPASS!', `Status: ${bypass.status}, Data: ${JSON.stringify(bypass.data)?.substring(0,100)}`);
  
  // ===== TEST 3: Input Validation =====
  logSection('TEST 3: INPUT VALIDATION ATTACKS');
  
  log('\n[3.1] Negative transaction amount', 'blue');
  const neg = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: -999999,
      transactionType: 'cash',
      category: 'room',
      description: 'Negative',
      paymentMethod: 'cash',
    }),
  });
  (neg.status === 400) ? logSuccess('Negative amount blocked') : 
    logError('NEGATIVE AMOUNT ACCEPTED!', `Status: ${neg.status}`);
  
  log('\n[3.2] Massive number (overflow)', 'blue');
  const overflow = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 9999999999999999999999999999,
      transactionType: 'cash',
      category: 'room',
      description: 'Overflow',
      paymentMethod: 'cash',
    }),
  });
  (overflow.status === 400) ? logSuccess('Overflow prevented') : 
    log(`  ⚠ Warning: Large number handled with status ${overflow.status}`, 'yellow');
  
  log('\n[3.3] XSS in description', 'blue');
  const xssDesc = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 100,
      transactionType: 'cash',
      category: 'room',
      description: '<script>alert("XSS")</script><img src=x onerror=alert(1)>',
      paymentMethod: 'cash',
    }),
  });
  if (xssDesc.status === 201) {
    const hasScript = xssDesc.data?.description?.includes('<script>');
    hasScript ? logError('XSS NOT SANITIZED!', xssDesc.data.description) : 
      logSuccess('XSS sanitized or encoded');
  } else {
    log(`  ℹ Transaction creation failed: ${xssDesc.status}`, 'yellow');
  }
  
  log('\n[3.4] SQL injection in description', 'blue');
  const sqlDesc = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 100,
      transactionType: 'cash',
      category: 'room',
      description: "'; DROP TABLE transactions; --",
      paymentMethod: 'cash',
    }),
  });
  (sqlDesc.status >= 200 && sqlDesc.status < 300) ? 
    logSuccess('SQL in description handled (using ORM)') : 
    log(`  ℹ Status: ${sqlDesc.status}`, 'yellow');
  
  // ===== TEST 4: Void Transaction Rules =====
  logSection('TEST 4: VOID TRANSACTION RULES');
  
  log('\n[4.1] Create transaction to void', 'blue');
  const trans = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 500,
      transactionType: 'cash',
      category: 'test',
      description: 'Test void transaction',
      paymentMethod: 'cash',
    }),
  });
  
  if (trans.status === 201 && trans.data?.id) {
    logSuccess(`Transaction created: ${trans.data.id}`);
    
    log('\n[4.2] Void with SHORT reason (should fail)', 'blue');
    const shortVoid = await request(`/api/transactions/${trans.data.id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'short' }),
    });
    (shortVoid.status === 400) ? logSuccess('Short reason rejected') : 
      logError('SHORT REASON ACCEPTED!', `Status: ${shortVoid.status}`);
    
    log('\n[4.3] Void with valid reason', 'blue');
    const validVoid = await request(`/api/transactions/${trans.data.id}/void`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Valid void reason with more than fifteen characters required' }),
    });
    (validVoid.status === 200) ? logSuccess('Transaction voided') : 
      logError('VOID FAILED!', `Status: ${validVoid.status}`);
    
    if (validVoid.status === 200) {
      log('\n[4.4] Double void (should fail)', 'blue');
      const doubleVoid = await request(`/api/transactions/${trans.data.id}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Trying to void already voided transaction here' }),
      });
      (doubleVoid.status === 400) ? logSuccess('Double void prevented') : 
        logError('DOUBLE VOID ALLOWED!', `Status: ${doubleVoid.status}`);
    }
  } else {
    log(`  ⚠ Could not create test transaction: ${trans.status}`, 'yellow');
  }
  
  await logout();
  
  log('\n[4.5] Void as non-manager (waiter)', 'blue');
  await login('waiter', 'waiter');
  const transId = trans.data?.id || 'fake-id';
  const noAuth = await request(`/api/transactions/${transId}/void`, {
    method: 'POST',
    body: JSON.stringify({ reason: 'Waiter attempting void - should fail due to role' }),
  });
  (noAuth.status === 403) ? logSuccess('Non-manager void blocked') : 
    logError('NON-MANAGER CAN VOID!', `Status: ${noAuth.status}`);
  
  await logout();
  
  // ===== TEST 5: API Rate & Edge Cases =====
  logSection('TEST 5: EDGE CASES & STRESS');
  
  await login('manager', 'manager');
  
  log('\n[5.1] Empty string in amount', 'blue');
  const empty = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: '',
      transactionType: 'cash',
      category: 'room',
      description: 'Empty amount',
      paymentMethod: 'cash',
    }),
  });
  (empty.status === 400) ? logSuccess('Empty amount rejected') : 
    logError('EMPTY AMOUNT ACCEPTED!', `Status: ${empty.status}`);
  
  log('\n[5.2] String in amount', 'blue');
  const stringAmt = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 'hacker',
      transactionType: 'cash',
      category: 'room',
      description: 'String amount',
      paymentMethod: 'cash',
    }),
  });
  (stringAmt.status === 400) ? logSuccess('String amount rejected') : 
    logError('STRING AMOUNT ACCEPTED!', `Status: ${stringAmt.status}`);
  
  log('\n[5.3] Missing required fields', 'blue');
  const missing = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({ amount: 100 }),
  });
  (missing.status === 400) ? logSuccess('Missing fields rejected') : 
    logError('MISSING FIELDS ACCEPTED!', `Status: ${missing.status}`);
  
  log('\n[5.4] Invalid transaction type', 'blue');
  const invalidType = await request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({
      amount: 100,
      transactionType: 'hacked',
      category: 'room',
      description: 'Invalid type',
      paymentMethod: 'cash',
    }),
  });
  (invalidType.status === 400) ? logSuccess('Invalid type rejected') : 
    logError('INVALID TYPE ACCEPTED!', `Status: ${invalidType.status}`);
  
  await logout();
  
  // ===== SUMMARY =====
  logSection('TEST SUMMARY');
  const total = testResults.passed + testResults.failed;
  log(`\nTotal: ${total} | Passed: ${testResults.passed} | Failed: ${testResults.failed}`, 'cyan');
  
  if (testResults.failed > 0) {
    log('\n❌ CRITICAL ISSUES:', 'red');
    testResults.errors.forEach((err, i) => {
      log(`\n${i+1}. ${err.msg}`, 'red');
      if (err.details) log(`   ${err.details}`, 'yellow');
    });
    process.exit(1);
  } else {
    log('\n✅ ALL TESTS PASSED! System is ROCK SOLID! 💪', 'green');
    process.exit(0);
  }
}

runTests().catch(err => {
  log(`\n💥 FATAL: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
