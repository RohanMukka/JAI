
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
    debug: true,
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    console.log("Attempting to connect to MongoDB for user upsert...");
                    const db = await getDb();
                    console.log("Connected to MongoDB, upserting user...");
                    await db.collection("users").updateOne(
                        { email: user.email },
                        {
                            $set: {
                                name: user.name,
                                image: user.image,
                                email: user.email,
                                updatedAt: new Date(),
                            },
                            $setOnInsert: {
                                createdAt: new Date(),
                            },
                        },
                        { upsert: true }
                    );
                    console.log("User upserted successfully.");
                    return true;
                } catch (error) {
                    console.error("FULL MONGODB ERROR IN SIGNIN:", error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // Add userId to session
                // @ts-ignore
                session.user.id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
