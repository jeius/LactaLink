CREATE SCHEMA IF NOT EXISTS views;

CREATE OR REPLACE VIEW views.donation_request_delivery_matches AS
SELECT
  -- You can use row_number() for a unique id per match
  row_number() OVER () AS id,
  req.id AS request_id,
  req.status AS request_status,
  don.id AS donation_id,
  don.status AS donation_status,
  ST_Distance(
    addr_req.coordinates::geography,
    addr_don.coordinates::geography
  ) AS distance,
  mode_req.value AS matched_mode,
  day_req.value AS matched_days,
  addr_req.barangay_id AS matched_barangay_id,
  addr_req.city_municipality_id AS matched_city_municipality_id,
  addr_req.province_id AS matched_province_id
FROM
  public.donations don
JOIN public.donations_rels don_rel ON don_rel.parent_id = don.id
JOIN public.delivery_preferences dp_don ON dp_don.id = don_rel.delivery_preferences_id
JOIN public.delivery_preferences_preferred_mode mode_don ON mode_don.parent_id = dp_don.id
JOIN public.delivery_preferences_available_days day_don ON day_don.parent_id = dp_don.id
JOIN public.addresses addr_don ON addr_don.id = dp_don.address_id

JOIN public.requests req ON 1=1
  -- Only match requests with compatible delivery preferences
JOIN public.requests_rels req_rel ON req_rel.parent_id = req.id
JOIN public.delivery_preferences dp_req ON dp_req.id = req_rel.delivery_preferences_id
JOIN public.delivery_preferences_preferred_mode mode_req ON mode_req.parent_id = dp_req.id
JOIN public.delivery_preferences_available_days day_req ON day_req.parent_id = dp_req.id
JOIN public.addresses addr_req ON addr_req.id = dp_req.address_id

WHERE
  don.remaining_volume >= req.volume_needed  
  AND day_req.value = day_don.value
  AND mode_req.value = mode_don.value
;