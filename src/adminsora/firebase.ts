import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from '../firebase';
import {
  getDocs,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

const PREFIX = 'minsora_';

/**
 * Test direct Firestore connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!db) return false;
    const testDoc = doc(db, 'settings', 'connectionTest');
    await setDoc(testDoc, { ping: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.warn('[AdminSora Firebase] Offline or permission issue, fallback to local', e);
    return false;
  }
}

/**
 * Subscribe to a collection in realtime
 */
export function subscribeCollection<T>(
  collName: string,
  onNext: (items: T[]) => void,
  onError: () => void
): () => void {
  try {
    if (!db) {
      onError();
      return () => {};
    }
    const collRef = collection(db, PREFIX + collName);
    return onSnapshot(
      collRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          _docId: d.id,
          ...d.data(),
        })) as unknown as T[];
        onNext(items);
      },
      (err) => {
        console.warn(`[AdminSora Firebase] Error listening to ${collName}:`, err);
        onError();
      }
    );
  } catch {
    onError();
    return () => {};
  }
}

/**
 * Subscribe to a single document in realtime
 */
export function subscribeDocument<T>(
  collName: string,
  docId: string,
  onNext: (data: T) => void,
  onError: () => void
): () => void {
  try {
    if (!db) {
      onError();
      return () => {};
    }
    const docRef = doc(db, PREFIX + collName, docId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onNext(snapshot.data() as T);
        } else {
          onNext({} as T);
        }
      },
      (err) => {
        console.warn(`[AdminSora Firebase] Error listening to doc ${collName}/${docId}:`, err);
        onError();
      }
    );
  } catch {
    onError();
    return () => {};
  }
}

/**
 * Save / Upsert an entity to cloud
 */
export async function saveEntityToCloud(collName: string, entity: any): Promise<void> {
  if (!db) return;
  const docId = String(entity.id || entity.batch || entity.code || Date.now());
  const docRef = doc(db, PREFIX + collName, docId);
  await setDoc(docRef, entity, { merge: true });
}

/**
 * Delete an entity from cloud
 */
export async function deleteEntityFromCloud(collName: string, id: number | string): Promise<void> {
  if (!db) return;
  const docRef = doc(db, PREFIX + collName, String(id));
  await deleteDoc(docRef);
}

/**
 * Delete production batch specifically
 */
export async function deleteProductionFromCloud(target: {
  id?: number | string;
  batch?: string;
  docId?: string;
}): Promise<void> {
  if (!db) return;
  const docId = target.docId || target.batch || (target.id ? String(target.id) : undefined);
  if (docId) {
    const docRef = doc(db, PREFIX + 'productions', docId);
    await deleteDoc(docRef);
  }
}

/**
 * Save document to cloud
 */
export async function saveDocumentToCloud(collName: string, docId: string, data: any): Promise<void> {
  if (!db) return;
  const docRef = doc(db, PREFIX + collName, docId);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Seed collection if empty
 */
export async function seedCollectionIfEmpty(
  collName: string,
  items: any[],
  force: boolean = false
): Promise<void> {
  if (!db || !items || items.length === 0) return;
  const collRef = collection(db, PREFIX + collName);
  if (!force) {
    const snap = await getDocs(collRef);
    if (!snap.empty) return;
  }
  const batch = writeBatch(db);
  items.forEach((item) => {
    const docId = String(item.id || item.batch || item.code || Math.random().toString(36).substring(7));
    const ref = doc(collRef, docId);
    batch.set(ref, item, { merge: true });
  });
  await batch.commit();
}

/**
 * Clear multiple specific IDs from a cloud collection
 */
export async function clearCloudCollection(
  collName: string,
  ids: (number | string)[]
): Promise<void> {
  if (!db || ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => {
    const ref = doc(db, PREFIX + collName, String(id));
    batch.delete(ref);
  });
  await batch.commit();
}

/**
 * Clear entire collection
 */
export async function clearEntireCollection(collName: string): Promise<void> {
  if (!db) return;
  const collRef = collection(db, PREFIX + collName);
  const snap = await getDocs(collRef);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/**
 * Replace entire collection with new items
 */
export async function replaceEntireCollection(collName: string, items: any[]): Promise<void> {
  await clearEntireCollection(collName);
  await seedCollectionIfEmpty(collName, items, true);
}
