-- Fix function search_path security warning
DROP FUNCTION IF EXISTS check_appointment_conflict(DATE, TIME, INTEGER, UUID);

CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count INTEGER;
  new_start_time TIMESTAMP;
  new_end_time TIMESTAMP;
BEGIN
  -- Create timestamps for the new appointment
  new_start_time := (p_date || ' ' || p_time)::TIMESTAMP;
  new_end_time := new_start_time + (p_duration || ' minutes')::INTERVAL;
  
  -- Check for overlapping appointments
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE 
    status != 'cancelled'
    AND (p_appointment_id IS NULL OR id != p_appointment_id)
    AND (
      -- New appointment starts during existing appointment
      (new_start_time >= (appointment_date || ' ' || appointment_time)::TIMESTAMP
       AND new_start_time < (appointment_date || ' ' || appointment_time)::TIMESTAMP + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment ends during existing appointment
      (new_end_time > (appointment_date || ' ' || appointment_time)::TIMESTAMP
       AND new_end_time <= (appointment_date || ' ' || appointment_time)::TIMESTAMP + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- New appointment completely contains existing appointment
      (new_start_time <= (appointment_date || ' ' || appointment_time)::TIMESTAMP
       AND new_end_time >= (appointment_date || ' ' || appointment_time)::TIMESTAMP + (duration_minutes || ' minutes')::INTERVAL)
    );
  
  RETURN conflict_count > 0;
END;
$$;