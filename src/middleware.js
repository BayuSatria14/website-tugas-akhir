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

    // Ambil user secara aman
    const { data: { user } } = await supabase.auth.getUser();
    const url = req.nextUrl.pathname;

    const isAdminArea = url.startsWith('/admin');
    const isAdminLoginPage = url === '/admin';
    const isUserProtectedArea = url.startsWith('/home') || url.startsWith('/booking-page');
    const isLoginPage = url === '/login' || url === '/register';

    // 1. Proteksi Area Admin
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
                return NextResponse.redirect(new URL('/home', req.url));
            }
        }
    }

    // 2. Proteksi Area User
    if (isUserProtectedArea && !user) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // 3. Redireksi Jika Sudah Login
    if (isLoginPage && user) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Filter agar middleware TIDAK mengecek file statis/gambar
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.css|.*\\.js).*)',
    ],
};