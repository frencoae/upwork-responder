// app/api/auth/forgot-password/route.ts - UPDATED (NO EMAIL)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔐 Password reset request for:', email)

    // Check if user exists with this email
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      console.log('❌ User not found with email:', email)
      return NextResponse.json({ 
        error: 'Invalid email address. Please enter the same email you used for signup.' 
      }, { status: 400 })
    }

    const user = userResult.rows[0]
    console.log('✅ User verified:', user.email)

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
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 })
  }
}