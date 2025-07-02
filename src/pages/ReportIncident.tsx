import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { smsService } from '@/services/smsService';
import { Navigation } from '@/components/Navigation';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { BottomNavigation } from '@/components/home/BottomNavigation';

type IncidentCategory = Database['public']['Enums']['incident_category'];

export default function ReportIncident() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sendSMSAlert, setSendSMSAlert] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IncidentCategory | '',
    location_address: '',
    latitude: '',
    longitude: '',
    image_url: ''
  });

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const sendEmergencyAlerts = async (incidentId: string) => {
    if (!sendSMSAlert) return;

    try {
      // Get emergency contacts for SMS alerts
      const { data: emergencyContacts } = await supabase
        .from('emergency_contacts')
        .select('phone, name')
        .eq('user_id', user?.id);

      if (emergencyContacts && emergencyContacts.length > 0) {
        const location = formData.location_address || `${formData.latitude}, ${formData.longitude}`;
        
        for (const contact of emergencyContacts) {
          await smsService.sendIncidentAlert(
            contact.phone,
            formData.title,
            location
          );
        }
        
        toast.success(`Emergency alerts sent to ${emergencyContacts.length} contacts`);
      }

      // Send push notifications to relevant responders
      const { error: notificationError } = await supabase.functions.invoke('send-notification', {
        body: {
          title: '🚨 New Emergency Incident',
          body: `${formData.title} - ${formData.location_address}`,
          category: formData.category,
          incidentId: incidentId
        }
      });

      if (notificationError) {
        console.error('Error sending push notifications:', notificationError);
      }
    } catch (error) {
      console.error('Error sending emergency alerts:', error);
      toast.error('Failed to send some emergency alerts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error('You must be logged in to report an incident');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting incident with user ID:', user.id);
      
      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category as IncidentCategory,
          location_address: formData.location_address || null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          image_url: formData.image_url || null,
          reporter_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting incident:', error);
        throw error;
      }

      // Send emergency alerts
      if (incident)
        await sendEmergencyAlerts(incident.id);

      toast.success('Incident reported successfully! Emergency responders have been notified.');
      navigate('/');
    } catch (error) {
      console.error('Error reporting incident:', error);
      toast.error('Failed to report incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast.success('Location captured successfully!');
        },
        () => {
          toast.error('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-white">
              <AlertCircle className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
              Report Emergency Incident
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Incident Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the incident"
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: IncidentCategory) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select incident category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectItem value="fire" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Fire Emergency</SelectItem>
                    <SelectItem value="medical" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Medical Emergency</SelectItem>
                    <SelectItem value="accident" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Traffic Accident</SelectItem>
                    <SelectItem value="security" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Security Incident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed information about the incident..."
                  rows={4}
                  required
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Incident Photo</Label>
                <ImageUpload
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  currentImage={formData.image_url}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 dark:text-gray-300">Location Information</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    className="flex items-center bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Get Current Location
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_address" className="text-gray-700 dark:text-gray-300">Address</Label>
                  <Input
                    id="location_address"
                    value={formData.location_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                    placeholder="Street address or landmark"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-gray-700 dark:text-gray-300">Latitude</Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="e.g., -1.2921"
                      type="number"
                      step="any"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-gray-700 dark:text-gray-300">Longitude</Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="e.g., 36.8219"
                      type="number"
                      step="any"
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendSMS"
                  checked={sendSMSAlert}
                  onCheckedChange={(checked) => setSendSMSAlert(checked as boolean)}
                  className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-red-600 dark:data-[state=checked]:bg-red-500"
                />
                <Label htmlFor="sendSMS" className="flex items-center text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4 mr-1" />
                  Send emergency alerts to my contacts
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                disabled={isLoading || !formData.title || !formData.description || !formData.category}
              >
                {isLoading ? 'Reporting...' : 'Report Incident'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
