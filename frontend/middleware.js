import { NextResponse } from 'next/server';

export function middleware(request) {
    // 1. Get the requested route path
    const path = request.nextUrl.pathname;

    // 2. Define which paths are public (don't require login)
    const isPublicPath = path === '/' || path === '/login' || path === '/signup';

    // 3. Get the token from the cookies
    const token = request.cookies.get('mindmate_token')?.value || '';

    // 4. Logic: If trying to access a protected route WITHOUT a token, kick to login
    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. Logic: If logged in, prevent them from seeing the Login/Signup pages again
    if ((path === '/login' || path === '/signup') && token) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Allow the request to proceed if all is well
    return NextResponse.next();
}

// 6. Tell Next.js exactly which routes to run this security check on
export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/chat',
        '/dashboard',
        '/journal',
        '/settings'
    ]
};