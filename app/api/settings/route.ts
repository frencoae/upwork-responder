//app/api/settings/route.ts


import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth'
import pool from '../../../lib/database'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Load user's settings
    const result = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [user.id]
    )

    const defaultSettings = {
      profile: {
        email: user.email,
        fullName: user.name,
        companyName: user.company_name || '',
        timezone: user.timezone || 'Asia/Karachi'
      },
      subscription: {
        plan: user.subscription_plan || 'Trial',
        status: 'active'
      }
    }

    const settings = result.rows[0]?.settings || defaultSettings

    return NextResponse.json({ 
      success: true,
      settings 
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load settings' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { settings } = await request.json()

    // Save user's settings
    await pool.query(
      `INSERT INTO user_settings (user_id, settings) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET settings = $2, updated_at = CURRENT_TIMESTAMP`,
      [user.id, JSON.stringify(settings)]
    )

    // Also update user table if profile info changed
    if (settings.profile) {
      await pool.query(
        `UPDATE users SET name = $1, company_name = $2, timezone = $3 WHERE id = $4`,
        [settings.profile.fullName, settings.profile.companyName, settings.profile.timezone, user.id]
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Settings saved successfully' 
    })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to save settings' 
    }, { status: 500 })
  }
}