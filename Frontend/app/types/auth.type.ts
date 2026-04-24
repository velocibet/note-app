export interface RegisterDto {
    username: string;
    email: string;
    password: string;
    keyInfo : {
        encryptedKey: string;
        iv: string;
        salt: string;
    }
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface LoginResponse {
    username: string;
    vaultKeys: {
        vault_key_salt: string;
        encrypted_vault_key: string;
        vault_key_iv: string;
    }
}

export interface MeResponse {
    username: string;
}

export interface ChangeMasterKeyDto {
    vaultKeyInfo: {
        encryptedKey: string;
        iv: string;
        salt: string;
    };
    notes: {
        id: string;
        title: string;
        content: string;
        tags?: string;
        iv: string;
    }[];
}