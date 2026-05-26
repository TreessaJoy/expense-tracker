import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { Expense } from './types';

// Verification connection check (Required by platform skill blueprint)
export async function verifyCloudConnection(): Promise<boolean> {
  try {
    // Attempt standard read validation to confirm live connection to enterprise Firestore database
    await getDocFromServer(doc(db, 'expenses', 'connection_probe_validation'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore service is indicating offline capability.');
    }
    return false;
  }
}

// Stream data subscription representing live collection
export function subscribeExpenses(
  userId: string,
  onUpdate: (expenses: Expense[]) => void,
  onError: (errInfo: any) => void
) {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const liveList: Expense[] = [];
      snapshot.forEach((snapDoc) => {
        const item = snapDoc.data();
        liveList.push({
          id: snapDoc.id,
          userId: item.userId,
          title: item.title,
          amount: Number(item.amount),
          category: item.category,
          date: item.date,
          note: item.note || undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        });
      });
      onUpdate(liveList);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.GET, `expenses?userId=${userId}`);
    }
  );
}

// Persist document creation to Firestore
export async function createCloudExpense(
  id: string,
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `expenses/${id}`;
  try {
    const docRef = doc(db, 'expenses', id);
    await setDoc(docRef, {
      id,
      userId,
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      note: expense.note || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Persist document updates to Firestore using specific allowed key updates
export async function updateCloudExpense(
  id: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  const path = `expenses/${id}`;
  try {
    const docRef = doc(db, 'expenses', id);
    await updateDoc(docRef, {
      title: expense.title,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      note: expense.note || null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Remove document from Firestore
export async function deleteCloudExpense(id: string): Promise<void> {
  const path = `expenses/${id}`;
  try {
    const docRef = doc(db, 'expenses', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Google Sign-In with popup
export async function handleGoogleSignIn(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Core Google Authentication flow error:', error);
    return null;
  }
}

// Google Sign-Out
export async function handleGoogleSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout authentication transition issue:', error);
  }
}
