import { describe, expect, it, vi } from 'vitest';

vi.mock('@lactalink/agents/payload', () => ({
  NullableValidator: { number: vi.fn() },
}));

import { createOrgTotalVolumeField } from '../../src/fields/createOrgTotalVolumeField';

const initialize = createOrgTotalVolumeField({}).hooks!.beforeValidate![0]!;

describe('organization inventory initialization', () => {
  it.each(['hospitals', 'milkBanks'])(
    'creates %s without querying an undefined ID',
    async (slug) => {
      const find = vi.fn().mockRejectedValue(new Error('Invalid relationship ID'));
      const result = await initialize({
        data: { name: 'Test organization' },
        collection: { slug },
        operation: 'create',
        req: { payload: { find } },
      } as never);
      expect(result).toBe(0);
      expect(find).not.toHaveBeenCalled();
    },
  );

  it('keeps inventory queries in the current request when an ID exists', async () => {
    const find = vi
      .fn()
      .mockResolvedValue({ docs: [{ remainingVolume: 20 }, { remainingVolume: 30 }] });
    const req = { payload: { find } };
    const result = await initialize({
      data: { id: 'hospital-id' },
      collection: { slug: 'hospitals' },
      operation: 'create',
      req,
    } as never);
    expect(result).toBe(50);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ req }));
  });

  it('preserves the stored volume during updates', async () => {
    const find = vi.fn();
    const result = await initialize({
      data: { id: 'hospital-id' },
      collection: { slug: 'hospitals' },
      operation: 'update',
      value: 125,
      req: { payload: { find } },
    } as never);
    expect(result).toBe(125);
    expect(find).not.toHaveBeenCalled();
  });
});
