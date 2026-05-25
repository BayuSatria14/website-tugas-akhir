import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    let res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() { return req.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
                    res = NextResponse.next({ request: { headers: req.headers } });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const url = req.nextUrl.pathname;

    const isAdminArea = url.startsWith('/admin');
    const isAdminLoginPage = url === '/admin';

    // 1. TETAP PROTEKSI AREA ADMIN (Opsional)
    // Jika Anda ingin menghapus total semua proteksi, hapus blok 'if (isAdminArea)' ini.
    if (isAdminArea) {
        if (!user && !isAdminLoginPage) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

            const isAdmin = profile?.role === 'admin';

            if (isAdminLoginPage && isAdmin) {
                return NextResponse.redirect(new URL('/admin/dashboard', req.url));
            }

            if (!isAdmin && !isAdminLoginPage) {
                // Dialihkan ke homepage jika bukan admin
                return NextResponse.redirect(new URL('/', req.url));
            }
        }
    }

    // 2. PROTEKSI AREA USER DIHAPUS
    // Bagian 'isUserProtectedArea' dan 'isLoginPage' dibuang agar user bebas masuk.

    return res;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.css|.*\\.js).*)',
    ],
};