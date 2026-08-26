import * as Biometrics from 'expo-biometrics';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometryType?: Biometrics.BiometryType;
}

class BiometricService {
  private static instance: BiometricService;

  private constructor() {}

  public static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is available
   */
  public async isAvailable(): Promise<boolean> {
    try {
      const { available } = await Biometrics.hasHardwareAsync();
      return available;
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  /**
   * Get the type of biometric authentication available
   */
  public async getBiometryType(): Promise<Biometrics.BiometryType | null> {
    try {
      const { biometryType } = await Biometrics.getEnrolledHardwareAsync();
      return biometryType;
    } catch (error) {
      console.error('Failed to get biometry type:', error);
      return null;
    }
  }

  /**
   * Authenticate user with biometrics
   */
  public async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      const biometryType = await this.getBiometryType();
      
      const promptOptions: Biometrics.BiometricPromptOptions = {
        title: 'Biometric Authentication',
        subtitle: 'Verify your identity',
        description: promptMessage || 'Use your biometric credential to authenticate',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Passcode',
      };

      const result = await Biometrics.authenticateAsync(promptOptions);

      if (result.success) {
        return {
          success: true,
          biometryType,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
          biometryType,
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Save secure data after biometric authentication
   */
  public async saveSecureData(key: string, value: string): Promise<boolean> {
    try {
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return false;
      }

      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Failed to save secure data:', error);
      return false;
    }
  }

  /**
   * Retrieve secure data with biometric authentication
   */
  public async getSecureData(key: string): Promise<string | null> {
    try {
      const authResult = await this.authenticate();
      if (!authResult.success) {
        return null;
      }

      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  /**
   * Delete secure data
   */
  public async deleteSecureData(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Failed to delete secure data:', error);
      return false;
    }
  }

  /**
   * Get biometric type name for display
   */
  public getBiometryTypeName(type: Biometrics.BiometryType): string {
    switch (type) {
      case Biometrics.BiometryType.FACE:
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case Biometrics.BiometryType.TOUCH:
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case Biometrics.BiometryType.IRIS:
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  }
}

export const biometricService = BiometricService.getInstance();
export default biometricService;
