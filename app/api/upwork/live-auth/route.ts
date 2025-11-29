//app/api/upwork/live-auth/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const clientId = process.env.UPWORK_CLIENT_ID
    const redirectUri = process.env.UPWORK_REDIRECT_URI
    
    if (!clientId || !redirectUri) {
      return NextResponse.json({ 
        success: false,
        error: 'Upwork API not configured. Please add UPWORK_CLIENT_ID and UPWORK_REDIRECT_URI to environment variables.' 
      }, { status: 500 })
    }

    // Generate OAuth URL with proper parameters
    const authUrl = new URL('https://www.upwork.com/ab/account-security/oauth2/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'r_basic r_work r_jobs r_search r_proposals w_proposals')
    
    // Add state for security
    const state = `user_${user.id}_${Date.now()}`
    authUrl.searchParams.set('state', state)

    console.log('🎯 Generated OAuth URL for user:', user.id)
    
    return NextResponse.json({ 
      success: true,
      url: authUrl.toString(),
      message: 'OAuth URL generated successfully'
    })
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { authorizationCode } = await request.json()

    if (!authorizationCode) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 })
    }

    const clientId = process.env.UPWORK_CLIENT_ID
    const clientSecret = process.env.UPWORK_CLIENT_SECRET
    const redirectUri = process.env.UPWORK_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ 
        error: 'Upwork API not configured properly' 
      }, { status: 500 })
    }

    console.log('🔄 Exchanging authorization code for access token...')

    // Exchange authorization code for access token
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const tokenResponse = await fetch('https://www.upwork.com/api/v3/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', errorText)
      return NextResponse.json({ 
        error: 'Failed to exchange authorization code for token' 
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Token exchange successful')
    
    // Save tokens to database
    await pool.query(
      `INSERT INTO upwork_accounts (user_id, access_token, refresh_token, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         access_token = $2, 
         refresh_token = $3, 
         created_at = NOW()`,
      [user.id, tokenData.access_token, tokenData.refresh_token]
    )

    console.log('✅ Upwork account connected successfully for user:', user.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Upwork account connected successfully! You can now load real jobs and send proposals.'
    })
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ OAuth token exchange error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to connect Upwork account: ' + error.message 
    }, { status: 500 })
  }
}