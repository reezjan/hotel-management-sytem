const API_BASE = 'http://localhost:5000';

async function login(username, password) {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return response.headers.get('set-cookie');
}

async function updateKotItem(cookie, itemId, updateData) {
  const response = await fetch(`${API_BASE}/api/kot-items/${itemId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookie 
    },
    body: JSON.stringify(updateData)
  });
  return { status: response.status, data: await response.json() };
}

async function createKotOrder(cookie, orderData) {
  const response = await fetch(`${API_BASE}/api/kot-orders`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookie 
    },
    body: JSON.stringify(orderData)
  });
  return { status: response.status, data: await response.json() };
}

async function getMenuItems(cookie, hotelId) {
  const response = await fetch(`${API_BASE}/api/hotels/${hotelId}/menu-items`, {
    headers: { 'Cookie': cookie }
  });
  return response.json();
}

async function getTables(cookie, hotelId) {
  const response = await fetch(`${API_BASE}/api/hotels/${hotelId}/restaurant-tables`, {
    headers: { 'Cookie': cookie }
  });
  return response.json();
}

async function brutalKotTest() {
  console.log('🔥 BRUTAL KOT VALIDATION TEST 🔥\n');
  
  const hotelId = 'c35083a0-a79a-4172-b8c7-b199ff9c6d11';
  
  // Login as different users
  console.log('Logging in as different users...');
  const managerCookie = await login('manager', 'manager');
  const waiterCookie = await login('waiter', 'waiter');
  const baristaCookie = await login('barista', 'barista');
  console.log('✓ Logged in as manager, waiter, and barista\n');
  
  // Get menu items and tables
  const menuItems = await getMenuItems(managerCookie, hotelId);
  const tables = await getTables(managerCookie, hotelId);
  
  if (!menuItems || menuItems.length === 0) {
    console.error('❌ No menu items found');
    return;
  }
  
  if (!tables || tables.length === 0) {
    console.error('❌ No tables found');
    return;
  }
  
  const testMenuItem = menuItems[0];
  const testTable = tables[0];
  
  console.log(`Using menu item: ${testMenuItem.name} (ID: ${testMenuItem.id})`);
  console.log(`Using table: ${testTable.name}\n`);
  
  // Create a test KOT order
  console.log('Creating test KOT order...');
  const kotData = {
    hotelId,
    tableId: testTable.id,
    status: 'open',
    items: [
      {
        menuItemId: testMenuItem.id,
        description: testMenuItem.name,
        qty: 2,
        unit: 'plate',
        status: 'pending'
      }
    ]
  };
  
  const kotResult = await createKotOrder(managerCookie, kotData);
  if (kotResult.status !== 201) {
    console.error('❌ Failed to create KOT order:', kotResult.data);
    return;
  }
  
  // Get KOT items from the created order
  const kotOrderId = kotResult.data.id;
  const kotItemsResponse = await fetch(`${API_BASE}/api/kot-orders/${kotOrderId}/items`, {
    headers: { 'Cookie': managerCookie }
  });
  const kotItems = await kotItemsResponse.json();
  
  if (!kotItems || kotItems.length === 0) {
    console.error('❌ No KOT items found in order');
    return;
  }
  
  const kotItemId = kotItems[0].id;
  console.log(`✓ Created KOT order with item ID: ${kotItemId}\n`);
  
  // TEST 1: Non-manager trying to decline order
  console.log('TEST 1: Non-manager (waiter) trying to decline order');
  const test1 = await updateKotItem(waiterCookie, kotItemId, {
    status: 'declined',
    declineReason: 'Not available anymore'
  });
  console.log(`   Result: ${test1.status} - ${test1.data.message || 'Success'}`);
  console.log(`   ${test1.status === 403 ? '✅ Correctly rejected' : '❌ Should be rejected'}\n`);
  
  // TEST 2: Manager trying to decline without proper reason
  console.log('TEST 2: Manager declining without proper reason (<10 chars)');
  const test2 = await updateKotItem(managerCookie, kotItemId, {
    status: 'declined',
    declineReason: 'No stock'
  });
  console.log(`   Result: ${test2.status} - ${test2.data.message || 'Success'}`);
  console.log(`   ${test2.status === 400 ? '✅ Correctly rejected' : '❌ Should be rejected'}\n`);
  
  // TEST 3: Manager trying to decline with empty reason
  console.log('TEST 3: Manager declining with empty reason');
  const test3 = await updateKotItem(managerCookie, kotItemId, {
    status: 'declined',
    declineReason: ''
  });
  console.log(`   Result: ${test3.status} - ${test3.data.message || 'Success'}`);
  console.log(`   ${test3.status === 400 ? '✅ Correctly rejected' : '❌ Should be rejected'}\n`);
  
  // TEST 4: Manager declining with proper reason
  console.log('TEST 4: Manager declining with proper detailed reason');
  const test4 = await updateKotItem(managerCookie, kotItemId, {
    status: 'declined',
    declineReason: 'Item out of stock - supplier delivery delayed until tomorrow'
  });
  console.log(`   Result: ${test4.status} - ${test4.data.message || JSON.stringify(test4.data).substring(0, 50)}`);
  console.log(`   ${test4.status === 200 ? '✅ Correctly accepted' : '❌ Should be accepted'}\n`);
  
  // Create another KOT item for further testing
  console.log('Creating another KOT order for status change tests...');
  const kotData2 = {
    hotelId,
    tableId: testTable.id,
    status: 'open',
    items: [
      {
        menuItemId: testMenuItem.id,
        description: testMenuItem.name,
        qty: 1,
        unit: 'plate',
        status: 'pending'
      }
    ]
  };
  
  const kotResult2 = await createKotOrder(managerCookie, kotData2);
  if (kotResult2.status !== 201) {
    console.error('❌ Failed to create second KOT order');
    return;
  }
  
  const kotOrderId2 = kotResult2.data.id;
  const kotItemsResponse2 = await fetch(`${API_BASE}/api/kot-orders/${kotOrderId2}/items`, {
    headers: { 'Cookie': managerCookie }
  });
  const kotItems2 = await kotItemsResponse2.json();
  const kotItemId2 = kotItems2[0].id;
  console.log(`✓ Created second KOT order with item ID: ${kotItemId2}\n`);
  
  // TEST 5: Barista trying to cancel order
  console.log('TEST 5: Non-manager (barista) trying to cancel order');
  const test5 = await updateKotItem(baristaCookie, kotItemId2, {
    status: 'cancelled',
    declineReason: 'Customer changed mind about this item'
  });
  console.log(`   Result: ${test5.status} - ${test5.data.message || 'Success'}`);
  console.log(`   ${test5.status === 403 ? '✅ Correctly rejected' : '❌ Should be rejected'}\n`);
  
  // TEST 6: Manager canceling with proper reason
  console.log('TEST 6: Manager canceling with proper reason');
  const test6 = await updateKotItem(managerCookie, kotItemId2, {
    status: 'cancelled',
    declineReason: 'Customer requested cancellation due to dietary restrictions'
  });
  console.log(`   Result: ${test6.status} - ${test6.data.message || JSON.stringify(test6.data).substring(0, 50)}`);
  console.log(`   ${test6.status === 200 ? '✅ Correctly accepted' : '❌ Should be accepted'}\n`);
  
  // TEST 7: Normal status update by kitchen staff
  console.log('TEST 7: Kitchen staff (barista) updating to approved');
  const kotData3 = {
    hotelId,
    tableId: testTable.id,
    status: 'open',
    items: [
      {
        menuItemId: testMenuItem.id,
        description: testMenuItem.name,
        qty: 1,
        unit: 'plate',
        status: 'pending'
      }
    ]
  };
  
  const kotResult3 = await createKotOrder(baristaCookie, kotData3);
  const kotOrderId3 = kotResult3.data.id;
  const kotItemsResponse3 = await fetch(`${API_BASE}/api/kot-orders/${kotOrderId3}/items`, {
    headers: { 'Cookie': baristaCookie }
  });
  const kotItems3 = await kotItemsResponse3.json();
  const kotItemId3 = kotItems3[0].id;
  
  const test7 = await updateKotItem(baristaCookie, kotItemId3, {
    status: 'approved'
  });
  console.log(`   Result: ${test7.status} - ${test7.data.message || 'Approved'}`);
  console.log(`   ${test7.status === 200 ? '✅ Correctly accepted' : '❌ Should be accepted'}\n`);
  
  // TEST 8: Completing order
  console.log('TEST 8: Completing order (mark as completed)');
  const test8 = await updateKotItem(baristaCookie, kotItemId3, {
    status: 'completed'
  });
  console.log(`   Result: ${test8.status} - ${test8.data.message || 'Completed'}`);
  console.log(`   ${test8.status === 200 ? '✅ Correctly accepted' : '❌ Should be accepted'}\n`);
  
  // Summary
  console.log('📊 TEST SUMMARY:');
  const results = [test1, test2, test3, test4, test5, test6, test7, test8];
  const expectedStatuses = [403, 400, 400, 200, 403, 200, 200, 200];
  
  let passed = 0;
  let failed = 0;
  
  results.forEach((result, i) => {
    if (result.status === expectedStatuses[i]) {
      passed++;
    } else {
      failed++;
      console.log(`   ❌ Test ${i + 1} failed: Expected ${expectedStatuses[i]}, got ${result.status}`);
    }
  });
  
  console.log(`\n   ✅ Passed: ${passed}/${results.length}`);
  console.log(`   ❌ Failed: ${failed}/${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! KOT validation is working correctly!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED! Review the issues above.');
  }
}

brutalKotTest().catch(console.error);
