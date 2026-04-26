// Firebase Common Functions

// Get all documents from a collection
async function getCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    return [];
  }
}

// Get a single document by ID
async function getDocument(collectionName, docId) {
  try {
    const doc = await db.collection(collectionName).doc(docId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    return null;
  }
}

// Add a new document
async function addDocument(collectionName, data) {
  try {
    const docRef = await db.collection(collectionName).add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

// Update an existing document
async function updateDocument(collectionName, docId, data) {
  try {
    await db.collection(collectionName).doc(docId).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

// Delete a document
async function deleteDocument(collectionName, docId) {
  try {
    await db.collection(collectionName).doc(docId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
}

// Subscribe to collection changes (real-time)
function subscribeCollection(collectionName, callback) {
  return db.collection(collectionName)
    .orderBy('updatedAt', 'desc')
    .onSnapshot((snapshot) => {
      const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
    });
}

// Subscribe to single document changes (real-time)
function subscribeDocument(collectionName, docId, callback) {
  return db.collection(collectionName).doc(docId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error subscribing to document ${docId} in ${collectionName}:`, error);
    });
}

// Query documents with filters
async function queryCollection(collectionName, filters) {
  try {
    let query = db.collection(collectionName);

    filters.forEach(filter => {
      if (filter.operator === '==') {
        query = query.where(filter.field, '==', filter.value);
      } else if (filter.operator === '>') {
        query = query.where(filter.field, '>', filter.value);
      } else if (filter.operator === '>=') {
        query = query.where(filter.field, '>=', filter.value);
      } else if (filter.operator === '<') {
        query = query.where(filter.field, '<', filter.value);
      } else if (filter.operator === '<=') {
        query = query.where(filter.field, '<=', filter.value);
      } else if (filter.operator === 'array-contains') {
        query = query.where(filter.field, 'array-contains', filter.value);
      } else if (filter.operator === 'in') {
        query = query.where(filter.field, 'in', filter.value);
      }
    });

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    return [];
  }
}

// Search documents by text field
async function searchCollection(collectionName, searchField, searchTerm) {
  try {
    // Note: Firestore doesn't support native text search
    // This is a simple implementation that gets all documents and filters client-side
    // For production, consider using Algolia or Elasticsearch
    const snapshot = await db.collection(collectionName).get();
    const searchLower = searchTerm.toLowerCase();

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(doc => {
        const fieldValue = doc[searchField];
        if (fieldValue && typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchLower);
        }
        return false;
      });
  } catch (error) {
    console.error(`Error searching collection ${collectionName}:`, error);
    return [];
  }
}
