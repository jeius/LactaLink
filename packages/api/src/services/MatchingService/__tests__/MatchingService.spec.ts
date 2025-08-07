import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { TransactionService } from '../../TransactionService';
import { MatchingService } from '../index';

const mockApiClient = {
  findByID: jest.fn(),
  find: jest.fn(),
  fetch: jest.fn(),
};

jest.mock('../../TransactionService', () => {
  return {
    TransactionService: jest.fn().mockImplementation(() => ({
      createP2PTransaction: jest.fn(),
      createP2OTransaction: jest.fn(),
      createO2PTransaction: jest.fn(),
    })),
  };
});

describe('MatchingService', () => {
  let service: MatchingService;
  let transactionService: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MatchingService(mockApiClient as any);
    transactionService = (service as any).transactionService;
  });

  describe('findMatchingDonations', () => {
    it('calls apiClient.fetch with correct params', async () => {
      mockApiClient.fetch.mockResolvedValueOnce([{ id: 'don1' }]);
      const result = await service.findMatchingDonations('req1', {
        criteria: { status: 'PENDING' },
      });
      expect(mockApiClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/requests/req1/matched-donations')
      );
      expect(result).toEqual([{ id: 'don1' }]);
    });
  });

  describe('findMatchingRequests', () => {
    it('calls apiClient.fetch with correct params', async () => {
      mockApiClient.fetch.mockResolvedValueOnce([{ id: 'req1' }]);
      const result = await service.findMatchingRequests('don1', {
        criteria: { matchBy: ['deliveryDays'] },
      });
      expect(mockApiClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/donations/don1/matched-requests')
      );
      expect(result).toEqual([{ id: 'req1' }]);
    });
  });

  describe('createMatch', () => {
    it('throws if donation is not available', async () => {
      mockApiClient.findByID
        .mockImplementationOnce(() => ({ status: 'MATCHED' }))
        .mockImplementationOnce(() => ({ status: DONATION_REQUEST_STATUS.AVAILABLE.value }));
      await expect(service.createMatch('don1', 'req1', { delivery: {} as any })).rejects.toThrow(
        /donation don1 is not available/
      );
    });

    it('throws if request is not available', async () => {
      mockApiClient.findByID
        .mockImplementationOnce(() => ({ status: DONATION_REQUEST_STATUS.AVAILABLE.value }))
        .mockImplementationOnce(() => ({ status: 'MATCHED' }));
      await expect(service.createMatch('don1', 'req1', { delivery: {} as any })).rejects.toThrow(
        /request req1 is not available/
      );
    });

    it('auto-selects milk bags if not provided', async () => {
      mockApiClient.findByID
        .mockImplementationOnce(() => ({
          id: 'don1',
          status: DONATION_REQUEST_STATUS.AVAILABLE.value,
          details: { bags: [{ id: 'bag1' }, { id: 'bag2' }] },
        }))
        .mockImplementationOnce(() => ({
          id: 'req1',
          status: DONATION_REQUEST_STATUS.AVAILABLE.value,
          volumeNeeded: 100,
          volumeFulfilled: 0,
        }));
      mockApiClient.find.mockResolvedValueOnce([
        { id: 'bag1', volume: 60, status: MILK_BAG_STATUS.AVAILABLE.value },
        { id: 'bag2', volume: 50, status: MILK_BAG_STATUS.AVAILABLE.value },
      ]);
      (transactionService.createP2PTransaction as jest.Mock).mockResolvedValueOnce({
        transaction: { id: 'tx1' },
        donation: {},
        request: {},
        milkBags: [{ id: 'bag1' }, { id: 'bag2' }],
      });

      const result = await service.createMatch('don1', 'req1', { delivery: {} as any });
      expect(result.transaction).toEqual({ id: 'tx1' });
      expect(result.matchedBags.length).toBe(2);
      expect(result.fullyFulfilled).toBe(true);
    });

    it('throws if no milk bags found', async () => {
      mockApiClient.findByID
        .mockImplementationOnce(() => ({
          id: 'don1',
          status: DONATION_REQUEST_STATUS.AVAILABLE.value,
          details: { bags: [] },
        }))
        .mockImplementationOnce(() => ({
          id: 'req1',
          status: DONATION_REQUEST_STATUS.AVAILABLE.value,
          volumeNeeded: 100,
          volumeFulfilled: 0,
        }));
      mockApiClient.find.mockResolvedValueOnce([]);
      await expect(service.createMatch('don1', 'req1', { delivery: {} as any })).rejects.toThrow(
        /No available milk bags found/
      );
    });
  });

  describe('createP2OMatch', () => {
    it('throws if donation is not available', async () => {
      mockApiClient.findByID.mockResolvedValueOnce({ status: 'MATCHED' });
      await expect(
        service.createP2OMatch('don1', { value: 'org1', relationTo: 'hospitals' } as any, {
          address: 'addr',
        })
      ).rejects.toThrow(/donation don1 is not available/);
    });

    it('calls transactionService.createP2OTransaction', async () => {
      mockApiClient.findByID.mockResolvedValueOnce({
        id: 'don1',
        status: 'AVAILABLE',
        details: { bags: [{ id: 'bag1' }] },
      });
      mockApiClient.find.mockResolvedValueOnce([{ id: 'bag1' }]);
      (transactionService.createP2OTransaction as jest.Mock).mockResolvedValueOnce({
        transaction: { id: 'tx2' },
      });

      const result = await service.createP2OMatch(
        'don1',
        { value: 'org1', relationTo: 'hospitals' } as any,
        { address: 'addr' }
      );
      expect(transactionService.createP2OTransaction).toHaveBeenCalled();
      expect(result.transaction.id).toBe('tx2');
    });
  });

  describe('createO2PMatch', () => {
    it('throws if no milkBagIds provided', async () => {
      await expect(
        service.createO2PMatch(
          'req1',
          { value: 'org1', relationTo: 'hospitals' } as any,
          { address: 'addr' } as any
        )
      ).rejects.toThrow(/Milk bag IDs must be provided/);
    });

    it('throws if some milk bags do not belong to org', async () => {
      mockApiClient.findByID.mockResolvedValueOnce({ id: 'req1', status: 'AVAILABLE' });
      mockApiClient.find.mockResolvedValueOnce([{ id: 'bag1' }]); // Only 1 returned, but 2 requested
      await expect(
        service.createO2PMatch('req1', { value: 'org1', relationTo: 'hospitals' } as any, {
          milkBagIds: ['bag1', 'bag2'],
          address: 'addr',
        })
      ).rejects.toThrow(/do not belong to the specified organization/);
    });

    it('calls transactionService.createO2PTransaction', async () => {
      mockApiClient.findByID.mockResolvedValueOnce({ id: 'req1', status: 'AVAILABLE' });
      mockApiClient.find.mockResolvedValueOnce([{ id: 'bag1' }, { id: 'bag2' }]);
      (transactionService.createO2PTransaction as jest.Mock).mockResolvedValueOnce({
        transaction: { id: 'tx3' },
      });

      const result = await service.createO2PMatch(
        'req1',
        { value: 'org1', relationTo: 'hospitals' } as any,
        { milkBagIds: ['bag1', 'bag2'], address: 'addr' }
      );
      expect(transactionService.createO2PTransaction).toHaveBeenCalled();
      expect(result.transaction.id).toBe('tx3');
    });
  });

  describe('getRecommendedDonationsForRequest', () => {
    it('calls findMatchingDonations with correct params', async () => {
      const spy = jest
        .spyOn(service, 'findMatchingDonations')
        .mockResolvedValueOnce([{ id: 'donX' }] as any);
      const result = await service.getRecommendedDonationsForRequest('req1', 1000, 2);
      expect(spy).toHaveBeenCalledWith(
        'req1',
        expect.objectContaining({ criteria: expect.any(Object) })
      );
      expect(result).toEqual([{ id: 'donX' }]);
    });
  });

  describe('getRecommendedRequestsForDonation', () => {
    it('calls findMatchingRequests with correct params', async () => {
      const spy = jest
        .spyOn(service, 'findMatchingRequests')
        .mockResolvedValueOnce([{ id: 'reqX' }] as any);
      const result = await service.getRecommendedRequestsForDonation('don1', 1000, 2);
      expect(spy).toHaveBeenCalledWith(
        'don1',
        expect.objectContaining({ criteria: expect.any(Object) })
      );
      expect(result).toEqual([{ id: 'reqX' }]);
    });
  });

  describe('getNearestDonations', () => {
    it('calls apiClient.fetch with correct params', async () => {
      mockApiClient.fetch.mockResolvedValueOnce([{ id: 'donNear' }]);
      const result = await service.getNearestDonations([124.238476, 24.456789]);
      expect(mockApiClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/donations/near?')
      );
      expect(result).toEqual([{ id: 'donNear' }]);
    });
  });

  describe('getNearestRequests', () => {
    it('calls apiClient.fetch with correct params', async () => {
      mockApiClient.fetch.mockResolvedValueOnce([{ id: 'reqNear' }]);
      const result = await service.getNearestRequests([124.238476, 24.456789]);
      expect(mockApiClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/requests/near?')
      );
      expect(result).toEqual([{ id: 'reqNear' }]);
    });
  });
});
