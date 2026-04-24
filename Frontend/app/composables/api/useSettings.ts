export const useSettingsApi = () => {
  const api = useApi('/settings');

  return {
    /**
     * 현재 로그인한 사용자의 설정을 가져옵니다.
     */
    getSettings: () =>
      api.get<SettingsResponse>(''),

    /**
     * 사용자 설정을 수정합니다.
     * @param updateSettingDto theme, language 등을 포함
     */
    updateSettings: (updateSettingDto: UpdateSettingDto) =>
      api.patch<SettingsResponse>('', updateSettingDto),
  };
};