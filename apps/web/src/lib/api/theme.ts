import { GetPreference, Theme, UpdatePreference } from '@lactalink/types';
import { apiFetch } from '@lactalink/utilities';
import { getServerSideURL } from '../utils/getURL';
import { createClient } from '../utils/supabase/client';

const API_URL = getServerSideURL();
const bypassToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const themeKey = 'theme';
const supabase = createClient();

export async function getTheme(): Promise<Theme> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session.');
  }

  const token = session.access_token;
  const url = new URL(`/api/payload-preferences/${themeKey}`, API_URL);

  const res = await apiFetch<GetPreference<Theme>>({ url, token, bypassToken, method: 'GET' });

  if ('error' in res) {
    throw Error(res.message);
  }

  return res.data.value;
}

export async function updateTheme(theme: Theme) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw Error('No active session.');
  }

  const token = session.access_token;
  const url = new URL(`/api/payload-preferences/${themeKey}`, API_URL);

  const res = await apiFetch<UpdatePreference<Theme>>({
    method: 'POST',
    url,
    token,
    bypassToken,
    body: { value: theme },
  });

  if ('error' in res) {
    throw Error(res.message);
  }

  return res.data.doc.value;
}
