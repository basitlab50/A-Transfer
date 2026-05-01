import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { Send, User } from 'lucide-react-native';
import { db } from '../../config/firebase';
import { useWalletStore } from '../../store/useWalletStore';
import { sendPushNotificationToUser } from '../../utils/notifications';


const TransactionChat = ({ route }: any) => {
  const { transactionId, otherPartyName, otherPartyId } = route.params;
  const { userProfile } = useWalletStore();
  const userId = userProfile?.id;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!transactionId || !userId) return;

    const resetUnreadCount = async () => {
      try {
        const txRef = doc(db, 'ongoing_transactions', transactionId);
        const txSnap = await getDoc(txRef);
        if (txSnap.exists()) {
          const isMerchant = txSnap.data().merchantId === userId;
          await updateDoc(txRef, {
            [isMerchant ? 'unreadMerchantCount' : 'unreadUserCount']: 0
          });
        }
      } catch (e) {
        console.error("Error resetting unread count:", e);
      }
    };
    resetUnreadCount();

    const messagesRef = collection(db, `ongoing_transactions/${transactionId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      if (snapshot.docs.length > 0) {
        resetUnreadCount();
      }
    });

    return () => unsubscribe();
  }, [transactionId, userId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !userId || !transactionId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const messagesRef = collection(db, `ongoing_transactions/${transactionId}/messages`);
      await addDoc(messagesRef, {
        text,
        senderId: userId,
        timestamp: serverTimestamp()
      });

      const txRef = doc(db, 'ongoing_transactions', transactionId);
      const txSnap = await getDoc(txRef);
      if (txSnap.exists()) {
        const isMerchant = txSnap.data().merchantId === userId;
        await updateDoc(txRef, {
          [isMerchant ? 'unreadUserCount' : 'unreadMerchantCount']: increment(1)
        });

        // Notify the other party
        sendPushNotificationToUser(
          otherPartyId,
          'New Message 💬',
          `${userProfile?.name || 'A user'} sent you a message: "${text.length > 50 ? text.substring(0, 47) + '...' : text}"`,
          'info',
          { transactionId }
        );
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === userId;

    return (
      <View className={`max-w-[80%] my-1 mx-4 p-3 rounded-2xl ${isMe ? 'bg-accent self-end rounded-tr-sm' : 'bg-surface border border-slate-800 self-start rounded-tl-sm'}`}>
        <Text className={`${isMe ? 'text-primary' : 'text-textPrimary'} text-sm`}>{item.text}</Text>
        <Text className={`${isMe ? 'text-primary/70' : 'text-textSecondary'} text-[8px] font-bold uppercase tracking-wider mt-1 text-right`}>
          {item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          className="flex-1 pt-4"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-8 mt-20">
              <View className="w-16 h-16 rounded-full bg-slate-800 items-center justify-center mb-4">
                <User color="#94A3B8" size={32} />
              </View>
              <Text className="text-textPrimary font-bold text-lg mb-2 text-center">Chat with {otherPartyName}</Text>
              <Text className="text-textSecondary text-center text-xs">
                Send a message to clarify any details about this transaction. Please be respectful and clear.
              </Text>
            </View>
          }
        />

        <View className="p-4 bg-primary border-t border-slate-800">
          <View className="flex-row items-center bg-surface border border-slate-800 rounded-full pl-4 pr-1 py-1">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#64748B"
              className="flex-1 text-textPrimary h-10"
              multiline
            />
            <TouchableOpacity 
              onPress={sendMessage}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-accent' : 'bg-slate-800'}`}
            >
              <Send color={inputText.trim() ? '#0A192F' : '#64748B'} size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TransactionChat;
