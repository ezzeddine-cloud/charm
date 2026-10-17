import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { isAdminEmail } from '@/lib/admin-access';

const sessionGuard = auth.middleware({
  loginUrl: '/compte/connexion',
});

export default async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data } = await auth.getSession({ query: {} });
    if (!data?.user) {
      const url = request.nextUrl.clone();
      url.pathname = '/compte/connexion';
      url.searchParams.set('next', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdminEmail(data.user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return sessionGuard(request);
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/compte/commandes/:path*', '/compte/adresses', '/compte/adresses/:path*'],
};
