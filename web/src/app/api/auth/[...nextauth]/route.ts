
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Persist the access_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) { // Using any for quick mvp, should definetypes
            // Send properties to the client, like an access_token from a provider.
            session.accessToken = token.accessToken;
            session.provider = token.provider;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Debug: Check if Google Client ID is present
if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn("⚠️ WARNING: GOOGLE_CLIENT_ID is missing or empty in .env.local!");
} else {
    console.log("✅ GOOGLE_CLIENT_ID is set:", process.env.GOOGLE_CLIENT_ID.substring(0, 5) + "...");
}

export { handler as GET, handler as POST };
