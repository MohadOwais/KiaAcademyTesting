import NextAuth from 'next-auth'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_APP_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async redirect({ url, baseUrl }) {
      const isLocalhost = baseUrl.includes("localhost");
      if (isLocalhost) {
        return "http://localhost:3000/auth"
      }
      const productionBaseUrl = "https://kiacademy.in";
      if (url.startsWith(productionBaseUrl)) {
        return `${productionBaseUrl}/auth`;
      } else {
        return `${productionBaseUrl}/auth`
      }
    },
  },

})

export { handler as GET, handler as POST }