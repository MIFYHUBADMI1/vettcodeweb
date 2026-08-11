/**
 * NextAuth.js Configuration
 * Google OAuth + Email/Password with verification
 */

import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '@/lib/mongodb'
import { UserModel } from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    // Email/Password (Credentials)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        // Find user
        const user = await UserModel.findByEmail(credentials.email)
        
        if (!user) {
          throw new Error('No user found with this email')
        }

        // Check if user used Google OAuth
        if (!user.password) {
          throw new Error('Please sign in with Google')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password)
        
        if (!isValid) {
          throw new Error('Invalid password')
        }

        // Check email verification
        if (!user.emailVerified) {
          throw new Error('Please verify your email first')
        }

        return {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // If signing in with Google
      if (account?.provider === 'google') {
        // Find or create user
        let dbUser = await UserModel.findByEmail(user.email!)
        
        if (!dbUser) {
          // Create new user with Google OAuth
          dbUser = await UserModel.create({
            email: user.email!,
            name: user.name,
            image: user.image,
            plan: 'free',
            emailVerified: new Date(), // Google emails are pre-verified
            provider: 'google',
          })
          
          // Send welcome email
          await sendWelcomeEmail(user.email!, user.name || undefined)
        } else {
          // Update last login
          await UserModel.updateLastLogin(dbUser._id!.toString())
        }
      }
      
      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in
        const dbUser = await UserModel.findByEmail(user.email!)
        
        if (dbUser) {
          token.userId = dbUser._id!.toString()
          token.plan = dbUser.plan
          token.emailVerified = !!dbUser.emailVerified
        }
      }
      
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.plan = token.plan as string
        session.user.emailVerified = token.emailVerified as boolean
      }
      
      return session
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user signed in: ${user.email}`)
      }
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
