
-- Create a table to store FCM tokens for push notifications
CREATE TABLE public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_created BOOLEAN DEFAULT TRUE,
  incident_verified BOOLEAN DEFAULT TRUE,
  incident_resolved BOOLEAN DEFAULT TRUE,
  nearby_incidents BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fcm_tokens
CREATE POLICY "Users can manage their own FCM tokens" ON public.fcm_tokens
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create notification preferences
CREATE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notifications();
