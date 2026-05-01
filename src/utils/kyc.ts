import * as ImagePicker from 'expo-image-picker';
import { storage, auth } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert } from 'react-native';

export const requestCameraPermissions = async (needsCamera: boolean) => {
  if (needsCamera) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }
};

export const pickImage = async (useCamera: boolean = false) => {
  const hasPermission = await requestCameraPermissions(useCamera);
  if (!hasPermission) {
    Alert.alert(
      'Permission Required', 
      `We need ${useCamera ? 'camera' : 'gallery'} permissions to proceed with KYC.`
    );
    return null;
  }

  try {
    let result;
    
    // We use a flexible options object to avoid "undefined" property crashes on different Expo versions
    const options: any = {
      quality: 0.8,
      allowsEditing: false,
    };

    if (useCamera) {
      console.log('Attempting to launch camera...');
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      console.log('Attempting to launch gallery...');
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    console.log('Picker result:', result ? 'Success' : 'No result');

    if (result && !result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
  } catch (error: any) {
    console.error('ImagePicker Error:', error);
    Alert.alert('Camera Error', `Could not open ${useCamera ? 'camera' : 'gallery'}: ${error.message || 'Check permissions'}`);
  }
  return null;
};

export const uploadKYCDocument = async (uri: string, folder: string, fileName: string) => {
  if (!auth.currentUser) throw new Error('Not authenticated');

  try {
    // Robust Blob creation for React Native to prevent storage/unknown errors
    const blob: any = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.error('XHR Error:', e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    
    const fileRef = ref(storage, `kyc/${auth.currentUser.uid}/${folder}/${fileName}`);
    await uploadBytes(fileRef, blob);
    
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
