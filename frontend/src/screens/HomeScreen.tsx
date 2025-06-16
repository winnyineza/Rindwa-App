import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { showMessage } from 'react-native-flash-message';

import { incidentsAPI, healthAPI, Incident } from '../services/api';
import { RootState } from '../store';
import SkeletonPlaceholder from '../components/SkeletonPlaceholder';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch incidents with React Query
  const {
    data: incidentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsAPI.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: () => healthAPI.check(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Verify incident mutation
  const verifyMutation = useMutation({
    mutationFn: (incidentId: string) => incidentsAPI.verify(incidentId),
    onSuccess: (data) => {
      showMessage({
        message: 'Success!',
        description: 'Incident verified successfully',
        type: 'success',
      });
      // Invalidate and refetch incidents
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (error: any) => {
      showMessage({
        message: 'Error',
        description: error.message || 'Failed to verify incident',
        type: 'danger',
      });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'help';
    }
  };

  const handleVerifyIncident = (incidentId: string) => {
    Alert.alert(
      'Verify Incident',
      'Are you sure you want to verify this incident?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Verify', onPress: () => verifyMutation.mutate(incidentId) },
      ]
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <SkeletonPlaceholder key={item}>
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonBadge} />
              <View style={styles.skeletonTime} />
            </View>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonDescription} />
            <View style={styles.skeletonLocation} />
          </View>
        </SkeletonPlaceholder>
      ))}
    </View>
  );

  const renderIncidentCard = (incident: Incident) => (
    <TouchableOpacity 
      key={incident.id} 
      style={styles.incidentCard}
      onPress={() => handleVerifyIncident(incident.id)}
      activeOpacity={0.7}>
      <View style={styles.incidentHeader}>
        <View style={[styles.priorityBadge, {backgroundColor: getPriorityColor(incident.priority)}]}>
          <Icon name={getPriorityIcon(incident.priority)} size={16} color="white" />
          <Text style={styles.priorityText}>{incident.priority.toUpperCase()}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTimeAgo(incident.createdAt)}</Text>
      </View>
      
      <Text style={styles.incidentType}>{incident.type}</Text>
      <Text style={styles.incidentDescription} numberOfLines={3}>
        {incident.description}
      </Text>
      
      <View style={styles.locationRow}>
        <Icon name="location-on" size={16} color="#666" />
        <Text style={styles.location} numberOfLines={1}>{incident.location}</Text>
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

      {verifyMutation.isPending && (
        <View style={styles.verifyingOverlay}>
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rindwa App</Text>
          <Text style={styles.headerSubtitle}>Community Safety</Text>
        </View>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rindwa App</Text>
          <Text style={styles.headerSubtitle}>Community Safety</Text>
        </View>
        {user && (
          <View style={styles.userInfo}>
            <Icon name="person" size={20} color="white" />
            <Text style={styles.userName}>{user.name}</Text>
          </View>
        )}
      </View>

      {healthData && (
        <View style={styles.healthIndicator}>
          <Icon name="check-circle" size={16} color="#27ae60" />
          <Text style={styles.healthText}>System Online</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={20} color="#e74c3c" />
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Failed to load incidents'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        
        {incidentsData?.data && incidentsData.data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="info" size={64} color="#95a5a6" />
            <Text style={styles.emptyText}>No incidents reported yet</Text>
            <Text style={styles.emptySubtext}>Be the first to report a safety concern</Text>
          </View>
        ) : (
          incidentsData?.data.map(renderIncidentCard)
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  healthText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f2',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    flex: 1,
    color: '#e74c3c',
    marginLeft: 8,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  skeletonTime: {
    width: 60,
    height: 16,
    borderRadius: 8,
  },
  skeletonTitle: {
    width: '70%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonDescription: {
    width: '100%',
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLocation: {
    width: '50%',
    height: 16,
    borderRadius: 4,
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
    color: '#95a5a6',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    lineHeight: 20,
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  incidentType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  verifyingText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
});