-- ============================================-- Database Schema Update-- ============================================-- Add new fields to trips tableALTER TABLE public.trips ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS destination TEXT;

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2);

ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create notifications tableCREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trip_invitation', 'trip_update', 'friend_request', 'friend_accepted', 'system')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for notifications tableCREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(user_id, created_at);

-- Create policies for notifications tableCREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestampCREATE OR REPLACE FUNCTION public.handle_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications tableCREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.handle_notifications_updated_at();

-- Enable RLS for notifications tableALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;