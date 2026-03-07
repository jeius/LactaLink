export enum InventoryAllocationHookContext {
  SkipAllocation = 'skipInventoryAllocation',
}

export enum MilkBagHookContext {
  SkipExpiryCheck = 'skipExpiryCheck',
}

export enum InventoryHookContext {
  MilkBagIDs = 'milkBagIDsToLink',
}

export enum ProfileHookContext {
  Owner = 'owner',
}
