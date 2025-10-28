-- Create table for appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  location TEXT NOT NULL,
  observations TEXT,
  customer_phone TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert appointments (public booking form)
CREATE POLICY "Anyone can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to view appointments (for conflict checking)
CREATE POLICY "Anyone can view appointments"
ON public.appointments
FOR SELECT
USING (true);

-- Create index for faster date/time queries
CREATE INDEX idx_appointments_datetime ON public.appointments(appointment_date, appointment_time);

-- Create function to check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
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

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();