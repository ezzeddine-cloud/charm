import { auth } from '@/lib/auth/server';
import { isAdminEmail } from '@/lib/admin-access';

export async function requireAdmin() {
  const { data } = await auth.getSession({ query: {} });
  if (!data?.user || !isAdminEmail(data.user.email)) return null;
  return data.user;
}
