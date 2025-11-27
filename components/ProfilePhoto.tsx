// components/ProfilePhoto.tsx
'use client'

import { useState, useRef } from 'react'

interface ProfilePhotoProps {
  user: {
    id: number
    name: string
    email: string
    profile_photo?: string
  }
}

export default function ProfilePhoto({ user }: ProfilePhotoProps) {
  const [photo, setPhoto] = useState(user.profile_photo || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // File validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)
      formData.append('userId', user.id.toString())

      const response = await fetch('/api/users/upload-photo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPhoto(data.photoUrl)
        alert('Profile photo updated successfully!')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('/api/users/remove-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setPhoto('')
        alert('Profile photo removed successfully!')
      }
    } catch (error) {
      console.error('Remove photo error:', error)
      alert('Failed to remove photo')
    }
  }

  return (
    <div className="flex items-center space-x-6 p-6 bg-white rounded-lg border border-gray-200">
      {/* Profile Photo Display */}
      <div className="relative">
        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Profile Photo
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Upload a photo to personalize your account
        </p>
        
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
            id="profilePhoto"
          />
          
          <label
            htmlFor="profilePhoto"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <span className="mr-2">📷</span>
                Choose Photo
              </>
            )}
          </label>
          
          <p className="text-xs text-gray-500">
            JPG, PNG, or WebP. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}