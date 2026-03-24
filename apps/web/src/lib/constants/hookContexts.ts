export enum InventoryAllocationHookContext {
  SkipAllocation = 'skipInventoryAllocation',
}

export enum MilkBagHookContext {
  SkipExpiryCheck = 'skipExpiryCheck',
}

export enum InventoryHookContext {
  MilkBags = 'milkBagsToLink',
}

export enum ProfileHookContext {
  Owner = 'owner',
}
