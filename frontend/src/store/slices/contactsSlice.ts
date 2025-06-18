// @ts-nocheck - Disable TypeScript checking for this file temporarily
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contactsAPI, EmergencyContact } from '../../services/api';

interface ContactsState {
  contacts: EmergencyContact[];
  selectedContact: EmergencyContact | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactsAPI.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/create',
  async (data: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await contactsAPI.create(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create contact');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ contactId, data }: { 
    contactId: string; 
    data: Partial<EmergencyContact>; 
  }, { rejectWithValue }) => {
    try {
      const response = await contactsAPI.update(contactId, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update contact');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (contactId: string, { rejectWithValue }) => {
    try {
      await contactsAPI.delete(contactId);
      return contactId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete contact');
    }
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedContact: (state, action: PayloadAction<EmergencyContact | null>) => {
      state.selectedContact = action.payload;
    },
    clearContacts: (state) => {
      state.contacts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = action.payload;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Contact
      .addCase(createContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = [...state.contacts, action.payload];
        state.error = null;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Contact
      .addCase(updateContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = state.contacts.map(contact => 
          contact.id === action.payload.id ? action.payload : contact
        );
        if (state.selectedContact && state.selectedContact.id === action.payload.id) {
          state.selectedContact = action.payload;
        }
        state.error = null;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Contact
      .addCase(deleteContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
        if (state.selectedContact && state.selectedContact.id === action.payload) {
          state.selectedContact = null;
        }
        state.error = null;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedContact, clearContacts } = contactsSlice.actions;
export default contactsSlice.reducer;
