import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {incidentsAPI, healthAPI, Incident} from '../services/api';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      console.log('HomeScreen: Fetching incidents from API');
      const data = await incidentsAPI.getAll();
      console.log('HomeScreen: Received incidents:', data.length);
      setIncidents(data);
      setError(null);
    } catch (err: any) {
      console.error('HomeScreen: Error fetching incidents:', err);
      setError(err.response?.data?.error || 'Failed to load incidents');
      Alert.alert('Error', 'Failed to load incidents. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const checkBackendHealth = async () => {
    try {
      console.log('HomeScreen: Checking backend health');
      const health = await healthAPI.check();
      console.log('HomeScreen: Backend health:', health);
    } catch (err) {
      console.error('HomeScreen: Backend health check failed:', err);
      setError('Backend server is not available');
    }
  };

  useEffect(() => {
    console.log('HomeScreen: Component mounted');
    checkBackendHealth();
    fetchIncidents();
  }, []);

  const onRefresh = async () => {
    console.log('HomeScreen: Refreshing data');
    setRefreshing(true);
    await fetchIncidents();
    setRefreshing(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const handleVerifyIncident = async (incidentId: string) => {
    try {
      console.log('HomeScreen: Verifying incident:', incidentId);
      await incidentsAPI.verify(incidentId);
      Alert.alert('Success', 'Incident verified successfully!');
      fetchIncidents(); // Refresh the list
    } catch (err: any) {
      console.error('HomeScreen: Error verifying incident:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to verify incident');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rindwa App</Text>
          <Text style={styles.headerSubtitle}>Community Safety</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text style={styles.loadingText}>Loading incidents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rindwa App</Text>
        <Text style={styles.headerSubtitle}>Community Safety</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={20} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {incidents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="info" size={48} color="#95a5a6" />
            <Text style={styles.emptyText}>No incidents reported yet</Text>
            <Text style={styles.emptySubtext}>Be the first to report a safety concern</Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <TouchableOpacity 
              key={incident.id} 
              style={styles.incidentCard}
              onPress={() => handleVerifyIncident(incident.id)}>
              <View style={styles.incidentHeader}>
                <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(incident.priority)}]}>
                  <Text style={styles.priorityText}>{incident.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTimeAgo(incident.createdAt)}</Text>
              </View>
              
              <Text style={styles.incidentType}>{incident.type}</Text>
              <Text style={styles.incidentDescription}>{incident.description}</Text>
              
              <View style={styles.locationRow}>
                <Icon name="location-on" size={16} color="#666" />
                <Text style={styles.location}>{incident.location}</Text>
              </View>
              
              <View style={styles.verificationRow}>
                <Icon 
                  name={incident.verified ? "verified" : "pending"} 
                  size={16} 
                  color={incident.verified ? "#27ae60" : "#f39c12"} 
                />
                <Text style={styles.verificationText}>
                  {incident.verifications.length} verification{incident.verifications.length !== 1 ? 's' : ''}
                  {incident.verified ? ' • Verified' : ' • Pending'}
                </Text>
              </View>

              <View style={styles.reporterRow}>
                <Icon name="person" size={14} color="#666" />
                <Text style={styles.reporterText}>Reported by {incident.reporter.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    backgroundColor: '#e74c3c',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorText: {
    marginLeft: 8,
    color: '#e74c3c',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  incidentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});