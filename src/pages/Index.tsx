
import { Navigation } from '@/components/Navigation';
import { LocationSection } from '@/components/home/LocationSection';
import { IncidentFeed } from '@/components/home/IncidentFeed';
import { ReportButton } from '@/components/home/ReportButton';
import { BottomNavigation } from '@/components/home/BottomNavigation';
import { PWAPrompt } from '@/components/PWAPrompt';
import { useAutoLocation } from '@/hooks/useAutoLocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type IncidentCategory = Database['public']['Enums']['incident_category'];
type IncidentStatus = Database['public']['Enums']['incident_status'];

interface IncidentWithProfile {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  status: IncidentStatus;
  location_address: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  video_url: string | null;
  upvotes: number | null;
  reporter_id: string | null;
  verified_by: string | null;
  resolved_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  profiles: { full_name: string } | null;
}

export default function Index() {
  const { location, isLoading: locationLoading, refreshLocation } = useAutoLocation();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      let query = supabase
        .from('incidents')
        .select(`
          id,
          title,
          description,
          category,
          status,
          location_address,
          latitude,
          longitude,
          image_url,
          video_url,
          upvotes,
          reporter_id,
          verified_by,
          resolved_by,
          created_at,
          updated_at,
          profiles!reporter_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map(incident => ({
        ...incident,
        profiles: incident.profiles && typeof incident.profiles === 'object' && 'full_name' in incident.profiles 
          ? { full_name: (incident.profiles as { full_name: string }).full_name } 
          : null
      })) as IncidentWithProfile[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="container mx-auto px-4">
        <LocationSection 
          currentLocation={locationLoading ? 'Getting your location...' : location.address}
          onLocationRefresh={refreshLocation}
        />
        
        <IncidentFeed incidents={incidents} />
        
        <ReportButton />
      </div>
      
      <BottomNavigation />
      <PWAPrompt />
    </div>
  );
}
