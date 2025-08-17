import { NextAuthOptions } from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'

// Only create Supabase client if environment variables are available
let supabase: any = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.warn('Supabase not configured, using demo authentication only');
}

export const authOptions: NextAuthOptions = {
  adapter: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXTAUTH_SECRET ? 
    SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      secret: process.env.NEXTAUTH_SECRET,
    }) : undefined,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo users for testing
        const demoUsers = {
          'admin@edu.com': { password: 'admin123', role: 'admin', name: 'System Admin' },
          'teacher@edu.com': { password: 'teacher123', role: 'teacher', name: 'Teacher' },
          'student@edu.com': { password: 'student123', role: 'student', name: 'Student' },
        };

        const demoUser = demoUsers[credentials.email as keyof typeof demoUsers];
        if (demoUser && demoUser.password === credentials.password) {
          return {
            id: credentials.email,
            email: credentials.email,
            name: demoUser.name,
            role: demoUser.role,
          }
        }

        // If Supabase is configured, try real authentication
        if (supabase) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

            if (authError || !authData.user) {
              return null
            }

            // Get user data from our table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('email', credentials.email)
              .single()

            return {
              id: authData.user.id,
              email: authData.user.email,
              name: userData?.name || authData.user.email,
              role: userData?.role || 'student',
            }
          } catch (error) {
            console.error('Supabase auth error:', error)
            return null
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
