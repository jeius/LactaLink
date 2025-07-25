-- Enhanced function for Supabase cron job
-- Updates milk bags to 'EXPIRED' status and recalculates related donation statistics
CREATE OR REPLACE FUNCTION public.update_milk_bag_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_bags integer;
  affected_donations integer;
BEGIN
  -- Step 1: Update expired milk bags and store their IDs in a temporary table
  CREATE TEMP TABLE temp_updated_milk_bags AS
  SELECT id
  FROM public.milk_bags
  WHERE 
    status = 'AVAILABLE' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();

  UPDATE public.milk_bags mb
  SET 
    status = 'EXPIRED',
    updated_at = NOW()
  FROM temp_updated_milk_bags t
  WHERE mb.id = t.id;

  GET DIAGNOSTICS affected_bags = ROW_COUNT;
  RAISE LOG 'Step 1: Updated % milk bags to EXPIRED status', affected_bags;

  -- Step 2: Precompute affected donations and their statistics
  CREATE TEMP TABLE temp_donation_stats AS
  SELECT 
    dr.parent_id AS donation_id,
    COALESCE(SUM(mb.volume) FILTER (WHERE mb.status != 'DISCARDED'), 0) AS total_volume,
    COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) AS remaining_volume,
    CASE
      WHEN COUNT(*) FILTER (WHERE mb.status != 'EXPIRED') = 0 THEN 'EXPIRED'::enum_donations_status
      WHEN COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) = 0 THEN 'FULLY_ALLOCATED'::enum_donations_status
      WHEN COUNT(*) FILTER (WHERE mb.status = 'ALLOCATED') > 0 
           AND COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) > 0 THEN 'PARTIALLY_ALLOCATED'::enum_donations_status
      ELSE 'AVAILABLE'::enum_donations_status
    END AS status
  FROM public.donations_rels dr
  INNER JOIN public.milk_bags mb ON dr.milk_bags_id = mb.id
  WHERE dr.parent_id IN (
    SELECT DISTINCT dr.parent_id
    FROM public.donations_rels dr
    INNER JOIN temp_updated_milk_bags t ON dr.milk_bags_id = t.id
  )
  GROUP BY dr.parent_id;

  -- Log the number of affected donations
  RAISE LOG 'Step 2: Number of donations to process: %', 
    (SELECT COUNT(*) FROM temp_donation_stats);

  -- Step 3: Update related donations using precomputed statistics
  UPDATE public.donations d
  SET 
    volume = t.total_volume,
    remaining_volume = t.remaining_volume,
    status = t.status,
    updated_at = NOW()
  FROM temp_donation_stats t
  WHERE d.id = t.donation_id;

  GET DIAGNOSTICS affected_donations = ROW_COUNT;
  RAISE LOG 'Step 3: Updated % donations with recalculated statistics', affected_donations;

  -- Drop the temporary tables
  DROP TABLE temp_updated_milk_bags;
  DROP TABLE temp_donation_stats;

  -- Log the final results
  RAISE LOG 'Final Results: Updated % milk bags to EXPIRED status and recalculated % related donations', 
    affected_bags, affected_donations;
END;
$$;
