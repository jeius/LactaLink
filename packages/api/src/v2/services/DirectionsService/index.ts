import type { ApiClient as IApiClient } from '@/v2/ApiClient';
import { DirectionsOptions, TravelMode } from '@lactalink/form-schemas/directions';
import { Coordinates } from '@lactalink/types';
import { ApiFetchResponse, DirectionsResult } from '@lactalink/types/api';

export class DirectionsService {
  constructor(private apiClient: IApiClient) {}

  async getDirections({
    origin,
    destination,
    travelMode,
  }: {
    origin: Coordinates;
    destination: Coordinates;
    travelMode: TravelMode;
  }): Promise<DirectionsResult> {
    const body: DirectionsOptions = {
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: destination } },
      travelMode,
      routingPreference: ['DRIVE', 'TWO_WHEELER'].includes(travelMode)
        ? 'TRAFFIC_AWARE'
        : undefined,
      requestedReferenceRoutes: ['DRIVE', 'BICYCLE', 'TWO_WHEELER'].includes(travelMode)
        ? ['SHORTER_DISTANCE']
        : undefined,
    };

    const res = await this.apiClient.request({
      method: 'POST',
      path: '/directions',
      json: body,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch directions: ${res.statusText}`, {
        cause: {
          status: res.status,
          statusText: res.statusText,
          body: await res.json(),
        },
      });
    }

    const data = (await res.json()) as ApiFetchResponse<DirectionsResult>;

    if ('error' in data) {
      throw new Error(data.message, { cause: data.error });
    }

    return data.data;
  }
}
