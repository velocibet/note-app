export async function saveVaultKeyToIndexedDB(username: string, vaultKeyUint8: Uint8Array) {
  const request: IDBOpenDBRequest = indexedDB.open("SecureStorage", 1);

  request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const target = event.target as IDBOpenDBRequest;
      const db = target.result;
      
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
  };

  request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");

      store.put(username, "username");
      store.put(vaultKeyUint8, "masterKey");

      transaction.oncomplete = () => {
        console.log("유저네임과 개인 키가 안전하게 저장되었습니다.");
      };
  };
}

export async function clearAllKeysFromIndexedDB() {
  const request: IDBOpenDBRequest = indexedDB.open("SecureStorage", 1);

  request.onsuccess = (event: Event) => {
    const target = event.target as IDBOpenDBRequest;
    const db = target.result;

    const transaction = db.transaction("keys", "readwrite");
    const store = transaction.objectStore("keys");

    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      console.log("모든 로컬 보안 저장소가 초기화되었습니다.");
    };
  };
}

export async function getVaultKeyFromIndexedDB(): Promise<{username: string | null, masterKey: Uint8Array | null}> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open("SecureStorage", 1);

    request.onerror = () => {
      console.error("보안 저장소 접근 실패");
      reject(new Error("Database open error"));
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        return resolve({ username: null, masterKey: null });
      }

      const transaction = db.transaction("keys", "readonly");
      const store = transaction.objectStore("keys");

      // 두 데이터를 모두 가져오기 위해 병렬 요청
      const nameReq = store.get("username");
      const keyReq = store.get("masterKey");

      // console.log(keyReq.result)

      transaction.oncomplete = () => {
        resolve({
          username: nameReq.result || null,
          masterKey: keyReq.result instanceof Uint8Array ? keyReq.result : null
        });
      };
    };
  });
}