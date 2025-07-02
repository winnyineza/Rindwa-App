
-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('police', 'fire', 'medical', 'other')),
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to reference organizations instead of departments
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS department,
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Super admins can manage organizations" ON public.organizations;
CREATE POLICY "Super admins can manage organizations" ON public.organizations
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Authenticated users can view organizations" ON public.organizations;
CREATE POLICY "Authenticated users can view organizations" ON public.organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable RLS on incidents table if not already enabled
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Drop and recreate incident policies to avoid conflicts
DROP POLICY IF EXISTS "All authenticated users can view incidents" ON public.incidents;
CREATE POLICY "All authenticated users can view incidents" ON public.incidents
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can create incidents" ON public.incidents;
CREATE POLICY "Users can create incidents" ON public.incidents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update incidents" ON public.incidents;
CREATE POLICY "Admins can update incidents" ON public.incidents
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'moderator') OR
    public.has_role(auth.uid(), 'police') OR
    public.has_role(auth.uid(), 'fire_dept') OR
    public.has_role(auth.uid(), 'medical_staff')
  );

-- Update role permissions for organizations
INSERT INTO public.role_permissions (role, permission, resource_type) VALUES
('super_admin', 'manage_organizations', 'organization'),
('moderator', 'view_organizations', 'organization')
ON CONFLICT (role, permission, resource_type) DO NOTHING;
