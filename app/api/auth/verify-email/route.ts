// app/api/auth/verify-email/route.ts - NEW FILE
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ 
        success: false,
        error: 'Email is required' 
      }, { status: 400 })
    }

    console.log('📧 Email verification request for:', email)

    // Check if user exists with this exact email
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (userResult.rows.length === 0) {
      console.log('❌ No user found with email:', email)
      return NextResponse.json({ 
        success: false,
        error: 'Invalid email. Please enter the exact email you used for signup.' 
      }, { status: 404 })
    }

    const user = userResult.rows[0]
    console.log('✅ User found with email:', user.email)

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Token 1 hour ke liye valid rahega
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Purane tokens delete karein same user ke
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [user.id]
    )

    // New token save karein
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    )

    console.log('✅ Reset token generated for user:', user.email)

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully! You can now set your new password.',
      resetToken: resetToken,
      user: {
        name: user.name,
        email: user.email
      }
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Email verification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 })
  }
}