// app/api/users/update-timezone/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { timezone } = await request.json()

    if (!timezone) {
      return NextResponse.json({ error: 'Timezone is required' }, { status: 400 })
    }

    // Update user timezone
    const result = await pool.query(
      `UPDATE users 
       SET timezone = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, name, email, company_name, timezone, profile_photo`,
      [timezone, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = result.rows[0]

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: 'Timezone updated successfully'
    })

  } catch (error) {
    console.error('Timezone update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update timezone',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}