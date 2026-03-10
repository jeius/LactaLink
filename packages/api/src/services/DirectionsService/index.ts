import { IApiClient } from '@/interfaces';
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

    const response = await this.apiClient.fetch<ApiFetchResponse<DirectionsResult>>(
      'api/directions',
      {
        method: 'POST',
        body: body,
      }
    );

    if ('error' in response) {
      throw new Error(response.message, { cause: response.error });
    }

    return response.data;
  }
}
