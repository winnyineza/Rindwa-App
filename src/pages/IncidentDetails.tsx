
import { useParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, AlertTriangle } from 'lucide-react';

export default function IncidentDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Incident Not Found</h3>
              <p className="text-gray-500">
                The incident with ID "{id}" could not be found or you don't have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
