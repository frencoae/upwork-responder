// app/api/auth/reset-password/route.ts - UPDATED
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json()

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ 
        success: false,
        error: 'All fields are required' 
      }, { status: 400 })
    }

    console.log('🔄 Password reset attempt with token:', token.substring(0, 10) + '...')

    // Password validation
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ 
        success: false,
        error: 'Passwords do not match' 
      }, { status: 400 })
    }

    // Find valid token
    const tokenResult = await pool.query(
      `SELECT pt.*, u.email, u.name, u.password as old_password_hash
       FROM password_reset_tokens pt 
       JOIN users u ON pt.user_id = u.id 
       WHERE pt.token = $1 AND pt.expires_at > NOW()`,
      [token]
    )

    if (tokenResult.rows.length === 0) {
      console.log('❌ Invalid or expired token')
      return NextResponse.json({ 
        success: false,
        error: 'Invalid or expired reset token. Please verify your email again.' 
      }, { status: 400 })
    }

    const resetToken = tokenResult.rows[0]
    console.log('✅ Valid token found for user:', resetToken.email)

    // ✅ NEW: Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, resetToken.old_password_hash)
    if (isSamePassword) {
      console.log('❌ User tried to use old password')
      return NextResponse.json({ 
        success: false,
        error: 'Please choose a new password. You cannot use your old password.' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user's password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, resetToken.user_id]
    )

    console.log('✅ Password updated for user:', resetToken.email)

    // Delete used token
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE token = $1',
      [token]
    )

    console.log('✅ Token deleted after successful reset')

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.' 
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Reset password error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    }, { status: 500 })
  }
}