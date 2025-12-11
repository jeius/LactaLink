import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { protos, v2 } from '@googlemaps/routing';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import {
  DirectionsOptions,
  directionsOptionsSchema,
  Waypoint as IWaypoint,
} from '@lactalink/form-schemas/directions';
import { Point } from '@lactalink/types';
import { DirectionsResult } from '@lactalink/types/api';
import { ValidationError } from '@lactalink/utilities/errors';
import status from 'http-status';
import { PayloadRequest } from 'payload';
import { FieldPath } from 'react-hook-form';

const Int32Value = protos.google.protobuf.Int32Value;
const TimeStamp = protos.google.protobuf.Timestamp;
const TransitTravelMode = protos.google.maps.routing.v2.TransitPreferences.TransitTravelMode;
const Waypoint = protos.google.maps.routing.v2.Waypoint;

type RouteModifiers = protos.google.maps.routing.v2.IRouteModifiers;
type ComputeResponse = protos.google.maps.routing.v2.IComputeRoutesResponse;
type RouteFields = FieldPath<NonNullable<ComputeResponse['routes']>[number]>;

const getDirectionsHandler = createPayloadHandler({
  requireAuth: true,
  handler: handler,
  successMessage: (_req, data) => {
    return `Directions fetched successfully. Found ${data?.length ?? 0} routes.`;
  },
});

async function handler(req: PayloadRequest): Promise<DirectionsResult> {
  const body = await req.json?.();

  const parseResult = directionsOptionsSchema.safeParse(body);

  if (!parseResult.success) {
    const error = parseResult.error.issues.pop();
    if (error) {
      throw new ValidationError(error.message, {
        name: ValidationErrorNames.INVALID_TYPE,
        statusCode: status.BAD_REQUEST,
      });
    }
  }

  const parsedData = parseResult.data;

  if (!parsedData) {
    throw new ValidationError('Direction Options is required.', {
      name: ValidationErrorNames.REQUIRED_FIELD_MISSING,
      statusCode: status.BAD_REQUEST,
    });
  }

  const {
    origin,
    destination,
    arrivalTime,
    departureTime,
    intermediates,
    transitPreferences,
    requestedReferenceRoutes,
    routeModifiers,
    languageCode = 'en',
    regionCode = 'PH',
    units = 'METRIC',
    polylineQuality = 'HIGH_QUALITY',
    polylineEncoding = 'GEO_JSON_LINESTRING',
    travelMode = 'DRIVE',
    ...options
  } = parsedData as DirectionsOptions;

  const routeModifiersData: RouteModifiers | undefined = routeModifiers
    ? {
        ...routeModifiers,
        vehicleInfo: {
          emissionType:
            routeModifiers.vehicleInfo?.emmisionType ?? 'VEHICLE_EMISSION_TYPE_UNSPECIFIED',
        },
      }
    : undefined;

  const originWaypoint = createWaypoint(origin);
  const destinationWaypoint = createWaypoint(destination);
  const intermediatesWaypoint = intermediates?.map((wp) => createWaypoint(wp));

  const fieldMask: RouteFields[] = [
    'duration',
    'distanceMeters',
    'polyline.geoJsonLinestring',
    'optimizedIntermediateWaypointIndex',
    'duration.seconds',
    'description',
    'localizedValues',
  ];

  const client = new v2.RoutesClient({ apiKey: process.env.GOOGLE_ROUTES_API_KEY });

  const [primaryRoute] = await client.computeRoutes(
    {
      ...options,
      origin: originWaypoint,
      destination: destinationWaypoint,
      arrivalTime: arrivalTime ? createTimeStamp(arrivalTime) : undefined,
      departureTime: departureTime ? createTimeStamp(departureTime) : undefined,
      routeModifiers: routeModifiersData,
      intermediates: intermediatesWaypoint,
      languageCode: languageCode,
      regionCode: regionCode,
      units: units,
      travelMode: travelMode,
      polylineQuality: polylineQuality,
      polylineEncoding: polylineEncoding,
      requestedReferenceRoutes: requestedReferenceRoutes?.map((route) => {
        switch (route) {
          case 'FUEL_EFFICIENT':
            return 1;
          case 'SHORTER_DISTANCE':
            return 2;
          default:
            return 0;
        }
      }),
      transitPreferences: transitPreferences
        ? {
            ...transitPreferences,
            allowedTravelModes: transitPreferences.allowedTravelModes?.map(
              (mode) => TransitTravelMode[mode]
            ),
          }
        : undefined,
    },
    {
      timeout: 1000 * 5, // 5 seconds
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': `routes,${fieldMask.map((field) => `routes.${field}`).join(',')}`,
        },
      },
    }
  );

  const routes = primaryRoute.routes;

  return !routes
    ? null
    : routes.map((route) => {
        const polylines = route.polyline?.geoJsonLinestring?.fields?.coordinates?.listValue?.values;
        return {
          description: route.description,
          distanceMeters: route.distanceMeters ?? 0,
          duration: { seconds: Number(route.duration?.seconds ?? 0) },
          optimizedIntermediateWaypointIndex: route.optimizedIntermediateWaypointIndex,
          localizedValues: {
            distance: route.localizedValues?.distance?.text ?? '',
            duration: route.localizedValues?.duration?.text ?? '',
          },
          polyline: polylines
            ? polylines
                .map((value) => {
                  if (!value?.listValue?.values || value?.listValue?.values?.length !== 2) {
                    return null;
                  }

                  const [longitude, latitude] = value.listValue.values.map(
                    (v) => v.numberValue
                  ) as Point;

                  return { latitude, longitude };
                })
                .filter((v) => v !== null)
            : [],
        };
      });
}

function createTimeStamp(dateString: string) {
  const date = new Date(dateString);
  const timestamp = new TimeStamp();
  timestamp.seconds = Math.floor(date.getTime() / 1000);
  timestamp.nanos = (date.getTime() % 1000) * 1e6;
  return timestamp;
}

function createInt32Value(value: number) {
  const int32Value = new Int32Value();
  int32Value.value = value;
  return int32Value;
}

function createWaypoint(waypoint: IWaypoint) {
  return Waypoint.fromObject({
    ...waypoint,
    location: {
      ...waypoint.location,
      heading: waypoint.location.heading && createInt32Value(waypoint.location.heading),
    },
  });
}

export default getDirectionsHandler;
