import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type BackendLoginResponse = {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
};

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Email dan kata sandi",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Kata sandi", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;

                const response = await fetch(`${getApiBaseUrl()}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                    cache: "no-store",
                });

                if (!response.ok) return null;
                const payload = (await response.json()) as BackendLoginResponse;
                if (!payload.token || !payload.user?.id || !payload.user.email)
                    return null;

                return {
                    id: payload.user.id,
                    name: payload.user.name,
                    email: payload.user.email,
                    backendToken: payload.token,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user && "backendToken" in user) {
                token.backendToken = user.backendToken;
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = String(token.userId ?? token.sub ?? "");
            }
            return session;
        },
    },
    pages: { signIn: "/login" },
};

export function getApiBaseUrl() {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) {
        throw new Error("API_BASE_URL belum dikonfigurasi");
    }
    return apiBaseUrl.replace(/\/$/, "");
}
