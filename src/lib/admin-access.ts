export const ADMIN_EMAILS = ['ezzedine.zouiten@gmail.com', 'chaouachisinda123@gmail.com'];

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
