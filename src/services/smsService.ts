interface SMSService {
  sendSMS: (phoneNumber: string, message: string) => Promise<boolean>;
  sendIncidentAlert: (phoneNumber: string, incidentTitle: string, location: string) => Promise<boolean>;
}

class TwilioSMSService implements SMSService {
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendIncidentAlert(phoneNumber: string, incidentTitle: string, location: string): Promise<boolean> {
    const message = `🚨 EMERGENCY ALERT: ${incidentTitle}. Location: ${location}. Please respond if you're a first responder. - Rindwa App`;
    return this.sendSMS(phoneNumber, message);
  }
}

export const smsService = new TwilioSMSService();
