
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail } from 'lucide-react';

export default function AdminCommunications() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">SMS Logs (Twilio)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p>SMS communication logs</p>
              <p className="text-sm">Track emergency SMS delivery</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Push Notification Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p>Push notification tracking</p>
              <p className="text-sm">Monitor FCM delivery status</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
