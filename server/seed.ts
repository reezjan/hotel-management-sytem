import { db } from './db';
import { roles, roleCreationPermissions, users, hotels } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

const ROLES = [
  { name: 'super_admin', description: 'Full access across hotels' },
  { name: 'owner', description: 'Hotel owner' },
  { name: 'manager', description: 'Hotel manager' },
  { name: 'housekeeping_supervisor', description: 'Housekeeping supervisor' },
  { name: 'housekeeping_staff', description: 'Housekeeping staff' },
  { name: 'restaurant_bar_manager', description: 'Restaurant and bar manager' },
  { name: 'waiter', description: 'Waiter' },
  { name: 'kitchen_staff', description: 'Kitchen staff' },
  { name: 'bartender', description: 'Bartender' },
  { name: 'barista', description: 'Barista' },
  { name: 'security_head', description: 'Security head' },
  { name: 'security_guard', description: 'Security guard' },
  { name: 'surveillance_officer', description: 'Surveillance officer' },
  { name: 'finance', description: 'Finance' },
  { name: 'front_desk', description: 'Front desk' },
  { name: 'cashier', description: 'Cashier' },
  { name: 'storekeeper', description: 'Storekeeper' }
];

const ROLE_PERMISSIONS = [
  // Super admin permissions
  { creatorRole: 'super_admin', createeRole: 'owner' },
  { creatorRole: 'super_admin', createeRole: 'super_admin' },
  
  // Owner permissions
  { creatorRole: 'owner', createeRole: 'manager' },
  { creatorRole: 'owner', createeRole: 'housekeeping_supervisor' },
  { creatorRole: 'owner', createeRole: 'restaurant_bar_manager' },
  { creatorRole: 'owner', createeRole: 'security_head' },
  { creatorRole: 'owner', createeRole: 'finance' },
  
  // Manager permissions
  { creatorRole: 'manager', createeRole: 'housekeeping_supervisor' },
  { creatorRole: 'manager', createeRole: 'restaurant_bar_manager' },
  { creatorRole: 'manager', createeRole: 'security_head' },
  { creatorRole: 'manager', createeRole: 'finance' },
  { creatorRole: 'manager', createeRole: 'front_desk' },
  { creatorRole: 'manager', createeRole: 'storekeeper' },
  
  // Housekeeping supervisor permissions
  { creatorRole: 'housekeeping_supervisor', createeRole: 'housekeeping_staff' },
  
  // Restaurant & Bar manager permissions
  { creatorRole: 'restaurant_bar_manager', createeRole: 'waiter' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'kitchen_staff' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'bartender' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'barista' },
  { creatorRole: 'restaurant_bar_manager', createeRole: 'cashier' },
  
  // Security head permissions
  { creatorRole: 'security_head', createeRole: 'security_guard' },
  { creatorRole: 'security_head', createeRole: 'surveillance_officer' }
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert roles
    console.log('📝 Creating roles...');
    for (const role of ROLES) {
      const existing = await db
        .select()
        .from(roles)
        .where(eq(roles.name, role.name));
      
      if (existing.length === 0) {
        await db.insert(roles).values(role);
        console.log(`  ✓ Created role: ${role.name}`);
      } else {
        console.log(`  → Role already exists: ${role.name}`);
      }
    }

    // Insert role creation permissions
    console.log('\n🔐 Setting up role creation permissions...');
    for (const permission of ROLE_PERMISSIONS) {
      try {
        await db.insert(roleCreationPermissions).values(permission).onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts
      }
    }
    console.log('  ✓ Role permissions configured');

    // Create superadmin user
    console.log('\n👤 Creating superadmin user...');
    const superAdminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'super_admin'));

    if (superAdminRole.length === 0) {
      console.error('  ✗ Super admin role not found!');
      process.exit(1);
    }

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, 'superadmin'));

    if (existingAdmin.length === 0) {
      const passwordHash = await hashPassword('aef009750905865270b03eb27ceba80e');
      
      await db.insert(users).values({
        username: 'superadmin',
        roleId: superAdminRole[0].id,
        passwordHash,
        isActive: true,
        email: 'superadmin@hotel.local',
        hotelId: null
      });
      
      console.log('  ✓ Superadmin user created');
      console.log('    Username: superadmin');
      console.log('    Password: aef009750905865270b03eb27ceba80e');
    } else {
      console.log('  → Superadmin already exists');
    }

    // Create test hotel
    console.log('\n🏨 Creating test hotel...');
    const existingHotel = await db
      .select()
      .from(hotels)
      .where(eq(hotels.name, 'Test Hotel'));

    let testHotel;
    if (existingHotel.length === 0) {
      const [newHotel] = await db.insert(hotels).values({
        name: 'Test Hotel',
        address: 'Kathmandu, Nepal',
        phone: '+977-1-1234567'
      }).returning();
      testHotel = newHotel;
      console.log('  ✓ Test hotel created');
    } else {
      testHotel = existingHotel[0];
      console.log('  → Test hotel already exists');
    }

    // Get role IDs
    const ownerRole = await db.select().from(roles).where(eq(roles.name, 'owner'));
    const managerRole = await db.select().from(roles).where(eq(roles.name, 'manager'));
    const baristaRole = await db.select().from(roles).where(eq(roles.name, 'barista'));
    const storekeeperRole = await db.select().from(roles).where(eq(roles.name, 'storekeeper'));

    // Create test users
    console.log('\n👥 Creating test users...');
    
    const testUsers = [
      {
        username: 'owner',
        password: 'owner123',
        roleId: ownerRole[0].id,
        email: 'owner@testhotel.local'
      },
      {
        username: 'manager',
        password: 'manager',
        roleId: managerRole[0].id,
        email: 'manager@testhotel.local'
      },
      {
        username: 'barista',
        password: 'barista',
        roleId: baristaRole[0].id,
        email: 'barista@testhotel.local'
      },
      {
        username: 'store',
        password: 'storekeeper',
        roleId: storekeeperRole[0].id,
        email: 'storekeeper@testhotel.local'
      }
    ];

    for (const user of testUsers) {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, user.username));

      if (existing.length === 0) {
        const passwordHash = await hashPassword(user.password);
        await db.insert(users).values({
          username: user.username,
          roleId: user.roleId,
          passwordHash,
          isActive: true,
          email: user.email,
          hotelId: testHotel.id
        });
        console.log(`  ✓ Created user: ${user.username} (password: ${user.password})`);
      } else {
        console.log(`  → User already exists: ${user.username}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
