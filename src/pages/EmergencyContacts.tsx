import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BottomNavigation } from '@/components/home/BottomNavigation';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
}

export default function EmergencyContacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmergencyContact[];
    },
    enabled: !!user
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: typeof newContact) => {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship || null,
          user_id: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      setNewContact({ name: '', phone: '', relationship: '' });
      setIsAdding(false);
      toast.success('Contact added successfully!');
    },
    onError: () => {
      toast.error('Failed to add contact. Please try again.');
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast.success('Contact deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete contact. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMutation.mutate(newContact);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your emergency contact information</p>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-gray-900 dark:text-white">Add New Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Name *</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Contact name"
                      required
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      type="tel"
                      required
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship" className="text-gray-700 dark:text-gray-300">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Family, Friend, Colleague"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={addContactMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
                  >
                    {addContactMutation.isPending ? 'Adding...' : 'Add Contact'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card key={contact.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-red-600 dark:bg-red-500 rounded-full flex items-center justify-center mr-3">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                        {contact.relationship && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contact.relationship}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteContactMutation.mutate(contact.id)}
                      disabled={deleteContactMutation.isPending}
                      className="hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                  <div className="text-sm">
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Phone className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Emergency Contacts</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add emergency contacts to quickly reach help when needed.
              </p>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
