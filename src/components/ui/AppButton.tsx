import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  View, 
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'luxury' | 'gold' | 'glass' | 'orange' | 'white';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  textColor?: string; 
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  className = '',
  style,
  textStyle,
  textColor,
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-2xl transition-all duration-200';
  
  const sizeStyles = {
    small: 'px-4 py-2',
    medium: 'px-6 py-4',
    large: 'px-8 py-5',
  };

  const variantStyles = {
    primary: 'bg-primary border border-primary shadow-lg shadow-primary/20',
    secondary: 'bg-surface border border-slate-800',
    accent: 'bg-accent border border-accent shadow-lg shadow-accent/20',
    outline: 'bg-transparent border-2 border-slate-800',
    ghost: 'bg-transparent',
    danger: 'bg-red-500/10 border border-red-500/50',
    luxury: 'bg-luxury border border-luxury shadow-lg shadow-luxury/20',
    gold: 'bg-gold border border-gold shadow-lg shadow-gold/20',
    glass: 'bg-glass border border-white/10 backdrop-blur-md',
    orange: 'bg-orange/10 border-2 border-orange/50',
    white: 'bg-white border border-white',
  };

  const textBaseStyles = 'font-bold text-center tracking-tight';
  
  const textSizeStyles = {
    small: 'text-xs',
    medium: 'text-base',
    large: 'text-lg',
  };

  const textVariantStyles = {
    primary: 'text-textPrimary',
    secondary: 'text-textSecondary',
    accent: 'text-black',
    luxury: 'text-luxury',
    outline: 'text-textPrimary',
    gold: 'text-primary',
    glass: 'text-textPrimary',
    orange: 'text-orange',
    white: 'text-black',
    danger: 'text-red-500',
  };

  const getLoaderColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'accent': return '#000000';
      default: return '#76b33a';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabled ? 'opacity-50' : ''} ${className}`}
      style={style}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text 
            className={`${textBaseStyles} ${textSizeStyles[size]} ${textVariantStyles[variant]}`}
            style={[textStyle, textColor ? { color: textColor } : {}]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
