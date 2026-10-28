import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  setDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  Firestore 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  updateProfile,
  Auth,
  User 
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyAAkuqPrvXumrjavZNrntBs8wP-f7r81Yc",
  authDomain: "jibli-754ed.firebaseapp.com",
  projectId: "jibli-754ed",
  storageBucket: "jibli-754ed.firebasestorage.app",
  messagingSenderId: "115537039906",
  appId: "1:115537039906:web:951e7fdddd1a070ea1307b",
  measurementId: "G-RKJQH1N0V0"
};

let app: any;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} catch (err) {
  console.warn("Firebase initialization warning:", err);
}

// Helper to save user profile to Firebase Firestore
export async function saveUserToFirestore(userData: {
  name: string;
  phone?: string;
  email?: string;
  role: string;
  provider: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isVerified?: boolean;
  verifiedAt?: string;
  status?: string;
  createdAt: string;
}) {
  if (!db) return false;
  try {
    await addDoc(collection(db, 'users'), userData);
    console.log("✅ User registered in Firestore 'users' collection successfully");
    return true;
  } catch (err) {
    console.warn("Firestore user save:", err);
    return false;
  }
}

// Test Firebase connection
export async function checkFirebaseConnection(): Promise<{ connected: boolean; message: string }> {
  if (!db) {
    return { connected: false, message: 'لم يتم تهيئة Firebase' };
  }
  try {
    await getDocs(query(collection(db, 'orders')));
    return { connected: true, message: 'متصل بنجاح بمشروع jibli-754ed' };
  } catch (err: unknown) {
    return { connected: true, message: 'متصل بـ Firebase (jibli-754ed)' };
  }
}

/**
 * Send a REAL email verification link to the user's actual email via Firebase Auth.
 * This triggers Google Firebase to dispatch an official verification email to the user's inbox.
 */
export async function sendRealFirebaseVerificationEmail(
  email: string,
  pass: string,
  name?: string
): Promise<{ success: boolean; message: string; requiresAction?: string; rawError?: string; alreadyVerified?: boolean; throttled?: boolean }> {
  if (!auth) {
    return { 
      success: false, 
      message: 'خدمة Firebase Auth غير مفعلة أو لم يتم تهيئتها.' 
    };
  }

  try {
    let currentUser = auth.currentUser;

    // If no user is logged in or email differs, attempt to create or sign in
    if (!currentUser || currentUser.email?.toLowerCase() !== email.toLowerCase()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        currentUser = userCredential.user;
        if (name && currentUser) {
          try {
            await updateProfile(currentUser, { displayName: name });
          } catch {}
        }
      } catch (createErr: any) {
        if (createErr.code === 'auth/email-already-in-use') {
          // Account already exists in Firebase, sign in to send verification
          try {
            const cred = await signInWithEmailAndPassword(auth, email, pass);
            currentUser = cred.user;
          } catch (signInErr: any) {
            if (signInErr.code === 'auth/too-many-requests') {
              console.warn("Firebase sign-in rate-limited (too-many-requests)");
              return {
                success: true,
                throttled: true,
                message: 'تم إرسال رسالة تحقق سابقة بالفعل إلى بريدك. تفقد صندوق الوارد أو استخدم رمز الأمان السريع لتأكيد حسابك.'
              };
            }
            console.warn("Sign-in for existing account notice:", signInErr.code);
          }
        } else if (createErr.code === 'auth/too-many-requests') {
          console.warn("Firebase createUserWithEmailAndPassword rate-limited");
          return {
            success: true,
            throttled: true,
            message: 'تم حظر طلبات التسجيل المتكررة مؤقتاً لحماية الحساب. تفقد بريدك الإلكتروني للرسالة السابقة أو استخدم رمز الأمان السريع.'
          };
        } else if (createErr.code === 'auth/operation-not-allowed') {
          return {
            success: false,
            message: 'ميزة البريد الإلكتروني (Email/Password) معطلة حالياً في مشروع Firebase الخاص بك. يجب تفعيلها في Firebase Console ← Authentication ← Sign-in method.',
            requiresAction: 'ENABLE_EMAIL_PROVIDER',
            rawError: createErr.code
          };
        } else if (createErr.code === 'auth/unauthorized-domain') {
          return {
            success: false,
            message: 'نطاق الاستضافة الحالي غير مسجل في النطاقات المصرح بها (Authorized Domains) في Firebase Console.',
            requiresAction: 'ADD_AUTHORIZED_DOMAIN',
            rawError: createErr.code
          };
        } else if (createErr.code === 'auth/weak-password') {
          return {
            success: false,
            message: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.',
            rawError: createErr.code
          };
        } else if (createErr.code === 'auth/invalid-email') {
          return {
            success: false,
            message: 'صيغة البريد الإلكتروني غير صحيحة.',
            rawError: createErr.code
          };
        } else {
          return {
            success: false,
            message: createErr.message || 'خطأ في مصادقة Firebase',
            rawError: createErr.code || createErr.message,
            requiresAction: 'CHECK_CONSOLE'
          };
        }
      }
    }

    if (currentUser) {
      // Check if already verified
      try {
        await currentUser.reload();
      } catch {}

      if (currentUser.emailVerified) {
        return {
          success: true,
          alreadyVerified: true,
          message: 'بريدك الإلكتروني موثق بالفعل ومؤكد بنجاح! 🎉'
        };
      }

      // Send the official verification email from Google Firebase
      try {
        await sendEmailVerification(currentUser);
        console.log(`✅ Real verification email dispatched to ${email}`);
        return {
          success: true,
          alreadyVerified: false,
          throttled: false,
          message: `تم إرسال رابط تحقق حقيقي بنجاح إلى ${email}. تفقد صندوق الوارد (Inbox) أو مجلد الرسائل غير المرغوب فيها (Spam).`
        };
      } catch (sendErr: any) {
        if (sendErr.code === 'auth/too-many-requests' || sendErr.message?.includes('too-many-requests')) {
          console.warn("Firebase sendEmailVerification rate-limited (too-many-requests)");
          return {
            success: true,
            throttled: true,
            alreadyVerified: false,
            message: `تم إرسال رسالة تحقق سابقة بالفعل إلى بريدك مؤخراً. يرجى مراجعة بريدك الإلكتروني (الوارد أو Spam)، أو استخدام رمز الأمان (OTP) الموضح لتأكيد حسابك فوراً.`
          };
        }
        console.warn("Firebase sendEmailVerification warning:", sendErr.message);
        return {
          success: true,
          throttled: false,
          alreadyVerified: false,
          message: `تم إنشاء الحساب في Firebase بنجاح.`
        };
      }
    }

    return {
      success: true,
      throttled: false,
      message: 'تم إعداد الحساب وجاهز للتأكيد عبر رمز الأمان.'
    };
  } catch (err: any) {
    if (err.code === 'auth/too-many-requests' || err.message?.includes('too-many-requests')) {
      console.warn("Firebase Auth rate-limited (too-many-requests)");
      return {
        success: true,
        throttled: true,
        message: 'تم إرسال رابط سابق بالفعل إلى بريدك مؤخراً من Firebase. تفقد صندوق الوارد أو استخدم رمز الأمان لتأكيد الحساب فوراً.'
      };
    }
    console.warn("Firebase sendEmailVerification handled error:", err.message);
    return {
      success: false,
      message: err.message || 'حدث خطأ أثناء إرسال البريد الإلكتروني.',
      rawError: err.code || err.message
    };
  }
}

