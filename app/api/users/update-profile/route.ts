// app/api/users/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { name, email, company_name, timezone } = await request.json()

    // Validate required fields
    if (!name && !email && !company_name && !timezone) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Build dynamic update query
    const updateFields = []
    const values = []
    let paramCount = 1

    if (name) {
      updateFields.push(`name = $${paramCount}`)
      values.push(name)
      paramCount++
    }

    if (email) {
      // Check if email already exists (if changing email)
      if (email !== user.email) {
        const existingEmail = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, user.id]
        )
        if (existingEmail.rows.length > 0) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }
      }
      updateFields.push(`email = $${paramCount}`)
      values.push(email)
      paramCount++
    }

    if (company_name) {
      updateFields.push(`company_name = $${paramCount}`)
      values.push(company_name)
      paramCount++
    }

    if (timezone) {
      updateFields.push(`timezone = $${paramCount}`)
      values.push(timezone)
      paramCount++
    }

    // Add user ID as last parameter
    values.push(user.id)

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, name, email, company_name, timezone, profile_photo
    `

    const result = await pool.query(query, values)
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = result.rows[0]

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}