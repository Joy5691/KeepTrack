import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, serverTimestamp, doc, updateDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Budget, OperationType } from '../types';
import { handleFirestoreError } from '../lib/error';

export function useBudgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/budgets`),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Budget[];
      
      setBudgets(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/budgets`);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const setBudgetLimit = async (category: string, limit: number) => {
    if (!user) return;
    try {
      // Find if budget already exists for this category
      const collRef = collection(db, `users/${user.uid}/budgets`);
      const q = query(collRef, where('category', '==', category));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing budget
        const budgetDoc = querySnapshot.docs[0];
        const docRef = doc(db, `users/${user.uid}/budgets`, budgetDoc.id);
        await updateDoc(docRef, {
          limit: limit,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create a new budget doc
        const newDocRef = doc(collRef);
        await setDoc(newDocRef, {
          userId: user.uid,
          category,
          limit,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/budgets`);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/budgets`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/budgets`);
    }
  };

  const clearAllBudgets = async () => {
    if (!user) return;
    try {
      const collRef = collection(db, `users/${user.uid}/budgets`);
      const q = query(collRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/budgets`);
    }
  };

  return { budgets, loading, setBudgetLimit, deleteBudget, clearAllBudgets };
}
