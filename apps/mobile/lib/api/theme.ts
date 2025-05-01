import { Theme } from '@lactalink/types';
import { API_URL } from '../constants';
import { supabase } from '../supabase';

export const getTheme = async (): Promise<Theme | null> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No active session.');
    }

    const req = await fetch(`${API_URL}/api/payload-preferences/theme`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const { value } = (await req.json()) as { value: Theme };
    return value;
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

    await fetch(`${API_URL}/api/payload-preferences/theme`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ value: theme }),
    });
  } catch (err) {
    //TODO: Render an error toast
  }
};
