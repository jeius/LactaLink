export const ID_STATUS = {
  PENDING: { label: 'Pending', value: 'PENDING' },
  APPROVED: { label: 'Approved', value: 'APPROVED' },
  REJECTED: { label: 'Rejected', value: 'REJECTED' },
} as const;

export const ID_TYPES = {
  PASSPORT: { label: 'Passport', value: 'PASSPORT' },
  DRIVER_LICENSE: { label: 'Driver License', value: 'DRIVER_LICENSE' },
  UMID: { label: 'Unified Multi-Purpose ID (UMID)', value: 'UMID' },
  SSS: { label: 'Social Security System (SSS) ID', value: 'SSS' },
  POSTAL_ID: { label: 'Postal ID', value: 'POSTAL_ID' },
  TIN: { label: 'Tax Identification Number (TIN) ID', value: 'TIN' },
  PHILHEALTH: { label: 'PhilHealth', value: 'PHILHEALTH' },
  PHILID: { label: 'Philippine Identification (PhilID / ePhilID)', value: 'PHILID' },
  PRC: { label: 'Professional Regulation Commission (PRC) ID', value: 'PRC' },
  OTHERS: { label: 'Others', value: 'OTHERS' },
} as const;