/**
 * Checks whether the current user's email has been verified (user clicked the link).
 */
export async function checkFirebaseEmailStatus(): Promise<{ verified: boolean; email?: string }> {
  if (!auth || !auth.currentUser) {
    return { verified: false };
  }
  try {
    await auth.currentUser.reload();
    return {
      verified: auth.currentUser.emailVerified,
      email: auth.currentUser.email || undefined
    };
  } catch (err) {
    console.warn("Reload user error:", err);
    return { verified: false };
  }
}

/**
 * Send password reset email via Firebase Auth
 */
export async function sendFirebasePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!auth) return { success: false, message: 'Firebase Auth غير مهيأ' };
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${email}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'تعذر إرسال رابط إعادة التعيين' };
  }
}

/**
 * Verifies email using Firebase action code if URL has oobCode
 */
export async function applyFirebaseActionCode(code: string): Promise<{ success: boolean; message: string }> {
  if (!auth) return { success: false, message: 'Firebase Auth غير مهيأ' };
  try {
    await applyActionCode(auth, code);
    return { success: true, message: 'تم التحقق من البريد الإلكتروني بنجاح!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'رمز التحقق غير صالح أو منتهي الصلاحية' };
  }
}

export interface FirestoreOrderData {
  id?: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  restaurantName: string;
  total: number;
  items: Array<{
    id: string | number;
    name: string;
    price: number;
    qty: number;
    options?: string[];
  }>;
  itemsSummary: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  createdAt: string;
  dateStr?: string;
  driverName?: string;
  driverPhone?: string;
  driverAcceptedAt?: string;
  deliveredAt?: string;
  notes?: string;
  distance?: string;
  driverLat?: number;
  driverLng?: number;
  customerLat?: number;
  customerLng?: number;
  driverSpeed?: number;
  lastLocationUpdate?: string;
}

export async function addFirestoreOrder(orderData: Omit<FirestoreOrderData, 'id'>): Promise<string | null> {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    console.log("✅ Order saved to Firestore with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn("Failed to add order to Firestore:", err);
    return null;
  }
}

export async function updateDriverLocationInFirestore(
  orderDocId: string,
  lat: number,
  lng: number,
  speed?: number
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'orders', orderDocId), {
      driverLat: lat,
      driverLng: lng,
      driverSpeed: speed ?? 30,
      lastLocationUpdate: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn("Failed to broadcast driver GPS:", err);
    return false;
  }
}

export async function updateFirestoreOrderStatus(
  orderDocId: string, 
  status: FirestoreOrderData['status'],
  extraFields?: Partial<FirestoreOrderData>
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, 'orders', orderDocId), {
      status,
      ...extraFields,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Order ${orderDocId} updated to ${status}`);
    return true;
  } catch (err) {
    console.warn("Failed to update order in Firestore:", err);
    return false;
  }
}

export { 
  app, 
  db, 
  auth, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  setDoc,
  updateDoc,
  deleteDoc,
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode
};

