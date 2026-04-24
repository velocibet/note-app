export const useUserApi = () => {
    const api = useApi('/auth');

    return {
        /**
         * 회원가입 요청을 시도합니다.
         * @param registerAuthDto username, email, password가 포함되어야 합니다.
         * @return 
         */
        getRegister: (registerAuthDto: RegisterDto) =>
            api.post<void>('/register', registerAuthDto),

        /**
         * 로그인 요청을 시도합니다.
         * @param loginAuthDto username, password가 포함되어야 합니다.
         * @returns 
         */
        getLogin: (loginAuthDto: LoginDto) =>
            api.post<LoginResponse>('/login', loginAuthDto),

        /**
         * 로그아웃 합니다.
         * @returns 
         */
        getLogout: () =>
            api.post<void>('/logout', {}),

        /**
         * 사용자의 정보를 불러옵니다.
         * @returns MeResponse
         */
        getMe: () =>
            api.get<MeResponse>('/me'),

        /**
         * 계정을 탈퇴합니다.
         * @returns void
         */
        withdraw: () =>
            api.delete<void>('/withdraw'),

        /**
         * 사용자의 개인 키를 재생성합니다.
         * @param payload ChangeMasterKeyDto
         * @returns void
         */
        changeMasterKey: (payload: ChangeMasterKeyDto) =>
            api.patch<void>('/change-master-key', payload),
        
        /**
         * 사용자의 비밀번호를 검증합니다.
         * @param payload { password : string }
         * @returns void
         */
        verifyPassword: (payload: { password: string }) =>
            api.post<void>('/verify-password', payload),
    }
};