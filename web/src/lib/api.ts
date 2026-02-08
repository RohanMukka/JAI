
import { getSession } from "next-auth/react";


export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const session = await getSession(); // This only works on client. For server components use getServerSession

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const url = endpoint;


    try {
        const res = await fetch(url, {
            ...options,
            headers,
        });

        if (!res.ok) {
            // Handle 401/403 etc.
            const errorBody = await res.text();
            throw new Error(`API Error ${res.status}: ${errorBody}`);
        }

        // Attempt to parse JSON
        try {
            return await res.json();
        } catch {
            return null; // or text
        }

    } catch (error) {
        console.error(`Fetch API error for ${endpoint}:`, error);
        throw error;
    }
}
