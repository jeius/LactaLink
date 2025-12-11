import z from 'zod';
import {
  polylineEncodingSchema,
  polylineQualitySchema,
  referenceRoutesSchema,
  routeModifiersSchema,
  routeTravelModeSchema,
  routingPreferenceSchema,
  trafficModelSchema,
  transitPreferencesSchema,
  unitsSchema,
  waypointSchema,
} from './schemas';

export type Waypoint = z.infer<typeof waypointSchema>;

export type TravelMode = z.infer<typeof routeTravelModeSchema>;

export type RoutingPreference = z.infer<typeof routingPreferenceSchema>;

export type PolylineQuality = z.infer<typeof polylineQualitySchema>;

export type PolylineEncoding = z.infer<typeof polylineEncodingSchema>;

export type RouteModifiers = z.infer<typeof routeModifiersSchema>;

export type Units = z.infer<typeof unitsSchema>;

export type TransitPreferences = z.infer<typeof transitPreferencesSchema>;

export type ReferenceRoute = z.infer<typeof referenceRoutesSchema>;

export type TrafficModel = z.infer<typeof trafficModelSchema>;

export interface DirectionsOptions {
  /**
   * The starting point for the directions.
   */
  origin: Waypoint;

  /**
   * The ending point for the directions.
   */
  destination: Waypoint;

  /**
   * An optional array of intermediate waypoints between the origin and destination.
   */
  intermediates?: Waypoint[];

  /**
   * Optional. Specifies the mode of transportation.
   */
  travelMode?: TravelMode;

  /**
   * Optional. Specifies how to compute the route. The server attempts to use the
   * selected routing preference to compute the route. If the routing preference
   * results in an error or an extra long latency, then an error is returned. You
   * can specify this option only when the travel_mode is `DRIVE` or `TWO_WHEELER`,
   * otherwise the request fails.
   */
  routingPreference?: RoutingPreference;

  /**
   * Optional. Specifies your preference for the quality of the polyline.
   */
  polylineQuality?: PolylineQuality;

  /**
   * Optional. Specifies the preferred encoding for the polyline.
   */
  polylineEncoding?: PolylineEncoding;

  /**
   * Optional. Specifies whether to calculate alternate routes in addition to the
   * route. No alternative routes are returned for requests that have intermediate
   * waypoints.
   */
  computeAlternatives?: boolean;

  /**
   * Optional. A set of conditions to satisfy that affect the way routes are calculated.
   */
  routeModifiers?: RouteModifiers;

  /**
   * Optional. The BCP-47 language code, such as "en-US" or "sr-Latn". For more information,
   * see [Unicode Locale Identifier](http://www.unicode.org/reports/tr35/#Unicode_locale_identifier).
   * See [Language Support](https://developers.google.com/maps/faq#languagesupport) for the
   * list of supported languages. When you don't provide this value, the display language
   * is inferred from the location of the route request.
   */
  languageCode?: string;

  /**
   *  Optional. The region code, specified as a ccTLD ("top-level domain")
   *  two-character value. For more information see [Country code top-level
   *  domains](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains#Country_code_top-level_domains).
   */
  regionCode?: string;

  /**
   *  Optional. Specifies the units of measure for the display fields.
   *  The units of measure used for the route, leg, step distance, and duration
   *  are not affected by this value. If you don't provide this value, then the
   *  display units are inferred from the location of the first origin.
   */
  units?: Units;

  /**
   * Optional. If set to true, the service attempts to minimize the overall cost of the route
   * by re-ordering the specified intermediate waypoints.
   */
  optimizeWaypointOrder?: boolean;

  /**
   * Optional. Specifies what reference routes to calculate as part of the request in addition
   * to the default route. A reference route is a route with a different route calculation objective
   * than the default route. For example a `FUEL_EFFICIENT` reference route calculation takes into
   * account various parameters that would generate an optimal fuel efficient route. When using this
   * feature, look for `route_labels` on the resulting routes.
   */
  requestedReferenceRoutes?: ReferenceRoute[];

  /**
   * Optional. Specifies the assumptions to use when calculating time in traffic. This setting
   * affects the value returned in the duration field in the Route and RouteLeg which contains
   * the predicted time in traffic based on historical averages. `trafficModel` is only available
   * for requests that have set `routingPreference` to `TRAFFIC_AWARE_OPTIMAL` and `travelMode`
   * to `DRIVE`. Defaults to `BEST_GUESS` if traffic is requested and `trafficModel` is not specified.
   */
  trafficModel?: TrafficModel;

  /**
   * Optional. Specifies preferences that influence the route returned for `TRANSIT` routes.
   * NOTE: You can only specify a `transitPreferences` when `travelMode` is set to `TRANSIT`.
   */
  transitPreferences?: TransitPreferences;

  /**
   * Optional. The departure time. If you don't set this value, then this value defaults to the
   * time that you made the request. NOTE: You can only specify a `departureTime` in the past
   * when `travelMode` is set to `TRANSIT`. Transit trips are available for up to 7 days in
   * the past or 100 days in the future.
   */
  departureTime?: string;

  /**
   * Optional. The arrival time. NOTE: This field is ignored when requests specify a
   * `travelMode` other than `TRANSIT`. You can specify either `departureTime` or
   * `arrivalTime`, but not both. Transit trips are available for up to 7 days in the
   * past or 100 days in the future.
   */
  arrivalTime?: string;
}
