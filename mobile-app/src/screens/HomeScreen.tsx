import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Incident {
  id: string;
  type: string;
  description: string;
  location: string;
  timestamp: Date;
  verifications: number;
  verified: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [incidents] = useState<Incident[]>([
    {
      id: '1',
      type: 'Emergency',
      description: 'Medical emergency reported at downtown area',
      location: 'Main Street & 5th Ave',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      verifications: 3,
      verified: true,
      priority: 'high',
    },
    {
      id: '2',
      type: 'Safety Concern',
      description: 'Broken streetlight creating unsafe conditions',
      location: 'Oak Street',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      verifications: 1,
      verified: false,
      priority: 'medium',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const diff = Date.now() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Safety</Text>
        <Text style={styles.headerSubtitle}>Recent Incidents</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {incidents.map((incident) => (
          <TouchableOpacity key={incident.id} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(incident.priority)}]}>
                <Text style={styles.priorityText}>{incident.priority.toUpperCase()}</Text>
              </View>
              <Text style={styles.timestamp}>{formatTimeAgo(incident.timestamp)}</Text>
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
                {incident.verifications} verification{incident.verifications !== 1 ? 's' : ''}
                {incident.verified ? ' • Verified' : ' • Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  content: {
    flex: 1,
    padding: 16,
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
  },
  verificationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});