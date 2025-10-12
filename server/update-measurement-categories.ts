import { db } from './db';
import { inventoryItems } from '@shared/schema';
import { getCategoryForUnit } from '@shared/measurements';
import { eq, isNull } from 'drizzle-orm';

async function updateMeasurementCategories() {
  console.log('🔄 Updating measurement categories for existing inventory items...');

  try {
    const items = await db
      .select()
      .from(inventoryItems)
      .where(isNull(inventoryItems.deletedAt));

    console.log(`Found ${items.length} inventory items`);

    for (const item of items) {
      if (item.baseUnit) {
        const category = getCategoryForUnit(item.baseUnit);
        
        await db
          .update(inventoryItems)
          .set({ measurementCategory: category })
          .where(eq(inventoryItems.id, item.id));
        
        console.log(`✓ Updated ${item.name}: ${item.baseUnit} → ${category}`);
      }
    }

    console.log('✅ Measurement categories updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    process.exit(1);
  }
}

updateMeasurementCategories();
