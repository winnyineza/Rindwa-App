
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('super_admin', 'police', 'fire_dept', 'medical_staff', 'moderator', 'user');

-- Create enum for incident categories
CREATE TYPE public.incident_category AS ENUM ('fire', 'accident', 'medical', 'security');

-- Create enum for incident status
CREATE TYPE public.incident_status AS ENUM ('pending', 'verified', 'resolved');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category incident_category NOT NULL,
  status incident_status NOT NULL DEFAULT 'pending',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_address TEXT,
  image_url TEXT,
  video_url TEXT,
  upvotes INTEGER DEFAULT 0,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upvotes table
CREATE TABLE public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(incident_id, user_id)
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  incident_id UUID REFERENCES public.incidents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Create function to check if user can access incident category
CREATE OR REPLACE FUNCTION public.can_access_incident_category(_user_id UUID, _category incident_category)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(_user_id, 'super_admin') THEN TRUE
      WHEN public.has_role(_user_id, 'police') AND _category IN ('accident', 'security') THEN TRUE
      WHEN public.has_role(_user_id, 'fire_dept') AND _category = 'fire' THEN TRUE
      WHEN public.has_role(_user_id, 'medical_staff') AND _category = 'medical' THEN TRUE
      WHEN public.has_role(_user_id, 'moderator') THEN TRUE
      WHEN public.has_role(_user_id, 'user') THEN TRUE
      ELSE FALSE
    END
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for incidents
CREATE POLICY "Users can view incidents they can access" ON public.incidents
  FOR SELECT USING (
    public.can_access_incident_category(auth.uid(), category)
  );

CREATE POLICY "Users can create incidents" ON public.incidents
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins and role-specific users can update incidents" ON public.incidents
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.can_access_incident_category(auth.uid(), category)
  );

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible incidents" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.incidents 
      WHERE id = incident_id 
      AND public.can_access_incident_category(auth.uid(), category)
    )
  );

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for upvotes
CREATE POLICY "Users can view upvotes on accessible incidents" ON public.upvotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.incidents 
      WHERE id = incident_id 
      AND public.can_access_incident_category(auth.uid(), category)
    )
  );

CREATE POLICY "Users can create upvotes" ON public.upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" ON public.upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emergency contacts
CREATE POLICY "Users can manage their own emergency contacts" ON public.emergency_contacts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for activity logs
CREATE POLICY "Super admins can view all activity logs" ON public.activity_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create trigger function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'user'
  );
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update incident upvote count
CREATE OR REPLACE FUNCTION public.update_incident_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.incidents 
    SET upvotes = upvotes + 1 
    WHERE id = NEW.incident_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.incidents 
    SET upvotes = upvotes - 1 
    WHERE id = OLD.incident_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for upvote counting
CREATE TRIGGER update_upvotes_on_insert
  AFTER INSERT ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_incident_upvotes();

CREATE TRIGGER update_upvotes_on_delete
  AFTER DELETE ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_incident_upvotes();
