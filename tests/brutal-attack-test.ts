import { db } from './server/db';
import { users, mealVouchers, hallBookings } from './shared/schema';

async function brutalAttackTest() {
  console.log('🔥 BRUTAL ATTACK TESTING STARTED\n');
  
  // Attack 1: Rapid-fire concurrent requests (simulating DDoS)
  console.log('⚔️ Attack 1: Simulating 100 concurrent API requests...');
  const start = Date.now();
  const requests = Array.from({ length: 100 }, () => 
    db.query.users.findMany({ limit: 1 })
  );
  
  try {
    await Promise.all(requests);
    const elapsed = Date.now() - start;
    console.log(`✅ Handled 100 concurrent requests in ${elapsed}ms`);
  } catch (error) {
    console.log('❌ VULNERABILITY: Crashed under load!', error);
  }
  
  // Attack 2: Extreme data range queries
  console.log('\n⚔️ Attack 2: Extreme date range queries...');
  try {
    const extremeDates = await db.query.hallBookings.findMany({
      where: (hallBookings, { between }) => 
        between(
          hallBookings.bookingStartTime,
          new Date('1900-01-01'),
          new Date('2100-12-31')
        ),
      limit: 1000
    });
    console.log(`✅ Handled extreme date range query: ${extremeDates.length} results`);
  } catch (error) {
    console.log('❌ VULNERABILITY: Date range query failed!', error);
  }
  
  // Attack 3: Nested/complex query injection attempt
  console.log('\n⚔️ Attack 3: Complex nested query...');
  try {
    const nestedQuery = await db.query.users.findMany({
      with: {
        role: true,
        hotel: true
      },
      limit: 100
    });
    console.log(`✅ Handled complex nested query: ${nestedQuery.length} results`);
  } catch (error) {
    console.log('❌ VULNERABILITY: Nested query failed!', error);
  }
  
  // Attack 4: Edge case numeric values
  console.log('\n⚔️ Attack 4: Testing extreme numeric values...');
  try {
    // Try to create hall booking with extreme values
    const extremeBooking = {
      hotelId: 'fe06fdb2-1222-4ec1-be24-6048f1ac1728',
      hallId: '232c751f-2595-4c27-b348-9eb2fe1c4b2a',
      customerName: 'Extreme Test',
      customerPhone: '9'.repeat(50), // Very long phone
      bookingStartTime: new Date(),
      bookingEndTime: new Date(Date.now() + 1000),
      totalAmount: '999999999999.99', // Max numeric
      numberOfPeople: 999999,
      advancePaid: '0',
      balanceDue: '999999999999.99'
    };
    
    const result = await db.insert(hallBookings).values(extremeBooking as any).returning();
    console.log(`✅ Handled extreme numeric values: Created booking ${result[0].id}`);
    
    // Cleanup
    const { eq } = await import('drizzle-orm');
    await db.delete(hallBookings).where(eq(hallBookings.id, result[0].id));
  } catch (error: any) {
    if (error.message?.includes('out of range')) {
      console.log('✅ PROTECTED: Numeric overflow prevented');
    } else {
      console.log('⚠️  Extreme values error:', error.message);
    }
  }
  
  // Attack 5: Character encoding attacks
  console.log('\n⚔️ Attack 5: Testing special character encoding...');
  try {
    const specialChars = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.username, '👾🔥💀<>"\'/\\'),
      limit: 1
    });
    console.log(`✅ Handled special character query safely`);
  } catch (error) {
    console.log('❌ VULNERABILITY: Special characters broke query!', error);
  }
  
  // Attack 6: Empty/NULL attacks
  console.log('\n⚔️ Attack 6: Testing NULL/empty value handling...');
  try {
    const nullTests = await Promise.all([
      db.query.users.findMany({ where: (users, { eq }) => eq(users.email, ''), limit: 1 }),
      db.query.users.findMany({ where: (users, { isNull }) => isNull(users.phone), limit: 1 })
    ]);
    console.log(`✅ Handled NULL/empty queries: ${nullTests[0].length}, ${nullTests[1].length} results`);
  } catch (error) {
    console.log('❌ VULNERABILITY: NULL handling failed!', error);
  }
  
  console.log('\n🎯 BRUTAL ATTACK TEST COMPLETED!');
}

brutalAttackTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 CRITICAL FAILURE:', error);
    process.exit(1);
  });
