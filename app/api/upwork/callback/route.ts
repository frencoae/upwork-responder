// app/api/upwork/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard?error=oauth_failed&message=' + error, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?error=no_authorization_code', request.url))
    }

    console.log('✅ Received authorization code:', code)
    
    // Redirect to dashboard with code for token exchange
    return NextResponse.redirect(new URL(`/dashboard?upwork_code=${code}&success=upwork_connected`, request.url))
    
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=callback_failed', request.url))
  }
}