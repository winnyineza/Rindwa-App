import { Shield } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo and App Name */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Shield className="h-24 w-24 text-red-600 animate-pulse" />
            <div className="absolute inset-0 bg-red-600 opacity-20 rounded-full animate-ping"></div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rindwa App</h1>
        <p className="text-lg text-gray-600 mb-8">Community Emergency Reporting</p>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}
