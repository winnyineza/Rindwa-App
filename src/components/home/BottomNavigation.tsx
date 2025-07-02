
import { Home, Plus, AlertTriangle, Phone, User } from 'lucide-react';

export function BottomNavigation() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around py-2">
        <button className="flex flex-col items-center py-2 px-4">
          <Home className="h-6 w-6 text-red-600" />
          <span className="text-xs font-medium text-red-600">Home</span>
        </button>
        
        <button 
          className="flex flex-col items-center py-2 px-4"
          onClick={() => window.location.href = '/report'}
        >
          <Plus className="h-6 w-6 text-gray-500" />
          <span className="text-xs text-gray-500">Report</span>
        </button>

        <button 
          className="flex flex-col items-center py-2 px-4 bg-red-600 rounded-full mx-2"
          onClick={() => window.location.href = '/report'}
        >
          <AlertTriangle className="h-6 w-6 text-white" />
        </button>

        <button 
          className="flex flex-col items-center py-2 px-4"
          onClick={() => window.location.href = '/emergency-contacts'}
        >
          <Phone className="h-6 w-6 text-gray-500" />
          <span className="text-xs text-gray-500">Contacts</span>
        </button>

        <button 
          className="flex flex-col items-center py-2 px-4"
          onClick={() => window.location.href = '/profile'}
        >
          <User className="h-6 w-6 text-gray-500" />
          <span className="text-xs text-gray-500">Profile</span>
        </button>
      </div>
    </div>
  );
}
