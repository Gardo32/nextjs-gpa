CREATE OR REPLACE FUNCTION public.create_gpa_records_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gpa_records') THEN
    -- Create the gpa_records table
    CREATE TABLE public.gpa_records (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID NOT NULL,
      subjects JSONB NOT NULL,
      total_hours NUMERIC(5,2) NOT NULL,
      total_grade_points NUMERIC(7,2) NOT NULL,
      gpa NUMERIC(3,2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create an index on user_id for faster queries
    CREATE INDEX idx_gpa_records_user_id ON public.gpa_records(user_id);

    -- Set up Row Level Security (RLS)
    ALTER TABLE public.gpa_records ENABLE ROW LEVEL SECURITY;

    -- Create a policy that allows users to insert and select only their own records
    CREATE POLICY gpa_records_policy ON public.gpa_records
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_gpa_records_table() TO authenticated;