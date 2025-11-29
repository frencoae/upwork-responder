// app/api/users/upload-photo/route.ts 
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Profile photo upload request received')
    
    const user = await getCurrentUser()
    console.log('👤 Current user:', user?.id)
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('profilePhoto') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('📁 File received:', file.name, file.size, file.type)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `profile-${user.id}-${timestamp}.${fileExtension}`

    // Define upload path
    const uploadDir = join(process.cwd(), 'public/uploads/profiles')
    const filepath = join(uploadDir, filename)

    try {
      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true })
      console.log('✅ Upload directory created/verified')
    } catch (dirError) {
      console.log('📁 Directory already exists')
    }

    // Save file
    await writeFile(filepath, buffer)
    console.log('💾 File saved to:', filepath)

    // Generate public URL
    const photoUrl = `/uploads/profiles/${filename}`

    // Update user in database
    await pool.query(
      'UPDATE users SET profile_photo = $1 WHERE id = $2',
      [photoUrl, user.id]
    )

    console.log('✅ Database updated successfully with:', photoUrl)

    return NextResponse.json({ 
      success: true, 
      photoUrl,
      message: 'Profile photo uploaded successfully' 
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Upload error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to upload photo: ' + error.message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Remove photo request received')
    
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Remove photo from database
    await pool.query(
      'UPDATE users SET profile_photo = NULL WHERE id = $1',
      [user.id]
    )

    console.log('✅ Photo removed from database')

    return NextResponse.json({ 
      success: true,
      message: 'Profile photo removed successfully' 
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Remove photo error:', error.message)
    return NextResponse.json({ 
      error: 'Failed to remove photo' 
    }, { status: 500 })
  }
}