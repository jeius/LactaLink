import { DirectionsOptions, TravelMode } from '@lactalink/form-schemas/directions';
import { Coordinates } from '@lactalink/types';
import { ApiFetchResponse, DirectionsResult } from '@lactalink/types/api';
import { IApiClient } from '../../interfaces';

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
      routingPreference: travelMode === 'WALK' ? 'TRAFFIC_UNAWARE' : 'TRAFFIC_AWARE',
      requestedReferenceRoutes: ['SHORTER_DISTANCE'],
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
