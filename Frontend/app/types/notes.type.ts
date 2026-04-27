export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  iv: string;
  tags: string | null;
  is_pinned: boolean;
  is_archived: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  iv: string;
  tags?: string;
  is_pinned?: boolean;
}

export interface CreateNoteResponse {
  message: string;
  id: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  iv?: string;
  tags?: string;
  is_archived?: boolean;
  is_pinned?: boolean;
}

export interface UpdateNoteResponse {
  id: string
}

export interface ShowNote {
  id: string | number;
  title: string;
  content: string;
  iv: string;
  tags?: string;
  created_at: string;
  displayTitle?: string;
  displayContent?: string;
}

export interface DecryptedNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface CreateShareNoteDto {
  id: string;
  iv: string;
  encrypted_title: string;
  encrypted_content: string;
  is_burn_after_read: boolean;
  expires_at: string | null;
}

export interface ShareNoteResponse {
  shareId: string; 
  expiresAt: string | null; 
  message: string; 
}

export interface SharedNoteResponse {
  iv: string;
  title: string;
  content: string;
  is_burned: boolean;
}