import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'SecureStorage'
const DB_VERSION = 1
const STORE_NAME = 'keys'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      },
    })
  }
  return dbPromise
}

export async function saveVaultKeyToIndexedDB(
  username: string,
  vaultKeyUint8: Uint8Array
) {
  const db = await getDB()

  await db.put(STORE_NAME, username, 'username')
  await db.put(STORE_NAME, vaultKeyUint8, 'masterKey')

  console.log('유저네임과 개인 키가 안전하게 저장되었습니다.')
}

export async function clearAllKeysFromIndexedDB() {
  const db = await getDB()

  await db.clear(STORE_NAME)

  console.log('모든 로컬 보안 저장소가 초기화되었습니다.')
}

export async function getVaultKeyFromIndexedDB(): Promise<{
  username: string | null
  masterKey: Uint8Array | null
}> {
  const db = await getDB()

  // 병렬로 가져오기
  const [username, masterKey] = await Promise.all([
    db.get(STORE_NAME, 'username'),
    db.get(STORE_NAME, 'masterKey'),
  ])

  return {
    username: username ?? null,
    masterKey: masterKey instanceof Uint8Array ? masterKey : null,
  }
}