window.firebaseService = {
    app: null,
    db: null,
    storage: null,
    auth: null,

    init: function (config) {
        if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config);
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            this.auth = firebase.auth();
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
            console.log("Firebase initialized");
        }
    },

    // Auth
    signInWithGoogle: async function () {
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            return this._mapUser(result.user);
        } catch (error) {
            console.error("Login error: ", error);
            throw error;
        }
    },

    signOut: async function () {
        await this.auth.signOut();
    },

    getCurrentUser: function () {
        const user = this.auth.currentUser;
        return user ? this._mapUser(user) : null;
    },

    waitForAuth: function () {
        return new Promise((resolve) => {
            if (!this.auth) {
                console.warn("Firebase auth not initialized yet. Waiting...");
                resolve(null);
                return;
            }
            const unsubscribe = this.auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user ? this._mapUser(user) : null);
            });
        });
    },

    registerAuthHandler: function (dotNetObjRef) {
        if (!this.auth) return;
        this.auth.onAuthStateChanged((user) => {
            dotNetObjRef.invokeMethodAsync('NotifyAuthStateChanged', user ? this._mapUser(user) : null);
        });
    },

    _mapUser: function (user) {
        return {
            Id: user.uid,
            Email: user.email,
            DisplayName: user.displayName,
            PhotoUrl: user.photoURL
        };
    },

    // Firestore
    addDocument: async function (collectionName, data) {
        try {
            console.log(`Saving to ${collectionName}:`, data);
            const docRef = await this.db.collection(collectionName).add(data);
            return docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
            throw error;
        }
    },

    addDocumentWithId: async function (collectionName, id, data) {
        try {
            console.log(`Saving to ${collectionName} with ID ${id}:`, data);
            await this.db.collection(collectionName).doc(id).set(data);
            return true;
        } catch (error) {
            console.error("Error setting document: ", error);
            throw error;
        }
    },

    deleteDocument: async function (collectionName, id) {
        try {
            console.log(`Attempting to delete from ${collectionName} with ID: ${id}`);
            await this.db.collection(collectionName).doc(id).delete();
            console.log("Delete successful");
        } catch (error) {
            console.error("Error deleting document: ", error);
            throw error;
        }
    },

    getDocuments: async function (collectionName, limitVal, filter) {
        try {
            let query = this.db.collection(collectionName);

            if (filter && filter.field && filter.value !== undefined) {
                console.log(`Filtering ${collectionName} by ${filter.field} == ${filter.value}`);
                query = query.where(filter.field, "==", filter.value);
            }

            if (limitVal) query = query.limit(limitVal);

            const snapshot = await query.get();
            console.log(`Loaded ${snapshot.docs.length} docs from ${collectionName}`);
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error("Error getting documents: ", error);
            throw error;
        }
    },

    // Storage
    uploadFile: async function (path, base64Content, contentType) {
        try {
            const ref = this.storage.ref(path);
            const snapshot = await ref.putString(base64Content, 'base64', { contentType: contentType });
            return await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("Error uploading file: ", error);
            throw error;
        }
    },

    // OCR
    recognizeText: async function (imageUrl) {
        try {
            const result = await Tesseract.recognize(imageUrl, 'pol', {
                logger: m => console.log(m)
            });
            return result.data.text;
        } catch (error) {
            console.error("OCR Error: ", error);
            throw error;
        }
    },

    recognizePdf: async function (pdfBase64) {
        try {
            const { pdfjsLib } = window;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

            const binary = atob(pdfBase64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const pdf = await loadingTask.promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;

                const result = await Tesseract.recognize(canvas, 'pol');
                fullText += result.data.text + "\n\n";
            }

            return fullText;
        } catch (error) {
            console.error("PDF OCR Error: ", error);
            throw error;
        }
    },

    handleBase64Pdf: function (base64, fileName, mode) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (mode === 'view') {
            window.open(url, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = (fileName || 'dokument') + ".pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    },

    compressPdf: async function (base64Content) {
        try {
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.load(base64Content);

            // Basic compression: Remove metadata and reduce image quality (if possible)
            // pdf-lib is limited in image compression but can strip unused objects
            const compressedByteArr = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultMetadata: false
            });

            // Convert back to base64
            let binary = '';
            const bytes = new Uint8Array(compressedByteArr);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        } catch (error) {
            console.error("Compression Error: ", error);
            return base64Content; // Return original on failure
        }
    },

    getBlobUrl: function (base64, contentType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType || 'application/octet-stream' });
        return URL.createObjectURL(blob);
    },

    revokeUrl: function (url) {
        URL.revokeObjectURL(url);
    },

    chunkString: function (str, size) {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }
        return chunks;
    },

    getCombinedChunks: async function (collectionName, documentId, chunkCount) {
        try {
            console.log(`Fetching ${chunkCount} chunks for ${documentId}...`);
            const chunks = [];
            for (let i = 0; i < chunkCount; i++) {
                const chunkId = `${documentId}_${i}`;
                const doc = await this.db.collection(collectionName).doc(chunkId).get();
                if (doc.exists) {
                    chunks.push(doc.data().data);
                } else {
                    console.error(`Missing chunk ${i} for ${documentId}`);
                }
            }
            return chunks.join('');
        } catch (error) {
            console.error("Error combining chunks: ", error);
            throw error;
        }
    },

    deleteChunks: async function (collectionName, documentId, chunkCount) {
        try {
            console.log(`Deleting ${chunkCount} chunks for ${documentId}...`);
            const batch = this.db.batch();
            for (let i = 0; i < chunkCount; i++) {
                const chunkId = `${documentId}_${i}`;
                const ref = this.db.collection(collectionName).doc(chunkId);
                batch.delete(ref);
            }
            await batch.commit();
            console.log("Chunks deleted successfully");
        } catch (error) {
            console.error("Error deleting chunks: ", error);
            throw error;
        }
    }
};
