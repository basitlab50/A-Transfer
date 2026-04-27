import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  increment
} from 'firebase/firestore';

const PAYSTACK_PUBLIC_KEY = 'pk_test_6e29eb50662592ed6fb7b98beb8ccfc82127f105';

export interface Transaction {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'Completed' | 'In Escrow' | 'Pending' | 'Failed';
  type: 'inbound' | 'outbound';
}

export interface Merchant {
  id: string;
  name: string;
  rating: number;
  location: string;
  country: string;
  creditsAvailable: string;
  methods: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'success' | 'error' | 'info';
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  rate: number; // Rate relative to 1 A-Credit (which equals 1 USD)
  phoneCode: string;
  momoNetworks?: string[];
}

interface WalletState {
  balance: number;
  userCountry: string;
  availableCountries: Country[];
  transactions: any[];
  merchants: Merchant[];
  // Merchant State
  isMerchantMode: boolean;
  isAcceptingBuy: boolean;
  isAcceptingSell: boolean;
  merchantInventory: number;
  merchantEarnings: number;
  isKYCVerified: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminMode: boolean;
  userProfile: { name: string, email: string, aid: string, phone: string, country: string, sellingRate?: number, buyingRate?: number } | null;
  merchantStatus: 'none' | 'pending' | 'approved' | 'declined';
  activeTransaction: any | null;
  pendingRequests: any[];
  systemSettings: {
    exchangeRates: { [key: string]: number };
    merchantBuyRate: number;
    merchantSellRange: { min: number; max: number };
    merchantBuyRange: { min: number; max: number };
    maintenanceMode: boolean;
  };
  notifications: AppNotification[];
  merchantTransactions: any[];
  // Actions
  completeKYC: () => void;
  increaseInventory: (amount: number) => void;
  depositFromMerchant: (amount: number, merchantId: string) => void;
  withdrawToMerchant: (amount: number, merchantId: string) => void;
  setUserCountry: (country: string) => void;
  toggleMerchantMode: () => void;
  toggleAdminMode: () => void;
  toggleBuyStatus: () => void;
  toggleSellStatus: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone: string, country: string) => Promise<void>;
  signOut: () => Promise<void>;
  createRequest: (recipientAid: string, amount: number) => void;
  initializeAuth: () => void;
  applyForMerchant: (data: { businessName: string, ownerName: string, phone: string, email: string }) => Promise<void>;
  // Admin Actions
  fetchAllUsers: () => Promise<any[]>;
  updateUserStatus: (uid: string, updates: any) => Promise<void>;
  allocateCredits: (uid: string, amount: number, type: 'balance' | 'inventory') => Promise<void>;
  updateGlobalSettings: (updates: any) => Promise<void>;
  fetchUserTransactions: (uid: string) => Promise<any[]>;
  markNotificationAsRead: (id: string) => Promise<void>;
  resetMerchantStatus: () => Promise<void>;
  fetchAllTransactions: () => Promise<any[]>;
  updateMerchantRate: (rate: number) => Promise<void>;
  updateMerchantBuyRate: (rate: number) => Promise<void>;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'A-Merchant: Kwame Transfer', amount: '-A 200.00', date: 'Sept 14, 2026', status: 'In Escrow', type: 'outbound' },
  { id: '2', name: 'A-Merchant: Lagos Payout', amount: '+A 500.00', date: 'Sept 12, 2026', status: 'Completed', type: 'inbound' },
  { id: '3', name: 'Buy Credits @Kowalski', amount: '+A 1,000.00', date: 'Sept 10, 2026', status: 'Completed', type: 'inbound' },
];

