// app/api/auth/route.ts - UPDATED SINGLE USER FIX
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import pool from '../../../lib/database'
import { createSession, getCurrentUser } from '../../../lib/auth'
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, company_name } = await request.json()

    if (!action || !email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // ✅ SINGLE USER RESTRICTION - STRICTER CHECK
    if (action === 'signup') {
      const existingUsers = await pool.query('SELECT COUNT(*) as count FROM users')
      const userCount = parseInt(existingUsers.rows[0].count)
      
      if (userCount > 0) {
        return NextResponse.json({ 
          error: '❌ This application is for single user only. Please login with existing account.' 
        }, { status: 403 })
      }
    }

    if (action === 'signup') {
      if (!name) {
        return NextResponse.json({ 
          error: 'Name is required for signup' 
        }, { status: 400 })
      }

      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1', 
        [email.toLowerCase().trim()]
      )
      
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ 
          error: 'User with this email already exists' 
        }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      const result = await pool.query(
        'INSERT INTO users (name, email, password, company_name) VALUES ($1, $2, $3, $4) RETURNING id, name, email, company_name',
        [name, email.toLowerCase().trim(), hashedPassword, company_name || '']
      )

      const user = result.rows[0]
      const token = await createSession(user.id)

      cookies().set('session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      return NextResponse.json({ 
        message: 'Account created successfully!', 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          company_name: user.company_name
        } 
      })
    }

    if (action === 'login') {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', 
        [email.toLowerCase().trim()]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json({ 
          error: 'Invalid email or password' 
        }, { status: 400 })
      }

      const user = result.rows[0]
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: 'Invalid email or password' 
        }, { status: 400 })
      }

      const token = await createSession(user.id)

      cookies().set('session-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60
      })

      return NextResponse.json({ 
        message: 'Login successful!', 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email,
          company_name: user.company_name
        } 
      })
    }

    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 })

  } catch (error: any) {
    console.error('Auth POST error:', error.message)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('session-token')?.value
    
    if (token) {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token])
    }
    
    cookieStore.delete('session-token')
    
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}