import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        backendToken?: string;
        role?: "owner" | "user";
    }

    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: "owner" | "user";
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        userId?: string;
        role?: "owner" | "user";
    }
}
