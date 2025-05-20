import { Preference, Theme } from '@lactalink/types';
import { apiFetch, extractErrorMessage } from '@lactalink/utilities';
import { API_URL, MMKV_KEYS, VERCEL_BYPASS_TOKEN } from '../constants';
import { supabase } from '../supabase';

export async function getTheme(): Promise<Theme | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session.');
    }

    const token = session.access_token;
    const vercelToken = VERCEL_BYPASS_TOKEN;
    const themeKey = MMKV_KEYS.THEME;
    const url = new URL(`/api/payload-preferences/${themeKey}`, API_URL);

    const res = await apiFetch<Preference<'GET', Theme>>({ url, token, vercelToken });

    if ('error' in res) {
      throw Error(res.message);
    }

    return res.data.value;
  } catch (err) {
    console.log('Get Theme Error:', extractErrorMessage(err));
    return null;
  }
}

export async function updateTheme(theme: Theme) {
  if (!theme) return;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const token = session.access_token;
    const vercelToken = VERCEL_BYPASS_TOKEN;
    const themeKey = MMKV_KEYS.THEME;
    const url = new URL(`/api/payload-preferences/${themeKey}`, API_URL);

    const res = await apiFetch<Preference<'POST', Theme>>({
      method: 'POST',
      url,
      token,
      vercelToken,
      bodyParams: { value: theme },
    });

    if ('error' in res) {
      throw Error(res.message);
    }

    return res.data.doc.value;
  } catch (err) {
    console.log('Update Theme Error:', extractErrorMessage(err));
  }
}
