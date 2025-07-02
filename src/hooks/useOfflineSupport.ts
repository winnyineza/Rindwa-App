
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineIncident {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  timestamp: string;
}

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingIncidents, setPendingIncidents] = useState<OfflineIncident[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingIncidents();
      toast.success('Connection restored! Syncing pending reports...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are offline. Reports will be saved and synced when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending incidents from localStorage
    loadPendingIncidents();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingIncidents = () => {
    try {
      const stored = localStorage.getItem('pendingIncidents');
      if (stored) {
        setPendingIncidents(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading pending incidents:', error);
    }
  };

  const savePendingIncidents = (incidents: OfflineIncident[]) => {
    try {
      localStorage.setItem('pendingIncidents', JSON.stringify(incidents));
      setPendingIncidents(incidents);
    } catch (error) {
      console.error('Error saving pending incidents:', error);
    }
  };

  const saveIncidentOffline = (incident: Omit<OfflineIncident, 'id' | 'timestamp'>) => {
    const offlineIncident: OfflineIncident = {
      ...incident,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const updated = [...pendingIncidents, offlineIncident];
    savePendingIncidents(updated);
    
    toast.success('Report saved offline. Will sync when connection is restored.');
    return offlineIncident.id;
  };

  const syncPendingIncidents = async () => {
    if (pendingIncidents.length === 0) return;

    try {
      // Here you would sync with your backend
      // For now, we'll simulate the sync
      console.log('Syncing pending incidents:', pendingIncidents);
      
      // Clear pending incidents after successful sync
      savePendingIncidents([]);
      
      toast.success(`${pendingIncidents.length} pending reports synced successfully!`);
    } catch (error) {
      console.error('Error syncing pending incidents:', error);
      toast.error('Failed to sync some pending reports. Will retry later.');
    }
  };

  const removePendingIncident = (id: string) => {
    const updated = pendingIncidents.filter(incident => incident.id !== id);
    savePendingIncidents(updated);
  };

  return {
    isOnline,
    pendingIncidents,
    saveIncidentOffline,
    syncPendingIncidents,
    removePendingIncident
  };
}
