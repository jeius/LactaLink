import z from 'zod';
import { coordinatesSchema } from '../address';

const routeTravelModeSchema = z.enum(
  ['DRIVE', 'TWO_WHEELER', 'WALK', 'TRANSIT', 'BICYCLE'],
  'Invalid travel mode, must be one of DRIVE, TWO_WHEELER, WALK, TRANSIT, BICYCLE'
);

const transitTravelModeSchema = z.enum(
  ['BUS', 'RAIL', 'SUBWAY', 'TRAIN', 'LIGHT_RAIL', 'TRANSIT_TRAVEL_MODE_UNSPECIFIED'],
  'Invalid transit travel mode, must be one of BUS, RAIL, SUBWAY, TRAIN, LIGHT_RAIL'
);

const emmisionTypeSchema = z.enum(
  ['GASOLINE', 'ELECTRIC', 'HYBRID', 'DIESEL'],
  'Invalid emmision type, must be one of GASOLINE, ELECTRIC, HYBRID, DIESEL'
);

const routingPreferenceSchema = z.enum(
  ['TRAFFIC_UNAWARE', 'TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL'],
  'Invalid routing preference, must be one of TRAFFIC_UNAWARE, TRAFFIC_AWARE, TRAFFIC_AWARE_OPTIMAL'
);

const polylineQualitySchema = z.enum(
  ['OVERVIEW', 'HIGH_QUALITY'],
  'Invalid polyline quality, must be one of OVERVIEW, HIGH_QUALITY'
);

const polylineEncodingSchema = z.enum(
  ['ENCODED_POLYLINE', 'GEO_JSON_LINESTRING'],
  'Invalid polyline encoding, must be one of ENCODED_POLYLINE, GEO_JSON_LINESTRING'
);

const unitsSchema = z.enum(
  ['METRIC', 'IMPERIAL'],
  'Invalid units, must be one of METRIC, IMPERIAL'
);

const referenceRoutesSchema = z.enum(
  ['FUEL_EFFICIENT', 'SHORTER_DISTANCE', 'REFERENCE_ROUTE_UNSPECIFIED'],
  'Invalid reference route, must be one of FUEL_EFFICIENT, SHORTER_DISTANCE'
);

const trafficModelSchema = z.enum(
  ['BEST_GUESS', 'PESSIMISTIC', 'OPTIMISTIC'],
  'Invalid traffic model, must be one of BEST_GUESS, PESSIMISTIC, OPTIMISTIC'
);

const transitRoutingPreferenceSchema = z.enum(
  ['LESS_WALKING', 'FEWER_TRANSFERS', 'TRANSIT_ROUTING_PREFERENCE_UNSPECIFIED'],
  'Invalid routing preference, must be one of LESS_WALKING, FEWER_TRANSFERS,'
);

const transitPreferencesSchema = z.object({
  allowedTravelModes: z.array(transitTravelModeSchema).optional(),
  routingPreference: transitRoutingPreferenceSchema.optional(),
});

const locationSchema = z.object({
  latLng: z.object(coordinatesSchema.shape, 'LatLng must be a valid coordinate object'),
  heading: z
    .number('Heading values must be from 0 to 360')
    .min(0, 'Heading values must be from 0 to 360')
    .max(360, 'Heading values must be from 0 to 360')
    .optional(),
});

const routeModifiersSchema = z.object({
  avoidTolls: z.boolean().optional(),
  avoidHighways: z.boolean().optional(),
  avoidFerries: z.boolean().optional(),
  avoidIndoor: z.boolean().optional(),
  vehicleInfo: z
    .object({
      emmisionType: emmisionTypeSchema.optional(),
    })
    .optional(),
});

const waypointSchema = z.object({
  location: z.object(locationSchema.shape, 'Location is required.'),
  via: z.boolean().optional(),
  vehicleStopover: z.boolean().optional(),
  sideOfRoad: z.boolean().optional(),
  placeId: z.string().optional(),
  address: z.string().optional(),
});

const directionsOptionsSchema = z.object({
  origin: z.object(waypointSchema.shape, 'Origin is required and must be a valid Waypoint object'),
  destination: z.object(
    waypointSchema.shape,
    'Destination is required and must be a valid Waypoint object'
  ),
  intermediates: z
    .array(z.object(waypointSchema.shape, 'Intermediates must be a valid Waypoint.'))
    .optional(),
  travelMode: routeTravelModeSchema.optional(),
  routingPreference: routingPreferenceSchema.optional(),
  polylineQuality: polylineQualitySchema.optional(),
  polylineEncoding: polylineEncodingSchema.optional(),
  computeAlternatives: z.boolean().optional(),
  routeModifiers: routeModifiersSchema.optional(),
  languageCode: z.string('Invalid language code').optional(),
  regionCode: z.string().optional(),
  units: unitsSchema.optional(),
  optimizeWaypointOrder: z.boolean().optional(),
  requestedReferenceRoutes: z.array(referenceRoutesSchema).optional(),
  trafficModel: trafficModelSchema.optional(),
  transitPreferences: transitPreferencesSchema.optional(),
  departureTime: z.string('Departure time must be a valid ISO string').optional(),
  arrivalTime: z.string('Arrival time must be a valid ISO string').optional(),
});

export {
  directionsOptionsSchema,
  emmisionTypeSchema,
  locationSchema,
  polylineEncodingSchema,
  polylineQualitySchema,
  referenceRoutesSchema,
  routeModifiersSchema,
  routeTravelModeSchema,
  routingPreferenceSchema,
  trafficModelSchema,
  transitPreferencesSchema,
  transitTravelModeSchema,
  unitsSchema,
  waypointSchema,
};
