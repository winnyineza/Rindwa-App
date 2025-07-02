
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ThumbsUp, User } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Incident = Database['public']['Tables']['incidents']['Row'];
type IncidentCategory = Database['public']['Enums']['incident_category'];
type IncidentStatus = Database['public']['Enums']['incident_status'];

interface IncidentCardProps {
  incident: Incident & { profiles: { full_name: string } | null };
  getCategoryColor: (category: IncidentCategory) => string;
  getStatusColor: (status: IncidentStatus) => string;
}

export function IncidentCard({ incident, getCategoryColor, getStatusColor }: IncidentCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Link to={`/incident/${incident.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        {incident.image_url && (
          <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            <img 
              src={incident.image_url} 
              alt={incident.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {incident.title}
            </CardTitle>
            <div className="flex gap-1 ml-2">
              <Badge className={`${getCategoryColor(incident.category)} text-white`}>
                {incident.category}
              </Badge>
              <Badge className={`${getStatusColor(incident.status)} text-white`}>
                {incident.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {incident.description}
          </p>
          
          <div className="space-y-2">
            {incident.location_address && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{incident.location_address}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDate(incident.created_at!)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{incident.upvotes || 0}</span>
                </div>
                
                {incident.profiles && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span className="truncate max-w-20">{incident.profiles.full_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
