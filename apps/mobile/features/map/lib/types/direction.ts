import { TravelMode } from '@lactalink/form-schemas/directions';
import { Coordinates } from '@lactalink/types';
import { Direction } from '@lactalink/types/api';
import { PropsWithChildren } from 'react';
import { StoreApi } from 'zustand';

type Endpoint = {
  coordinates: Coordinates;
  name: string;
  markerID: string;
};

interface DirectionsContextState {
  direction: Direction | null | undefined;
  isActive: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: unknown | null;
  mode: TravelMode;
  origin: Endpoint | null;
  destination: Endpoint | null;
}

export interface DirectionsContextActions {
  setInputs: (inputs: { origin?: Endpoint; destination?: Endpoint; mode?: TravelMode }) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
}

export type DirectionsContextStore = DirectionsContextState & { actions: DirectionsContextActions };

export type DirectionsContext = StoreApi<DirectionsContextStore>;

export type DirectionsContextProviderProps = PropsWithChildren<{}>;
