import { Alert } from 'react-native';

/**
 * Service to handle Phone and Email verification.
 * For now, it uses a Mock system for SMS (Termii) until API keys are configured.
 */
class VerificationService {
  private mockOtp: string = '';
  private emailOtp: string = '';

  /**
   * Generates a 6-digit OTP and "sends" it via SMS.
   */
  async sendSmsOtp(phone: string): Promise<boolean> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.mockOtp = code;

      console.log(`[VERIFICATION] Sending SMS OTP ${code} to ${phone}`);
      
      Alert.alert(
        "Phone Verification",
        `Your A-Transfer code is: ${code}. (Sent to ${phone})`,
        [{ text: "OK" }]
      );

      return true;
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      return false;
    }
  }

  /**
   * Generates a 6-digit OTP and "sends" it via Email.
   */
  async sendEmailOtp(email: string): Promise<boolean> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.emailOtp = code;

      console.log(`[VERIFICATION] Sending Email OTP ${code} to ${email}`);
      
      Alert.alert(
        "Email Verification",
        `Your A-Transfer login code is: ${code}. (Sent to your email: ${email})`,
        [{ text: "OK" }]
      );

      return true;
    } catch (error) {
      console.error('Error sending Email OTP:', error);
      return false;
    }
  }

  verifySmsOtp(enteredCode: string): boolean {
    return enteredCode === this.mockOtp;
  }

  verifyEmailOtp(enteredCode: string): boolean {
    return enteredCode === this.emailOtp;
  }
}

export const verificationService = new VerificationService();
