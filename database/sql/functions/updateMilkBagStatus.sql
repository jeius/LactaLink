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
  donation_id uuid;
BEGIN
  -- Step 1: Update expired milk bags and store their IDs in a temporary table
  CREATE TEMP TABLE temp_updated_milk_bags AS
  SELECT id
  FROM public.milk_bags
  WHERE 
    status = 'AVAILABLE' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();

  UPDATE public.milk_bags 
  SET 
    status = 'EXPIRED',
    updated_at = NOW()
  WHERE id IN (SELECT id FROM temp_updated_milk_bags);

  GET DIAGNOSTICS affected_bags = ROW_COUNT;
  RAISE LOG 'Step 1: Updated % milk bags to EXPIRED status', affected_bags;

  -- Step 2: Find affected donations using the temporary table
  CREATE TEMP TABLE temp_affected_donations AS
  SELECT DISTINCT dr.parent_id AS donation_id
  FROM public.donations_rels dr
  INNER JOIN temp_updated_milk_bags mb ON dr.milk_bags_id = mb.id;

  -- Log the number of affected donations
  RAISE LOG 'Step 2: Number of donations to process: %', 
    (SELECT COUNT(*) FROM temp_affected_donations);

  -- Step 3: Update related donations
  affected_donations := 0;

  -- Use an alias to disambiguate the column reference
  FOR donation_id IN SELECT t.donation_id FROM temp_affected_donations t LOOP
    -- Log the donation ID being processed
    RAISE LOG 'Processing donation ID: %', donation_id;

    -- Recalculate donation statistics based on all its milk bags
    UPDATE public.donations 
    SET 
      volume = (
        SELECT COALESCE(SUM(mb.volume), 0)
        FROM public.donations_rels dr
        INNER JOIN public.milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_id
          AND mb.status != 'DISCARDED'
      ),
      remaining_volume = (
        SELECT COALESCE(SUM(mb.volume), 0)
        FROM public.donations_rels dr
        INNER JOIN public.milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_id
          AND mb.status = 'AVAILABLE'
      ),
      status = (
        SELECT CASE
          -- All bags are expired
          WHEN COUNT(*) FILTER (WHERE mb.status != 'EXPIRED') = 0 THEN 'EXPIRED'::enum_donations_status
          -- No remaining volume (all allocated or expired)
          WHEN COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) = 0 THEN 'FULLY_ALLOCATED'::enum_donations_status
          -- Some bags allocated, some available
          WHEN COUNT(*) FILTER (WHERE mb.status = 'ALLOCATED') > 0 
               AND COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) > 0 THEN 'PARTIALLY_ALLOCATED'::enum_donations_status
          -- Has available bags (default case)
          ELSE 'AVAILABLE'::enum_donations_status
        END
        FROM public.donations_rels dr
        INNER JOIN public.milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_id
          AND mb.status != 'DISCARDED'
      ),
      updated_at = NOW()
    WHERE id = donation_id;

    -- Increment the counter and log the update
    affected_donations := affected_donations + 1;
    RAISE LOG 'Updated donation ID: %, Total donations updated: %', 
      donation_id, affected_donations;
  END LOOP;

  -- Drop the temporary tables
  DROP TABLE temp_updated_milk_bags;
  DROP TABLE temp_affected_donations;

  -- Log the final results
  RAISE LOG 'Updated % milk bags to EXPIRED status and recalculated % related donations', 
    affected_bags, affected_donations;
END;
$$;
