import { db } from './src/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

async function testMerchantFlow() {
  const testUid = 'TEST_USER_ID'; // We'll simulate for a test user
  
  console.log('--- STARTING MERCHANT FLOW TEST ---');
  
  const applicationData = {
    firstName: 'Test',
    lastName: 'Merchant',
    businessName: 'Antigravity Trading LTD',
    email: 'test@gmail.com',
    phone: '+233123456789',
    country: 'Ghana',
    documents: {
      idUrl: 'mock_id_url',
      certUrl: 'mock_cert_url'
    }
  };

  console.log('Simulating Application Submission...');
  // Logic from useWalletStore
  const userRef = doc(db, 'users', testUid);
  await updateDoc(userRef, {
    merchantStatus: 'pending',
    country: applicationData.country,
    merchantApplication: {
      ...applicationData,
      submittedAt: new Date().toISOString()
    }
  });
  
  console.log('Verifying Data in Firestore...');
  const snap = await getDoc(userRef);
  const data = snap.data();
  
  if (data?.merchantStatus === 'pending' && data?.merchantApplication?.businessName === 'Antigravity Trading LTD') {
    console.log('✅ SUCCESS: Application saved correctly with PENDING status.');
    console.log('✅ Region set to:', data.country);
  } else {
    console.log('❌ FAILURE: Data mismatch or save failed.');
  }
  
  console.log('--- TEST COMPLETE ---');
}
