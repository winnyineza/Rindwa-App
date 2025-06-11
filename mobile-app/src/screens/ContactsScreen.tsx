import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'John Smith',
      phone: '+1 (555) 123-4567',
      relationship: 'Father',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      relationship: 'Friend',
      isPrimary: false,
    },
  ]);

  const handleCall = (contact: EmergencyContact) => {
    Alert.alert(
      'Call Emergency Contact',
      `Call ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Calling ${contact.phone}`) },
      ]
    );
  };

  const handleEditContact = (contact: EmergencyContact) => {
    Alert.alert('Edit Contact', 'Contact editing feature coming soon!');
  };

  const handleAddContact = () => {
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: 'New Contact',
      phone: '+1 (555) 000-0000',
      relationship: 'Friend',
      isPrimary: false,
    };
    setContacts([...contacts, newContact]);
  };

  const renderContact = ({item}: {item: EmergencyContact}) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}
        </View>
        <Text style={styles.contactPhone}>{item.phone}</Text>
        <Text style={styles.contactRelationship}>{item.relationship}</Text>
      </View>
      
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item)}>
          <Icon name="call" size={20} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditContact(item)}>
          <Icon name="edit" size={18} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>Quick access to your emergency contacts</Text>
      </View>

      <View style={styles.content}>
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Icon name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>
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
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#999',
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#27ae60',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});