const MOCK_COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currencyCode: 'GHS', currencySymbol: '₵', rate: 14.50, phoneCode: '+233', momoNetworks: ['MTN', 'Telecel', 'AT (AirtelTigo)'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currencyCode: 'NGN', currencySymbol: '₦', rate: 1550.00, phoneCode: '+234', momoNetworks: ['MTN Momo', 'Airtel Money', 'Opay', 'PalmPay'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currencyCode: 'KES', currencySymbol: 'KSh', rate: 130.00, phoneCode: '+254', momoNetworks: ['M-Pesa', 'Airtel Money', 'T-Kash'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currencyCode: 'ZAR', currencySymbol: 'R', rate: 18.50, phoneCode: '+27', momoNetworks: ['MTN Momo', 'Vodacom', 'Telkom Pay'] },
];

const MOCK_MERCHANTS: Merchant[] = [
  { id: '1', name: 'Kowalski Credits', rating: 4.9, location: 'Accra', country: 'Ghana', creditsAvailable: 'A 5,000', methods: ['Mobile Money', 'Bank Transfer'] },
  { id: '2', name: 'Lagos Fintech Hub', rating: 4.8, location: 'Lagos', country: 'Nigeria', creditsAvailable: 'A 12,000', methods: ['Bank Transfer', 'Card'] },
  { id: '3', name: 'Nairobi Express', rating: 4.7, location: 'Nairobi', country: 'Kenya', creditsAvailable: 'A 3,500', methods: ['M-Pesa'] },
  { id: '4', name: 'Joburg Gold', rating: 4.9, location: 'Johannesburg', country: 'South Africa', creditsAvailable: 'A 8,000', methods: ['EFT', 'Card'] },
  { id: '5', name: 'Kumasi Trader', rating: 4.6, location: 'Kumasi', country: 'Ghana', creditsAvailable: 'A 2,100', methods: ['Mobile Money'] },
];

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  merchantInventory: 0,
  merchantEarnings: 0,
  userCountry: 'Ghana',
  availableCountries: MOCK_COUNTRIES,
  transactions: MOCK_TRANSACTIONS,
  merchants: MOCK_MERCHANTS,
  isMerchantMode: false,
  isAcceptingBuy: true,
  isAcceptingSell: true,
  isKYCVerified: false,
  isAuthenticated: false,
  isAdmin: false,
  isAdminMode: false,
  userProfile: null,
  merchantStatus: 'none',
  pendingRequests: [],
  notifications: [],
  merchantTransactions: [],
  systemSettings: {
    exchangeRates: {
      'Ghana': 12.5,
      'Nigeria': 1150,
      'Kenya': 155,
      'South Africa': 19.2
    },
    merchantBuyRate: 1.0,
    merchantSellRange: {
      min: 1.2,
      max: 1.7
    },
    merchantBuyRange: {
      min: 0.8,
      max: 1.0
    },
    maintenanceMode: false
  },
  
  completeKYC: () => set({ isKYCVerified: true }),
  increaseInventory: async (amount: number) => {
    const state = useWalletStore.getState();
    const newInventory = state.merchantInventory + amount;
    
    set({ merchantInventory: newInventory });
    
    // Sync with Firestore if authenticated
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          merchantInventory: newInventory
        }, { merge: true });
      } catch (error) {
        console.error('Error syncing inventory:', error);
      }
    }
  },
  depositFromMerchant: () => {},
  withdrawToMerchant: () => {},
  setUserCountry: (countryName) => set({ userCountry: countryName }),
  toggleMerchantMode: () => set((state) => ({ isMerchantMode: !state.isMerchantMode })),
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  toggleBuyStatus: async () => {
    const state = get();
    const newStatus = !state.isAcceptingBuy;
    set({ isAcceptingBuy: newStatus });
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { isAcceptingBuy: newStatus });
    }
  },
  toggleSellStatus: async () => {
    const state = get();
    const newStatus = !state.isAcceptingSell;
    set({ isAcceptingSell: newStatus });
    if (auth.currentUser) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { isAcceptingSell: newStatus });
    }
  },
  signIn: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign In Error:', error.message);
      throw error;
    }
  },
  signUp: async (name, email, password, phone, country) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const aid = Math.floor(Math.random() * 90000000 + 10000000).toString();
      const userProfile = { 
        name, 
        email, 
        aid, 
        phone, 
        country, 
        balance: 0, 
        merchantInventory: 0,
        merchantEarnings: 0,
        isKYCVerified: false 
      };
      
      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
    } catch (error: any) {
      console.error('Sign Up Error:', error.message);
      throw error;
    }
  },
  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign Out Error:', error.message);
    }
  },
  createRequest: (recipientAid, amount) => set((state) => ({ 
    pendingRequests: [
      { id: Math.random().toString(), recipientAid, amount, status: 'Pending', date: new Date().toLocaleDateString() },
      ...state.pendingRequests
    ]
  })),
  applyForMerchant: async (data) => {
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          merchantStatus: 'pending',
          country: data.country, // Ensure the user's country is updated to where they want to be a merchant
          merchantApplication: {
            ...data,
            submittedAt: new Date().toISOString()
          }
        });
        set({ merchantStatus: 'pending' });
      } catch (error) {
        console.error('Error applying for merchant:', error);
        throw error;
      }
    }
  },
  updateMerchantRate: async (rate: number) => {
    const state = get();
    const { min, max } = state.systemSettings.merchantSellRange;
    if (rate < min || rate > max) {
      throw new Error(`Rate must be between ${min} and ${max}`);
    }

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          sellingRate: rate
        });
        // Profile listener will pick up the change
      } catch (error) {
        console.error('Error updating merchant rate:', error);
        throw error;
      }
    }
  },
  fetchAllUsers: async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  },
  fetchAllTransactions: async () => {
    try {
      const q = query(collection(db, 'ongoing_transactions'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error('Error fetching all transactions:', error.message);
      return [];
    }
  },
  fetchApprovedMerchants: async (country: string) => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('merchantStatus', '==', 'approved'),
        where('country', '==', country)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      console.error('Error fetching merchants (Possible Security Rules issue):', error.message);
      // Fallback: If filtered query fails (e.g. index missing), try general fetch
      try {
        const q = query(collection(db, 'users'));
        const snap = await getDocs(q);
        return snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(u => u.merchantStatus === 'approved' && u.country === country);
      } catch (e) {
        return [];
      }
    }
  },
  updatePaymentDetails: async (details) => {
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          paymentDetails: details
        });
      } catch (error) {
        console.error('Error updating payment details:', error);
        throw error;
      }
    }
  },
  markPaymentAsSent: async (merchantId, amount, merchantDetails) => {
    if (!auth.currentUser) return null;
    try {
      const txId = 'TX' + Date.now();
      const transaction = {
        userId: auth.currentUser.uid,
        userName: get().userProfile?.name || 'User',
        merchantId: merchantId || 'no-id',
        amount: Number(amount) || 0,
        status: 'awaiting_confirmation',
        timestamp: new Date().toISOString(),
        type: 'deposit'
      };
      const docRef = doc(db, 'ongoing_transactions', txId);
      await setDoc(docRef, transaction);
      return txId;
    } catch (error: any) {
      console.error('STORE ERROR:', error);
      throw error;
    }
  },
  markNotificationAsRead: async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id), {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  resetMerchantStatus: async () => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        merchantStatus: 'none',
        merchantApplication: null // Clear old application data
      });
    } catch (error) {
      console.error('Error resetting merchant status:', error);
    }
  },
  confirmPaymentReceived: async (txId) => {
    try {
      await runTransaction(db, async (transaction) => {
        const txRef = doc(db, 'ongoing_transactions', txId);
        const txSnap = await transaction.get(txRef);
        
        if (!txSnap.exists()) throw new Error('Transaction does not exist');
        
        const txData = txSnap.data();
        if (txData.status === 'completed') throw new Error('Already completed');
        
        const { userId, merchantId, amount } = txData;
        const merchantRef = doc(db, 'users', merchantId);
        const userRef = doc(db, 'users', userId);
        
        const merchantSnap = await transaction.get(merchantRef);
        if (!merchantSnap.exists()) throw new Error('Merchant profile missing');
        
        // Final Atomic Updates
        transaction.update(merchantRef, { merchantInventory: increment(-amount) });
        transaction.update(userRef, { balance: increment(amount) });
        transaction.update(txRef, { status: 'completed', completedAt: new Date().toISOString() });
      });
    } catch (error: any) {
      console.error('CRITICAL TRANSACTION ERROR:', error);
      throw error;
    }
  },
  updateMerchantBuyRate: async (rate: number) => {
    const state = get();
    const { min, max } = state.systemSettings.merchantBuyRange;
    if (rate < min || rate > max) {
      throw new Error(`Rate must be between ${min} and ${max}`);
    }

    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { buyingRate: rate });
      set(state => ({
        userProfile: state.userProfile ? { ...state.userProfile, buyingRate: rate } : null
      }));
    } catch (error) {
      console.error('Error updating merchant buy rate:', error);
      throw error;
    }
  },

  updateUserStatus: async (uid, updates) => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
      
      // If status changed, create a notification
      if (updates.merchantStatus) {
        console.log(`[NOTIFY] Creating notification for user ${uid} with status ${updates.merchantStatus}`);
        const title = updates.merchantStatus === 'approved' ? 'Application Approved! 🎉' : 'Application Declined';
        const message = updates.merchantStatus === 'approved' 
          ? 'Your application to be an A-Merchant has been approved. You can now access merchant features from your profile.'
          : 'Your application to be an A-Merchant was declined. Please review your documents and try again.';
        
        const notifyRef = collection(db, 'users', uid, 'notifications');
        await addDoc(notifyRef, {
          title,
          message,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: updates.merchantStatus === 'approved' ? 'success' : 'error'
        });
        console.log('[NOTIFY] Notification document added successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
  allocateCredits: async (uid, amount, type) => {
    try {
      const userRef = doc(db, 'users', uid);
      const field = type === 'balance' ? 'balance' : 'merchantInventory';
      
      // Get current value to add to it
      const querySnapshot = await getDocs(query(collection(db, 'users'), where('__name__', '==', uid)));
      if (!querySnapshot.empty) {
        const currentData = querySnapshot.docs[0].data();
        const currentValue = currentData[field] || 0;
        await updateDoc(userRef, {
          [field]: currentValue + amount
        });
      }
    } catch (error) {
      console.error('Error allocating credits:', error);
      throw error;
    }
  },
  updateGlobalSettings: async (updates) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), updates, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
  fetchUserTransactions: async (uid) => {
    try {
      // Fetch as User
      const qUser = query(collection(db, 'ongoing_transactions'), where('userId', '==', uid));
      // Fetch as Merchant
      const qMerchant = query(collection(db, 'ongoing_transactions'), where('merchantId', '==', uid));
      
      const [snapUser, snapMerchant] = await Promise.all([getDocs(qUser), getDocs(qMerchant)]);
      
      const txs = [
        ...snapUser.docs.map(d => ({ id: d.id, ...d.data() })),
        ...snapMerchant.docs.map(d => ({ id: d.id, ...d.data() }))
      ];
      
      // Sort by date newest first
      return txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  },
  initializeAuth: () => {
    // Keep track of active listeners to unsubscribe on logout
    let unsubscribeSettings: (() => void) | null = null;
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeActiveTx: (() => void) | null = null;
    let unsubscribeHistory: (() => void) | null = null;
    let unsubscribeMerchantHistory: (() => void) | null = null;
    let unsubscribeNotifications: (() => void) | null = null;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('--- CURRENT LOGGED-IN UID ---:', user.uid);
        set({ isAuthenticated: true });

        // Unsubscribe from any previous listeners just in case
        if (unsubscribeSettings) unsubscribeSettings();
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeActiveTx) unsubscribeActiveTx();
        if (unsubscribeHistory) unsubscribeHistory();
        if (unsubscribeNotifications) unsubscribeNotifications();

        // Listen to global settings
        unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
          if (docSnap.exists()) {
            const settings = docSnap.data() as any;
            set({ systemSettings: settings });
            
            // Update rates in availableCountries
            set((state) => ({
              availableCountries: state.availableCountries.map(c => ({
                ...c,
                rate: settings.exchangeRates[c.name] || c.rate
              }))
            }));
          }
        }, (error) => {
          console.error('Firestore Global Settings Error:', error);
          // Fallback to mock settings if permission denied
          set({ systemSettings: {
            exchangeRates: { 'Ghana': 12.5, 'Nigeria': 1150, 'Kenya': 155, 'South Africa': 19.2 },
            maintenanceMode: false
          }});
        });
        
        // Listen to active ongoing transactions for this user
        const qTx = query(
          collection(db, 'ongoing_transactions'),
          where('userId', '==', user.uid),
          where('status', 'in', ['awaiting_confirmation', 'awaiting_merchant_payment', 'merchant_paid', 'completed'])
        );
        
        unsubscribeActiveTx = onSnapshot(qTx, (snapshot) => {
          if (!snapshot.empty) {
            // Get all pending and sort by newest first (locally to avoid index requirement)
            const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
            txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            set({ activeTransaction: txs[0] });
          } else {
            set({ activeTransaction: null });
          }
        });
        
        // Listen to their data in Firestore for profile details
        unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            set({ 
              userProfile: { 
                id: docSnap.id,
                ...data
              } as any,
              balance: data.balance || 0,
              merchantInventory: data.merchantInventory || 0,
              merchantEarnings: data.merchantEarnings || 0,
              userCountry: data.country || 'Ghana',
              isKYCVerified: data.isKYCVerified || false,
              merchantStatus: data.merchantStatus || 'none',
              isAcceptingBuy: data.isAcceptingBuy ?? true,
              isAcceptingSell: data.isAcceptingSell ?? true,
              isAdmin: data.isAdmin === true
            });
            console.log('--- ADMIN STATUS SYNCED ---', data.isAdmin === true);
          } else {
            console.warn('User document not found in Firestore for UID:', user.uid);
            // Fallback to mock profile if document doesn't exist yet
            set({ 
              userProfile: { name: 'Test User', email: user.email || '', aid: '12345678', phone: '', country: 'Ghana' },
              balance: 1250
            });
          }
        }, (error) => {
          console.error('Firestore User Profile Error (Check your security rules):', error);
          // Fallback to mock data if permission denied (DO NOT force isAuthenticated here)
          set({ 
            userProfile: { name: 'Demo User (Offline)', email: user.email || '', aid: '00000000', phone: '', country: 'Ghana' },
            balance: 5000,
            transactions: MOCK_TRANSACTIONS
          });
        });

        // Listen to transaction history (completed/archived)
        const qHistory = query(
          collection(db, 'ongoing_transactions'),
          where('userId', '==', user.uid),
          where('status', 'in', ['completed', 'archived'])
        );

        unsubscribeHistory = onSnapshot(qHistory, (snapshot) => {
          const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort by timestamp desc
          txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          set({ transactions: txs });
        });

        // Listen to merchant transaction history
        const qMerchantHistory = query(
          collection(db, 'ongoing_transactions'),
          where('merchantId', '==', user.uid),
          where('status', 'in', ['completed', 'archived'])
        );

        unsubscribeMerchantHistory = onSnapshot(qMerchantHistory, (snapshot) => {
          const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort by timestamp desc
          txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          set({ merchantTransactions: txs });
        });

        // Listen to notifications
        const qNotify = collection(db, 'users', user.uid, 'notifications');
        unsubscribeNotifications = onSnapshot(qNotify, (snapshot) => {
          const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
          // Sort newest first
          notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          set({ notifications: notes });
        });
      } else {
        // User is signed out
        if (unsubscribeSettings) unsubscribeSettings();
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeActiveTx) unsubscribeActiveTx();
        if (unsubscribeHistory) unsubscribeHistory();
        if (unsubscribeMerchantHistory) unsubscribeMerchantHistory();
        if (unsubscribeNotifications) unsubscribeNotifications();
        set({ 
          isAuthenticated: false, 
          userProfile: null, 
          balance: 0, 
          activeTransaction: null,
          merchantInventory: 0, 
          merchantEarnings: 0,
          merchantStatus: 'none',
          notifications: [],
          isAdmin: false
        });
      }
    });
  },

  depositFromMerchant: (amount, merchantId) => {
    set((state) => {
      const merchant = state.merchants.find(m => m.id === merchantId);
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Buy Credits @${merchant?.name || 'A-Merchant'}`,
        amount: `+A ${amount.toFixed(2)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Completed',
        type: 'inbound'
      };
      return {
        balance: state.balance + amount,
        transactions: [newTransaction, ...state.transactions],
      };
    });
  },

  withdrawToMerchant: (amount, merchantId) => {
    set((state) => {
      const merchant = state.merchants.find(m => m.id === merchantId);
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        name: `Withdrawal via ${merchant?.name || 'A-Merchant'}`,
        amount: `-A ${amount.toFixed(2)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'In Escrow',
        type: 'outbound'
      };
      return {
        balance: state.balance - amount,
        transactions: [newTransaction, ...state.transactions],
      };
    });
  },
}));
