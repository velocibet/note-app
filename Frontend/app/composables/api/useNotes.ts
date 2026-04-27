export const useNotesApi = () => {
    const api = useApi('/notes');

    return {
        /**
         * 새로운 보안 노트를 생성합니다.
         * @param createNoteDto title, encrypted_content, iv, tags, is_pinned 포함
         */
        createNote: (createNoteDto: CreateNoteDto) =>
            api.post<CreateNoteResponse>('/', createNoteDto),

        /**
         * 사용자가 작성한 노트들을 불러옵니다.
         * @returns Note[]
         */
        getNotes: () =>
            api.get<Note[]>(''),

        /**
         * 특정 노트를 상세 조회합니다. (암호화된 본문 포함)
         * @param id 노트의 ULID
         */
        getNote: (id: string) =>
            api.get<Note>(`/${id}`),

        /**
         * 특정 노트를 업데이트 합니다 (암호화 후 전달)
         * @param id 노트의 아이디
         * @param updateNoteDto UpdateNoteDto
         * @returns UpdateNoteResponse
         */
        updateNote: (id: string, updateNoteDto: UpdateNoteDto) =>
            api.patch<UpdateNoteResponse>(`/${id}`, updateNoteDto),

        /**
         * 노트를 휴지통으로 보냅니다 (Soft Delete)
         */
        deleteNote: (id: string) =>
            api.delete(`/${id}`),

        /**
         * 노트를 영구적으로 삭제합니다 (Hard Delete)
         */
        permanentlyDeleteNote: (id: string) =>
            api.delete(`/${id}/permanent`),

        /**
         * 휴지통에 있는 노트를 복구합니다.
         */
        restoreNote: (id: string) =>
            api.patch(`/${id}/restore`, {}),
            
        /**
         * 노트를 아카이브/해제 합니다.
         */
        toggleArchive: (id: string, isArchived: boolean) =>
            api.patch(`/${id}`, { is_archived: isArchived }),

        /**
         * 보안 공유 링크 생성
         * @param id 원본 노트 ID (Param)
         * @param shareDto 공유용 암호화 데이터 (Body)
         */
        shareNote: (id: string, shareDto: CreateShareNoteDto) =>
            api.post<ShareNoteResponse>(`/${id}/share`, shareDto),

        /**
         * 공유된 노트 조회 (Public)
         * 주의: 백엔드 컨트롤러에서 이 엔드포인트는 가드를 통과하도록 설정해야 함
         */
        getSharedNote: (shareId: string) =>
            api.get<SharedNoteResponse>(`/${shareId}/share`),
    }
};