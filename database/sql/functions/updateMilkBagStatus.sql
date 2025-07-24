-- Enhanced function for Supabase cron job
-- Updates milk bags to 'EXPIRED' status and recalculates related donation statistics
CREATE OR REPLACE FUNCTION update_milk_bag_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_bags integer;
  affected_donations integer;
  donation_id uuid;
  donation_cursor CURSOR FOR
    SELECT DISTINCT dr.parent_id as donation_id
    FROM donations_rels dr
    INNER JOIN milk_bags mb ON dr.milk_bags_id = mb.id
    WHERE mb.status = 'AVAILABLE' 
      AND mb.expires_at IS NOT NULL 
      AND mb.expires_at < NOW();
BEGIN
  -- Step 1: Update expired milk bags
  UPDATE milk_bags 
  SET 
    status = 'EXPIRED',
    updated_at = NOW()
  WHERE 
    status = 'AVAILABLE' 
    AND expires_at IS NOT NULL 
    AND expires_at < NOW();
    
  GET DIAGNOSTICS affected_bags = ROW_COUNT;
  
  -- Step 2: Update related donations
  affected_donations := 0;
  
  FOR donation_record IN donation_cursor LOOP
    -- Recalculate donation statistics based on all its milk bags
    UPDATE donations 
    SET 
      volume = (
        SELECT COALESCE(SUM(mb.volume), 0)
        FROM donations_rels dr
        INNER JOIN milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_record.donation_id
          AND mb.status != 'DISCARDED'
      ),
      remaining_volume = (
        SELECT COALESCE(SUM(mb.volume), 0)
        FROM donations_rels dr
        INNER JOIN milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_record.donation_id
          AND mb.status = 'AVAILABLE'
      ),
      status = (
        SELECT CASE
          -- All bags are expired
          WHEN COUNT(*) FILTER (WHERE mb.status != 'EXPIRED') = 0 THEN 'EXPIRED'
          -- No remaining volume (all allocated or expired)
          WHEN COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) = 0 THEN 'FULLY_ALLOCATED'
          -- Some bags allocated, some available
          WHEN COUNT(*) FILTER (WHERE mb.status = 'ALLOCATED') > 0 
               AND COALESCE(SUM(mb.volume) FILTER (WHERE mb.status = 'AVAILABLE'), 0) > 0 THEN 'PARTIALLY_ALLOCATED'
          -- Has available bags (default case)
          ELSE 'AVAILABLE'
        END
        FROM donations_rels dr
        INNER JOIN milk_bags mb ON dr.milk_bags_id = mb.id
        WHERE dr.parent_id = donation_record.donation_id
          AND mb.status != 'DISCARDED'
      ),
      updated_at = NOW()
    WHERE id = donation_record.donation_id;
    
    affected_donations := affected_donations + 1;
  END LOOP;
  
  -- Log the results
  RAISE NOTICE 'Updated % milk bags to EXPIRED status and recalculated % related donations', 
    affected_bags, affected_donations;
END;
$$;
