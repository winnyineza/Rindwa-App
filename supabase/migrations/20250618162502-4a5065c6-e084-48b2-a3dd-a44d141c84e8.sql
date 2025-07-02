
-- First, let's update the user roles enum to match your specifications
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'responder';

-- Update the profiles table to include role-specific metadata
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS assigned_categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create a table to track role assignments and permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission TEXT NOT NULL,
  resource_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission, resource_type)
);

-- Insert default permissions for each role
INSERT INTO public.role_permissions (role, permission, resource_type) VALUES
-- Regular User permissions
('user', 'view_incidents', 'incident'),
('user', 'create_incident', 'incident'),
('user', 'upvote_incident', 'incident'),
('user', 'comment_incident', 'incident'),
('user', 'manage_emergency_contacts', 'contact'),
('user', 'edit_profile', 'profile'),
('user', 'receive_notifications', 'notification'),

-- Police permissions
('police', 'view_incidents_filtered', 'incident'),
('police', 'verify_incident', 'incident'),
('police', 'resolve_incident', 'incident'),
('police', 'comment_incident', 'incident'),
('police', 'view_basic_analytics', 'analytics'),

-- Fire Department permissions
('fire_dept', 'view_incidents_filtered', 'incident'),
('fire_dept', 'verify_incident', 'incident'),
('fire_dept', 'resolve_incident', 'incident'),
('fire_dept', 'comment_incident', 'incident'),
('fire_dept', 'view_basic_analytics', 'analytics'),

-- Medical Staff permissions
('medical_staff', 'view_incidents_filtered', 'incident'),
('medical_staff', 'verify_incident', 'incident'),
('medical_staff', 'resolve_incident', 'incident'),
('medical_staff', 'comment_incident', 'incident'),
('medical_staff', 'view_basic_analytics', 'analytics'),

-- Moderator permissions (broader access)
('moderator', 'view_all_incidents', 'incident'),
('moderator', 'verify_incident', 'incident'),
('moderator', 'resolve_incident', 'incident'),
('moderator', 'comment_incident', 'incident'),
('moderator', 'edit_incident', 'incident'),
('moderator', 'view_analytics', 'analytics'),
('moderator', 'view_users', 'user'),

-- Super Admin permissions
('super_admin', 'full_access', 'all'),
('super_admin', 'manage_users', 'user'),
('super_admin', 'assign_roles', 'role'),
('super_admin', 'view_logs', 'system'),
('super_admin', 'manage_categories', 'category')
ON CONFLICT (role, permission, resource_type) DO NOTHING;

-- Update the can_access_incident_category function to be more flexible
CREATE OR REPLACE FUNCTION public.can_access_incident_category(_user_id UUID, _category incident_category)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN public.has_role(_user_id, 'super_admin') THEN TRUE
      WHEN public.has_role(_user_id, 'moderator') THEN TRUE
      WHEN public.has_role(_user_id, 'police') AND _category IN ('accident', 'security') THEN TRUE
      WHEN public.has_role(_user_id, 'fire_dept') AND _category = 'fire' THEN TRUE
      WHEN public.has_role(_user_id, 'medical_staff') AND _category = 'medical' THEN TRUE
      WHEN public.has_role(_user_id, 'user') THEN TRUE
      ELSE FALSE
    END
$$;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT, _resource_type TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.role_permissions rp ON rp.role = p.role
    WHERE p.id = _user_id
      AND (rp.permission = _permission OR rp.permission = 'full_access')
      AND (rp.resource_type = _resource_type OR rp.resource_type = 'all' OR _resource_type IS NULL)
  )
$$;

-- Enable RLS on role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for role_permissions (only super_admin can manage)
CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create policy for viewing role permissions (authenticated users can view)
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL);
