CREATE INDEX address_coordinates_idx 
ON public.addresses USING GIST (coordinates);