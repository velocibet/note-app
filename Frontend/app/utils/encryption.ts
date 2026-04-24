interface vaultKey {
    vault_key_salt: string;
    encrypted_vault_key: string;
    vault_key_iv: string;
}

interface EncryptedNoteData {
  title: string;
  content: string;
  tags: string | null;
  iv: string;
}

/**
 * 랜덤 Vault Key 발급 후 비밀번호로 암호화합니다.
 * @param password 비밀번호
 * @returns 서버 저장용 (IV, EncryptedKey, Salt) 반환
 */
export async function generateAndEncryptVaultKey(password: string) {
  const encoder = new TextEncoder();
  const vaultKeyRaw = window.crypto.getRandomValues(new Uint8Array(32));
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const masterKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    masterKey,
    vaultKeyRaw
  );

  const bufferToBase64 = (buf: any) => btoa(String.fromCharCode(...new Uint8Array(buf)));

  return {
    vaultKeyInfo: {
      encryptedKey: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
    },
    // rawVaultKeyB64: bufferToBase64(vaultKeyRaw)
  };
}

/**
 * 저장된 정보와 비밀번호를 이용해 원본 Vault Key를 복구합니다.
 * @param password 사용자 비밀번호
 * @param vaultKeyInfo 서버에서 받아온 암호화 정보 (encryptedKey, iv, salt)
 * @returns 복구된 원본 Vault Key (Uint8Array)
 */
export async function decryptVaultKey(
  password: string,
  vaultKeyInfo: vaultKey
) {
  const encoder = new TextEncoder();

  const base64ToBuffer = (base64: string) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const encryptedBuffer = base64ToBuffer(vaultKeyInfo.encrypted_vault_key);
  const iv = base64ToBuffer(vaultKeyInfo.vault_key_iv);
  const salt = base64ToBuffer(vaultKeyInfo.vault_key_salt);

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const masterKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  try {
    const decryptedRaw = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      masterKey,
      encryptedBuffer
    );

    return new Uint8Array(decryptedRaw);
  } catch (error) {
    throw new Error("비밀번호가 틀렸거나 데이터가 손상되었습니다.");
  }
}

/**
 * 노트 데이터 암호화 (제목, 본문, 태그)
 * @param vaultKeyRaw 복구된 원본 Vault Key (Uint8Array)
 * @param plainData 평문 제목, 본문, 태그 배열
 */
export async function encryptNote(
  vaultKeyRaw: Uint8Array,
  plainData: { title: string; content: string; tags: string[] }
): Promise<EncryptedNoteData> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // AES-GCM용 12바이트 IV

  // Vault Key를 Web Crypto API용 키 객체로 변환
  const key = await window.crypto.subtle.importKey(
    "raw",
    vaultKeyRaw as BufferSource,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const encryptField = async (text: string) => {
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(text)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  };

  const bufferToBase64 = (buf: Uint8Array) => btoa(String.fromCharCode(...buf));

  return {
    title: await encryptField(plainData.title),
    content: await encryptField(plainData.content),
    tags: await encryptField(JSON.stringify(plainData.tags)), // 태그 배열을 문자열로 변환 후 암호화
    iv: bufferToBase64(iv),
  };
}

/**
 * 노트 데이터 복호화
 * @param vaultKeyRaw 복구된 원본 Vault Key (Uint8Array)
 * @param encryptedData 서버에서 받아온 암호화된 데이터들
 */
export async function decryptNote(
  vaultKeyRaw: Uint8Array,
  encryptedData: EncryptedNoteData
): Promise<{ title: string; content: string; tags: string[] }> {
  const decoder = new TextDecoder();

  const base64ToBuffer = (base64: string) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const iv = base64ToBuffer(encryptedData.iv);

  const key = await window.crypto.subtle.importKey(
    "raw",
    vaultKeyRaw as BufferSource,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptField = async (cipherText: string) => {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      base64ToBuffer(cipherText)
    );

    return decoder.decode(decrypted);
  };

  const decryptTags = async (cipherText: string | null): Promise<string[]> => {
    if (!cipherText) return [];

    try {
      const decrypted = await decryptField(cipherText);
      const parsed = JSON.parse(decrypted);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return {
    title: await decryptField(encryptedData.title),
    content: await decryptField(encryptedData.content),
    tags: await decryptTags(encryptedData.tags),
  };
}