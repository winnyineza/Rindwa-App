
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Clock, ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

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

interface IncidentFeedProps {
  incidents: IncidentWithProfile[];
}

export function IncidentFeed({ incidents }: IncidentFeedProps) {
  const navigate = useNavigate();

  const getCategoryColor = (category: IncidentCategory): string => {
    switch (category) {
      case 'fire': return 'bg-red-600';
      case 'medical': return 'bg-blue-600';
      case 'accident': return 'bg-orange-600';
      case 'security': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Unknown time';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getDistanceText = () => {
    // Mock distance calculation - in real app this would use user's location
    const distances = ['0.5km', '1.2km', '2.1km', '3.4km', '0.8km'];
    return distances[Math.floor(Math.random() * distances.length)] + ' from you';
  };

  return (
    <div className="p-4 pb-24">
      {incidents.length > 0 ? (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image Thumbnail */}
              {incident.image_url && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={incident.image_url} 
                    alt={incident.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                {/* Header with title and timestamp */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg flex-1 pr-2">
                    {incident.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {getTimeAgo(incident.created_at)}
                  </div>
                </div>

                {/* Location and distance */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="mr-2">{incident.location_address || 'Location not specified'}</span>
                  <span className="text-blue-600 font-medium">• {getDistanceText()}</span>
                </div>

                {/* Category tags */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${getCategoryColor(incident.category)} text-white text-xs px-2 py-1`}>
                    {incident.category.toUpperCase()}
                  </Badge>
                  {incident.status === 'verified' && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-1">
                      VERIFIED
                    </Badge>
                  )}
                </div>

                {/* Description preview */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {incident.description}
                </p>

                {/* Action bar */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    {/* Upvote button */}
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm font-medium">{incident.upvotes || 0}</span>
                    </button>
                    
                    {/* Comment button */}
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>

                  {/* View Details button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/incident/${incident.id}`)}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Incidents</h3>
          <p className="text-gray-500">
            All incidents in your area have been resolved.
          </p>
        </div>
      )}
    </div>
  );
}
