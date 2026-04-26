import React from 'react';
import { View, Text, Modal, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { ShieldAlert, CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

interface AppAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const AppAlert = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText
}: AppAlertProps) => {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 color="#76b33a" size={32} />;
      case 'error': return <ShieldAlert color="#EF4444" size={32} />;
      case 'warning': return <AlertCircle color="#EAB308" size={32} />;
      case 'info': return <Info color="#76b33a" size={32} />;
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <Animated.View 
          entering={ZoomIn.duration(300)}
          className="w-full bg-surface border border-slate-100 rounded-[32px] p-8 overflow-hidden"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}
        >
          <View className="items-center mb-6">
            <View className={`p-4 rounded-2xl mb-4 bg-primary`}>
              {getIcon()}
            </View>
            <Text className="text-slate-900 text-xl font-bold text-center">{title}</Text>
          </View>
          
          <Text className="text-slate-600 text-center leading-6 mb-8">{message}</Text>
          
          <View className="flex-row space-x-3">
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel}
                className="flex-1 py-4 rounded-2xl bg-slate-100 items-center justify-center"
              >
                <Text className="text-slate-600 font-bold">{cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={onConfirm}
              className={`flex-1 py-4 rounded-2xl ${type === 'error' ? 'bg-red-500' : 'bg-accent'} items-center justify-center`}
            >
              <Text className="text-white font-bold">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
