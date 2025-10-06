import { z } from "zod";

export const MeasurementCategory = {
  WEIGHT: "weight",
  VOLUME: "volume",
  COUNT: "count",
  CUSTOM: "custom"
} as const;

export type MeasurementCategoryType = typeof MeasurementCategory[keyof typeof MeasurementCategory];

export const WeightUnit = {
  MG: "mg",
  G: "g",
  KG: "kg",
  OZ: "oz",
  LB: "lb"
} as const;

export const VolumeUnit = {
  ML: "ml",
  L: "L",
  TSP: "tsp",
  TBSP: "tbsp",
  CUP: "cup",
  FL_OZ: "fl_oz"
} as const;

export const CountUnit = {
  PIECE: "piece",
  DOZEN: "dozen",
  PACK: "pack"
} as const;

export const Unit = {
  ...WeightUnit,
  ...VolumeUnit,
  ...CountUnit
} as const;

export type UnitCode = typeof Unit[keyof typeof Unit];

export const weightUnits: UnitCode[] = Object.values(WeightUnit);
export const volumeUnits: UnitCode[] = Object.values(VolumeUnit);
export const countUnits: UnitCode[] = Object.values(CountUnit);

const weightConversions: Record<string, number> = {
  mg: 0.000001,
  g: 0.001,
  kg: 1,
  oz: 0.0283495,
  lb: 0.453592
};

const volumeConversions: Record<string, number> = {
  ml: 0.001,
  L: 1,
  tsp: 0.00492892,
  tbsp: 0.0147868,
  cup: 0.236588,
  fl_oz: 0.0295735
};

const countConversions: Record<string, number> = {
  piece: 1,
  dozen: 12,
  pack: 1
};

export interface ConversionProfile {
  baseUnit: UnitCode;
  baseToKg?: number;
  baseToL?: number;
  [key: string]: number | string | undefined;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
  unit: UnitCode;
  customFactor?: number;
}

export const recipeIngredientSchema = z.object({
  inventoryItemId: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string(),
  customFactor: z.number().positive().optional()
});

export function convertToBase(
  quantity: number,
  fromUnit: UnitCode,
  toUnit: UnitCode,
  category: MeasurementCategoryType,
  conversionProfile?: ConversionProfile
): number {
  if (fromUnit === toUnit) {
    return quantity;
  }

  if (conversionProfile && conversionProfile[fromUnit]) {
    const factor = conversionProfile[fromUnit] as number;
    return quantity * factor;
  }

  let conversions: Record<string, number>;
  
  switch (category) {
    case MeasurementCategory.WEIGHT:
      conversions = weightConversions;
      break;
    case MeasurementCategory.VOLUME:
      conversions = volumeConversions;
      break;
    case MeasurementCategory.COUNT:
      conversions = countConversions;
      break;
    default:
      throw new Error(`Unsupported conversion category: ${category}`);
  }

  if (!conversions[fromUnit] || !conversions[toUnit]) {
    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }

  const baseValue = quantity * conversions[fromUnit];
  return baseValue / conversions[toUnit];
}

export function getSupportedUnitsForItem(
  category: MeasurementCategoryType,
  conversionProfile?: ConversionProfile
): UnitCode[] {
  const customUnits = conversionProfile 
    ? Object.keys(conversionProfile).filter(k => k !== 'baseUnit' && k !== 'baseToKg' && k !== 'baseToL') as UnitCode[]
    : [];

  switch (category) {
    case MeasurementCategory.WEIGHT:
      return [...weightUnits, ...customUnits];
    case MeasurementCategory.VOLUME:
      return [...volumeUnits, ...customUnits];
    case MeasurementCategory.COUNT:
      return [...countUnits, ...customUnits];
    case MeasurementCategory.CUSTOM:
      return customUnits;
    default:
      return customUnits;
  }
}

export function validateUnitCategory(unit: UnitCode, category: MeasurementCategoryType): boolean {
  switch (category) {
    case MeasurementCategory.WEIGHT:
      return weightUnits.includes(unit);
    case MeasurementCategory.VOLUME:
      return volumeUnits.includes(unit);
    case MeasurementCategory.COUNT:
      return countUnits.includes(unit);
    case MeasurementCategory.CUSTOM:
      return true;
    default:
      return false;
  }
}

export function getCategoryForUnit(unit: string): MeasurementCategoryType {
  const normalizedUnit = unit.toLowerCase();
  
  if (weightUnits.includes(normalizedUnit as UnitCode)) return MeasurementCategory.WEIGHT;
  if (volumeUnits.includes(normalizedUnit as UnitCode)) return MeasurementCategory.VOLUME;
  if (countUnits.includes(normalizedUnit as UnitCode)) return MeasurementCategory.COUNT;
  
  const weightAliases = ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton', 'tonne'];
  const volumeAliases = ['liter', 'litre', 'milliliter', 'millilitre', 'gallon', 'quart', 'pint', 'teaspoon', 'tablespoon'];
  const countAliases = ['unit', 'item', 'box', 'bottle', 'can', 'bag'];
  
  if (weightAliases.some(alias => normalizedUnit.includes(alias))) return MeasurementCategory.WEIGHT;
  if (volumeAliases.some(alias => normalizedUnit.includes(alias))) return MeasurementCategory.VOLUME;
  if (countAliases.some(alias => normalizedUnit.includes(alias))) return MeasurementCategory.COUNT;
  
  return MeasurementCategory.COUNT;
}

export function getUnitLabel(unit: UnitCode): string {
  const labels: Record<string, string> = {
    mg: "Milligrams",
    g: "Grams",
    kg: "Kilograms",
    oz: "Ounces",
    lb: "Pounds",
    ml: "Milliliters",
    L: "Liters",
    tsp: "Teaspoons",
    tbsp: "Tablespoons",
    cup: "Cups",
    fl_oz: "Fluid Ounces",
    piece: "Pieces",
    dozen: "Dozen",
    pack: "Packs"
  };
  
  return labels[unit] || unit;
}
