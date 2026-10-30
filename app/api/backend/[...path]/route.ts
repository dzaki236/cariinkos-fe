import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/auth";

const allowed = [
    /^kos$/,
    /^kos\/[0-9a-f-]+$/i,
    /^public\/kos$/,
    /^public\/kos\/[0-9a-f-]+$/i,
    /^kos\/[0-9a-f-]+\/facilities$/i,
    /^kos\/[0-9a-f-]+\/facilities\/[0-9a-f-]+$/i,
    /^kos\/[0-9a-f-]+\/photos$/i,
    /^kos\/[0-9a-f-]+\/photos\/[0-9a-f-]+$/i,
    /^kos\/[0-9a-f-]+\/contacts$/i,
    /^facilities$/,
    /^facilities\/[0-9a-f-]+$/i,
];

const methods = new Set(["GET", "POST", "PUT", "DELETE"]);

async function forward(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    });
    const backendToken = token?.backendToken;
    if (!backendToken) {
        return NextResponse.json({ message: "Sesi tidak valid" }, { status: 401 });
    }
    if (!methods.has(request.method)) {
        return NextResponse.json(
            { message: "Method tidak didukung" },
            { status: 405 },
        );
    }

    const { path } = await context.params;
    if (
        path.some(
            (segment) =>
                !segment ||
                segment === "." ||
                segment === ".." ||
                segment.includes("\\"),
        )
    ) {
        return NextResponse.json({ message: "Path tidak valid" }, { status: 400 });
    }
    const resourcePath = path.join("/");
    if (!allowed.some((pattern) => pattern.test(resourcePath))) {
        return NextResponse.json(
            { message: "Resource tidak diizinkan" },
            { status: 404 },
        );
    }

    const target = new URL(
        `${getApiBaseUrl()}/${path.map(encodeURIComponent).join("/")}`,
    );
    request.nextUrl.searchParams.forEach((value, key) =>
        target.searchParams.append(key, value),
    );
    const headers = new Headers({ Authorization: `Bearer ${backendToken}` });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const body =
        request.method === "GET" || request.method === "HEAD"
            ? undefined
            : await request.arrayBuffer();

    try {
        const response = await fetch(target, {
            method: request.method,
            headers,
            body,
            cache: "no-store",
        });
        const responseBody = await response.arrayBuffer();
        const responseHeaders = new Headers({
            "Content-Type":
                response.headers.get("content-type") ?? "application/json",
            "Cache-Control": "no-store",
        });
        if (response.status === 401 || response.status === 403) {
            responseHeaders.set("X-Session-Invalid", "true");
        }
        return new NextResponse(responseBody, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch {
        return NextResponse.json(
            { message: "Backend tidak dapat dijangkau" },
            { status: 502 },
        );
    }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
