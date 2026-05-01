import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

console.log('--- NOTIFICATIONS UTILITY LOADED ---', Platform.OS);

export interface AppNotification {
  id?: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  data?: any;
}

export const sendLocalNotificationSafe = async (title: string, body: string, data?: any) => {
  const isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    console.log('[WEB NOTIFY]', title, body);
    return true;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: data || {},
      },
      trigger: null, // trigger instantly
    });
    console.log('Local notification scheduled:', title);
    return true;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return false;
  }
};

/**
 * Sends a notification to a specific user by adding it to their Firestore notifications collection.
 * This will trigger their real-time listener and pop up a local notification.
 */
export const sendPushNotificationToUser = async (userId: string, title: string, body: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', data?: any) => {
  try {
    if (!userId) return false;
    
    const notifRef = collection(db, 'users', userId, 'notifications');
    const newNotifDoc = doc(notifRef);
    
    await setDoc(newNotifDoc, {
      id: newNotifDoc.id,
      title,
      message: body,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      data: data || {}
    });
    
    console.log(`Notification sent to user ${userId}: ${title}`);
    return true;
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return false;
  }
};

