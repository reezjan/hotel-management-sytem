/**
 * AUTHENTICATED ATTACK TEST SUITE
 * Tests protected endpoints with valid sessions to find authorization bugs
 */

const API_BASE = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
  : 'http://localhost:5000';

interface Session {
  cookie: string;
  user: any;
}

async function login(username: string, password: string): Promise<Session | null> {
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (!response.ok) return null;
    
    const user = await response.json();
    const cookie = response.headers.get('set-cookie') || '';
    
    return { cookie, user };
  } catch (error) {
    console.error(`Login failed for ${username}:`, error);
    return null;
  }
}

async function testWithSession(session: Session, method: string, url: string, body: any, testName: string) {
  try {
    const headers: any = { 'Content-Type': 'application/json' };
    if (session.cookie) headers['Cookie'] = session.cookie;
    
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
      data = text.substring(0, 100);
    }
    
    const status = response.status >= 400 ? '❌' : '✅';
    console.log(`${status} [${response.status}] ${testName}`);
    if (response.status >= 400) {
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}`);
    }
    
    return { response, data };
  } catch (error) {
    console.error(`💥 CRASH: ${testName}:`, error);
    return { error };
  }
}

async function runAuthenticatedAttacks() {
  console.log('🔐 STARTING AUTHENTICATED ATTACK TEST SUITE 🔐\n');
  
  // Login as different users
  console.log('=== LOGGING IN AS DIFFERENT USERS ===\n');
  const manager = await login('manager', 'manager');
  const frontDesk = await login('sita', 'sitasita');
  const waiter = await login('waiter', 'waiter');
  const barista = await login('barista', 'barista');
  const storekeeper = await login('store', 'storekeeper');
  
  if (!manager || !frontDesk || !waiter) {
    console.error('Failed to login! Aborting tests.');
    return;
  }
  
  console.log('✅ Manager logged in:', manager.user.username, 'Hotel:', manager.user.hotelId);
  console.log('✅ Front Desk logged in:', frontDesk.user.username, 'Hotel:', frontDesk.user.hotelId);
  console.log('✅ Waiter logged in:', waiter.user.username, 'Hotel:', waiter.user.hotelId);
  
  // Fake hotel ID for cross-hotel attacks
  const fakeHotelId = '00000000-0000-0000-0000-000000000000';
  const realHotelId = manager.user.hotelId;
  
  console.log('\n=== ATTACKING AUTHORIZATION - CROSS-HOTEL ACCESS ===\n');
  
  // Try to access different hotel's data
  await testWithSession(manager, 'GET', `/api/hotels/${fakeHotelId}/users`, null, 
    'Manager accessing fake hotel users');
  await testWithSession(manager, 'GET', `/api/hotels/${fakeHotelId}/rooms`, null, 
    'Manager accessing fake hotel rooms');
  await testWithSession(manager, 'GET', `/api/hotels/${fakeHotelId}/inventory`, null, 
    'Manager accessing fake hotel inventory');
  
  console.log('\n=== ATTACKING PRIVILEGE ESCALATION ===\n');
  
  // Front desk trying to perform manager actions
  await testWithSession(frontDesk, 'POST', `/api/hotels/${realHotelId}/users`, {
    username: 'hacker',
    email: 'hack@test.com',
    roleId: 2, // Try to create owner
    passwordHash: 'fake'
  }, 'Front Desk creating owner user (should fail)');
  
  await testWithSession(frontDesk, 'DELETE', `/api/hotels/${realHotelId}/users/${manager.user.id}`, null,
    'Front Desk deleting manager (should fail)');
  
  // Waiter trying manager actions
  await testWithSession(waiter, 'POST', `/api/hotels/current/transactions`, {
    amount: 50000,
    txnType: 'income',
    purpose: 'Fake revenue'
  }, 'Waiter creating transaction (should fail)');
  
  console.log('\n=== ATTACKING MAINTENANCE REQUEST REASSIGNMENT ===\n');
  
  // First create a maintenance request as manager
  const createMR = await testWithSession(manager, 'POST', '/api/maintenance-requests', {
    title: 'Test Request',
    location: 'Room 101',
    description: 'Test',
    hotelId: realHotelId,
    reportedBy: manager.user.id,
    assignedTo: waiter.user.id
  }, 'Manager creating maintenance request');
  
  if (createMR.data && createMR.data.id) {
    const mrId = createMR.data.id;
    
    // Waiter trying to reassign their own task to someone else (should fail)
    await testWithSession(waiter, 'PUT', `/api/maintenance-requests/${mrId}`, {
      assignedTo: frontDesk.user.id
    }, 'Waiter reassigning maintenance request (should fail - not supervisor)');
    
    // Barista (not assigned) trying to update request (should fail)
    if (barista) {
      await testWithSession(barista, 'PUT', `/api/maintenance-requests/${mrId}`, {
        status: 'completed'
      }, 'Barista updating unassigned request (should fail)');
    }
    
    // Manager reassigning (should succeed)
    await testWithSession(manager, 'PUT', `/api/maintenance-requests/${mrId}`, {
      assignedTo: storekeeper?.user.id || waiter.user.id
    }, 'Manager reassigning maintenance request (should succeed)');
  }
  
  console.log('\n=== ATTACKING FINANCIAL SYSTEM ===\n');
  
  // Create a transaction as manager first
  const createTxn = await testWithSession(manager, 'POST', '/api/hotels/current/transactions', {
    amount: 1000,
    txnType: 'expense',
    purpose: 'Test expense',
    paymentMethod: 'cash'
  }, 'Manager creating transaction');
  
  if (createTxn.data && createTxn.data.id) {
    const txnId = createTxn.data.id;
    
    // Waiter trying to void transaction (should fail)
    await testWithSession(waiter, 'POST', `/api/transactions/${txnId}/void`, {
      reason: 'Waiter trying to void - this is a 20+ character reason to bypass validation'
    }, 'Waiter voiding transaction (should fail - not manager/owner)');
    
    // Manager voiding with short reason (should fail)
    await testWithSession(manager, 'POST', `/api/transactions/${txnId}/void`, {
      reason: 'short'
    }, 'Manager voiding with short reason (should fail - < 15 chars)');
    
    // Manager voiding with proper reason (should succeed)
    await testWithSession(manager, 'POST', `/api/transactions/${txnId}/void`, {
      reason: 'Testing void functionality - legitimate business reason for voiding this transaction'
    }, 'Manager voiding with valid reason (should succeed)');
    
    // Try to void already voided transaction (should fail)
    await testWithSession(manager, 'POST', `/api/transactions/${txnId}/void`, {
      reason: 'Trying to void already voided transaction - should fail double void prevention'
    }, 'Manager double-voiding transaction (should fail)');
  }
  
  console.log('\n=== ATTACKING USER SELF-DEACTIVATION ===\n');
  
  // Try to deactivate self
  await testWithSession(manager, 'PATCH', `/api/hotels/${realHotelId}/users/${manager.user.id}`, {
    isActive: false
  }, 'Manager deactivating self (should fail)');
  
  console.log('\n=== ATTACKING EDGE CASES ===\n');
  
  // Try operations with invalid UUIDs
  await testWithSession(manager, 'PUT', '/api/maintenance-requests/not-a-uuid', {
    status: 'completed'
  }, 'Update with invalid UUID');
  
  await testWithSession(manager, 'DELETE', `/api/hotels/${realHotelId}/users/not-a-uuid`, null,
    'Delete with invalid UUID');
  
  // Try massive transaction amounts
  await testWithSession(manager, 'POST', '/api/hotels/current/transactions', {
    amount: 999999999999999999,
    txnType: 'expense'
  }, 'Massive transaction amount');
  
  // Try negative amounts
  await testWithSession(manager, 'POST', '/api/hotels/current/transactions', {
    amount: -50000,
    txnType: 'income'
  }, 'Negative transaction amount');
  
  console.log('\n🔐 AUTHENTICATED ATTACK TEST SUITE COMPLETE 🔐');
}

runAuthenticatedAttacks().catch(console.error);
