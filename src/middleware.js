// src/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(req) {
    let res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 1. Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();

    const url = req.nextUrl.pathname;

    // 2. Tentukan kategori halaman

    const isAdminRoute = url.startsWith('/admin');
    const isAdminDashboard = url.startsWith('/admin/dashboard');
    const isProtectedPage = url.startsWith('/home') || url.startsWith('/booking-page');
    const isAuthPage = url.startsWith('/login') || url.startsWith('/register') || url === '/admin';

    // Ambil role jika user login
    let userRole = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        userRole = profile?.role;
    }

    // --- LOGIKA PROTEKSI ---

    // --- LOGIKA PROTEKSI ---

    // A. Jika mencoba akses halaman Admin Dashboard (Proteksi Admin)
    if (isAdminDashboard) {
        if (!user) {
            return NextResponse.redirect(new URL('/admin', req.url)); // Ke login admin
        }
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL('/home', req.url));
        }
    }

    // B. Jika mencoba akses halaman Home/Booking (User Area)
    if (isProtectedPage) {
        // 1. Jika belum login, lempar ke login
        if (!user) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
        // 2. Jika login tapi ADMIN, lempar balik ke dashboard (Strict Separation)
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
    }

    // C. Jika sudah login tapi ingin ke Login/Register/AdminLogin lagi
    if (isAuthPage && user) {
        if (userRole === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        } else {
            return NextResponse.redirect(new URL('/home', req.url));
        }
    }

    return res;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.svg).*)',
    ],
};