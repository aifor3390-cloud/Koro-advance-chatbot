
import { User } from '../types';
import { 
  auth, 
  googleProvider, 
  isMock,
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from './firebase';

const MOCK_USER_KEY = 'koro_local_operator';

export const AuthService = {
  /**
   * Neural Bypass: Local Persistence
   */
  _getMockUser: (): User | null => {
    const saved = localStorage.getItem(MOCK_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  _setMockUser: (user: User | null) => {
    if (user) localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(MOCK_USER_KEY);
  },

  /**
   * Force Autonomous Mode (No Firebase required)
   * This persists across sessions to avoid domain errors.
   */
  enableAutonomousMode: () => {
    localStorage.setItem('koro_force_mock', 'true');
    window.location.reload();
  },

  _handleFirebaseError: (error: any): never => {
    console.error("Firebase Auth Error Details:", error);
    let message = "Neural link conflict detected.";
    
    // Comprehensive extraction of error codes from Firebase's nested structure
    const errorCode = error.code || 
                     (error.message && error.message.includes('auth/') ? error.message.match(/auth\/[a-z-]+/)?.[0] : null);

    if (errorCode === 'auth/unauthorized-domain' || error.message?.toLowerCase().includes('unauthorized-domain')) {
      const currentDomain = window.location.hostname;
      message = `UNAUTHORIZED DOMAIN: '${currentDomain}' is restricted.

HOW TO FIX:
1. Open Firebase Console
2. Go to: Authentication > Settings > Authorized Domains
3. Add this domain: ${currentDomain}

OR: Switch to the 'Autonomous Engine' below to bypass Cloud requirements entirely.`;
      throw new Error(message);
    }

    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        message = "Invalid identity credentials. Access to neural core denied.";
        break;
      case 'auth/email-already-in-use':
        message = "Identity already exists in the neural registry.";
        break;
      case 'auth/weak-password':
        message = "Neural key strength insufficient. Minimum 8 characters required.";
        break;
      case 'auth/invalid-email':
        message = "Invalid registry email format.";
        break;
      case 'auth/popup-closed-by-user':
        message = "Authentication protocol terminated by operator.";
        break;
      case 'auth/operation-not-allowed':
        message = "Requested authentication protocol is disabled in Firebase console.";
        break;
    }
    
    throw new Error(message);
  },

  signInWithGoogle: async (): Promise<User> => {
    if (isMock) {
      await new Promise(r => setTimeout(r, 1000));
      const mockUser: User = {
        id: 'mock-google-id',
        name: 'Neural Operator',
        email: 'operator@neural.grid',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=google-relay`,
        provider: 'google'
      };
      AuthService._setMockUser(mockUser);
      return mockUser;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        id: result.user.uid,
        name: result.user.displayName || "Neural Operator",
        email: result.user.email || "",
        avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.email}`,
        provider: 'google'
      };
    } catch (error) {
      return AuthService._handleFirebaseError(error);
    }
  },

  signUp: async (name: string, email: string, pass: string): Promise<User> => {
    if (isMock) {
      await new Promise(r => setTimeout(r, 1500));
      const mockUser: User = {
        id: Date.now().toString(),
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email'
      };
      AuthService._setMockUser(mockUser);
      return mockUser;
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return {
        id: result.user.uid,
        name,
        email: result.user.email || "",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email'
      };
    } catch (error) {
      return AuthService._handleFirebaseError(error);
    }
  },

  login: async (email: string, pass: string): Promise<User> => {
    if (isMock) {
      await new Promise(r => setTimeout(r, 1000));
      if (pass === 'bypass') {
         const guest: User = {
           id: 'guest-bypass',
           name: 'Guest Operator',
           email: 'guest@local.core',
           avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
           provider: 'bypass'
         };
         AuthService._setMockUser(guest);
         return guest;
      }
      const mockUser: User = {
        id: 'mock-login-id',
        name: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email'
      };
      AuthService._setMockUser(mockUser);
      return mockUser;
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return {
        id: result.user.uid,
        name: result.user.displayName || email.split('@')[0],
        email: result.user.email || "",
        avatar: result.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email'
      };
    } catch (error) {
      return AuthService._handleFirebaseError(error);
    }
  },

  logout: async () => {
    if (isMock) {
      AuthService._setMockUser(null);
      return;
    }
    await signOut(auth);
  },

  resetPassword: async (email: string) => {
    if (isMock) {
      await new Promise(r => setTimeout(r, 800));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      return AuthService._handleFirebaseError(error);
    }
  }
};
