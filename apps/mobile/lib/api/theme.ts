import { Theme } from '@lactalink/types';
import { getPreference, postPreference } from '@lactalink/utilities';
import { API_URL, MMKV_KEYS } from '../constants';
import { supabase } from '../supabase';

export const getTheme = async (): Promise<Theme | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session.');
    }

    const res = await getPreference<Theme>({
      apiUrl: API_URL,
      authToken: session.access_token,
      key: MMKV_KEYS.THEME,
    });

    if ('error' in res) {
      return null;
    }
    return res.data.value;
  } catch (err) {
    //TODO: Render an error toast
    return null;
  }
};

export const updateTheme = async (theme: Theme) => {
  if (!theme) return;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session.');
    }

    const res = await postPreference({
      apiUrl: API_URL,
      authToken: session.access_token,
      key: MMKV_KEYS.THEME,
      value: theme,
    });

    if ('error' in res) return;

    return res.data.doc.value;
  } catch (err) {
    //TODO: Render an error toast
  }
};
