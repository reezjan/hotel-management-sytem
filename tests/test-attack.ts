/**
 * BRUTAL ATTACK TEST SUITE
 * This script tests the application with malicious and edge case inputs
 */

const API_BASE = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

async function testLogin(username: string, password: string, testName: string) {
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log(`✓ ${testName}:`, response.status, data);
    return { response, data };
  } catch (error) {
    console.error(`✗ ${testName} CRASHED:`, error);
    return { error };
  }
}

async function testEndpoint(method: string, url: string, body: any, testName: string, session?: string) {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (session) headers['Cookie'] = session;
    
    const response = await fetch(`${API_BASE}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`✓ ${testName}:`, response.status, data);
    return { response, data };
  } catch (error) {
    console.error(`✗ ${testName} CRASHED:`, error);
    return { error };
  }
}

async function runAttacks() {
  console.log('🔥 STARTING BRUTAL ATTACK TEST SUITE 🔥\n');
  
  // ==================== LOGIN ATTACKS ====================
  console.log('=== ATTACKING LOGIN ENDPOINT ===\n');
  
  // 1. SQL Injection attacks
  await testLogin("admin'--", "password", "SQL Injection - Comment Out");
  await testLogin("admin' OR '1'='1", "password", "SQL Injection - Always True");
  await testLogin("admin' UNION SELECT * FROM users--", "password", "SQL Injection - UNION");
  await testLogin("'; DROP TABLE users;--", "password", "SQL Injection - DROP TABLE");
  
  // 2. XSS attacks
  await testLogin("<script>alert('XSS')</script>", "password", "XSS - Script Tag");
  await testLogin("javascript:alert(1)", "password", "XSS - Javascript Protocol");
  await testLogin("<img src=x onerror=alert(1)>", "password", "XSS - Image Tag");
  
  // 3. Null byte attack (should be sanitized)
  await testLogin("admin\x00", "password\x00", "Null Byte Attack");
  
  // 4. Extremely long inputs
  await testLogin("a".repeat(10000), "b".repeat(10000), "Extremely Long Input");
  
  // 5. Special characters
  await testLogin("admin\n\r\t", "pass\n\r\t", "Newline/Tab Characters");
  await testLogin("admin🔥💀👻", "password", "Emoji Characters");
  await testLogin("admin\u0000\u0001\u0002", "password", "Unicode Control Characters");
  
  // 6. Empty/missing fields
  await testLogin("", "", "Empty Credentials");
  await testLogin("   ", "   ", "Whitespace Only");
  
  // 7. Type confusion
  await testEndpoint('POST', '/api/login', { username: 123, password: 456 }, "Type Confusion - Numbers");
  await testEndpoint('POST', '/api/login', { username: null, password: null }, "Type Confusion - Null");
  await testEndpoint('POST', '/api/login', { username: {}, password: [] }, "Type Confusion - Objects");
  
  // 8. Valid login (for baseline)
  const validLogin = await testLogin("manager", "manager", "VALID LOGIN - Manager");
  
  // ==================== MAINTENANCE REQUEST ATTACKS ====================
  console.log('\n=== ATTACKING MAINTENANCE REQUESTS ===\n');
  
  // Try to create maintenance request without auth
  await testEndpoint('POST', '/api/maintenance-requests', {
    title: "Test",
    hotelId: "fake-id",
    reportedBy: "fake-id"
  }, "Maintenance - No Auth");
  
  // Try with invalid UUIDs
  await testEndpoint('PUT', '/api/maintenance-requests/not-a-uuid', {
    status: 'completed'
  }, "Maintenance - Invalid UUID");
  
  // Try to reassign without permission (if we had a session)
  await testEndpoint('PUT', '/api/maintenance-requests/00000000-0000-0000-0000-000000000000', {
    assignedTo: "fake-id"
  }, "Maintenance - Unauthorized Reassign");
  
  // ==================== USER MANAGEMENT ATTACKS ====================
  console.log('\n=== ATTACKING USER MANAGEMENT ===\n');
  
  // Try to access other hotel's users
  await testEndpoint('GET', '/api/hotels/00000000-0000-0000-0000-000000000000/users', null, "Users - Wrong Hotel ID");
  
  // Try to create user without auth
  await testEndpoint('POST', '/api/hotels/00000000-0000-0000-0000-000000000000/users', {
    username: "hacker",
    password: "123456"
  }, "Users - Create Without Auth");
  
  // ==================== FINANCIAL ATTACKS ====================
  console.log('\n=== ATTACKING FINANCIAL ENDPOINTS ===\n');
  
  // Try to void transaction without auth
  await testEndpoint('POST', '/api/transactions/00000000-0000-0000-0000-000000000000/void', {
    reason: "Hacking attempt"
  }, "Finance - Void Without Auth");
  
  // Try with short void reason
  await testEndpoint('POST', '/api/transactions/00000000-0000-0000-0000-000000000000/void', {
    reason: "short"
  }, "Finance - Short Void Reason");
  
  // Try negative amounts
  await testEndpoint('POST', '/api/hotels/current/transactions', {
    amount: -1000000,
    txnType: "expense"
  }, "Finance - Negative Amount");
  
  // Try massive numbers
  await testEndpoint('POST', '/api/hotels/current/transactions', {
    amount: 999999999999999999999999999999,
    txnType: "expense"
  }, "Finance - Massive Number");
  
  // ==================== ROOM RESERVATION ATTACKS ====================
  console.log('\n=== ATTACKING ROOM RESERVATIONS ===\n');
  
  // Try double booking
  await testEndpoint('POST', '/api/hotels/current/reservations', {
    roomId: 1,
    checkIn: "2025-01-01",
    checkOut: "2025-01-05"
  }, "Reservation - No Auth");
  
  // ==================== PRIVILEGE ESCALATION ATTACKS ====================
  console.log('\n=== ATTACKING AUTHORIZATION ===\n');
  
  // Try to access super admin endpoints
  await testEndpoint('GET', '/api/super-admin/hotels', null, "Auth - Super Admin Without Auth");
  
  // Try to deactivate self
  await testEndpoint('PATCH', '/api/hotels/00000000-0000-0000-0000-000000000000/users/fake-id', {
    isActive: false
  }, "Auth - Self Deactivation");
  
  // ==================== SESSION/COOKIE ATTACKS ====================
  console.log('\n=== ATTACKING SESSIONS ===\n');
  
  // Try with invalid session
  await testEndpoint('GET', '/api/user', null, "Session - Invalid Cookie", "connect.sid=fake-session");
  
  // Try session fixation
  await testEndpoint('POST', '/api/login', {
    username: "manager",
    password: "manager"
  }, "Session - Fixation Attempt", "connect.sid=attacker-session");
  
  console.log('\n🔥 ATTACK TEST SUITE COMPLETE 🔥');
}

runAttacks().catch(console.error);
