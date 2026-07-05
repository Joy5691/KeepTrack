import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, serverTimestamp, doc, updateDoc, deleteDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Transaction, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      
      data.sort((a, b) => b.date - a.date); // Sort locally for now
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/transactions`);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const collRef = collection(db, `users/${user.uid}/transactions`);
      const newDocRef = doc(collRef);
      await setDoc(newDocRef, {
        userId: user.uid,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // Trigger success animation
      window.dispatchEvent(new CustomEvent('transaction-success', {
        detail: {
          type: data.type,
          amount: data.amount,
          category: data.category
        }
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/transactions`);
    }
  };

  const editTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!user) return;
    try {
      const docRef = doc(db, `users/${user.uid}/transactions`, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      // Trigger success animation
      window.dispatchEvent(new CustomEvent('transaction-success', {
        detail: {
          type: 'edit',
          amount: data.amount || 0,
          category: data.category || 'Updated'
        }
      }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/transactions`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/transactions`, id));
    } catch(err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/transactions`);
    }
  }

  const clearAllTransactions = async () => {
    if (!user) return;
    try {
      const collRef = collection(db, `users/${user.uid}/transactions`);
      const q = query(collRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/transactions`);
    }
  };

  return { transactions, loading, addTransaction, editTransaction, deleteTransaction, clearAllTransactions };
}
