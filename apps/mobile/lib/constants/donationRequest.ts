export const VOLUME_PRESET = {
  20: { value: 20, label: '20 mL' },
  50: { value: 50, label: '50 mL' },
  100: { value: 100, label: '100 mL' },
  150: { value: 150, label: '150 mL' },
  300: { value: 300, label: '300 mL' },
  500: { value: 500, label: '500 mL' },
};

export const DONATION_CREATE_STEPS = {
  details: { label: 'New Donation', value: 'details' },
  'milkbag-tutorial': { label: 'Milkbag Verification', value: 'milkbag-tutorial' },
  'milkbag-verification': { label: 'Milkbag Verification', value: 'milkbag-verification' },
} as const;
