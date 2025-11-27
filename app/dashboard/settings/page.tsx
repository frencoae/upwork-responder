// app/dashboard/settings/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfilePhoto({ user }: { user: any }) {
  const [photo, setPhoto] = useState(user?.profile_photo || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if photo exists and is valid
  const hasValidPhoto = photo && !photo.includes('default-avatar')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)

      console.log('🔄 Uploading photo...')
      
      const response = await fetch('/api/users/upload-photo', {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload successful:', data)
        
        // Set the new photo URL immediately
        setPhoto(data.photoUrl)
        alert('✅ Profile photo updated successfully!')
        
        // Small delay then reload to ensure everything is updated
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
      } else {
        const errorData = await response.json()
        console.error('❌ Upload failed:', errorData)
        alert('❌ Failed to upload photo: ' + (errorData.error || 'Unknown error'))
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      alert('❌ Network error. Please check console for details.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) return

    try {
      console.log('🔄 Removing photo...')
      
      const response = await fetch('/api/users/upload-photo', {
        method: 'DELETE',
      })

      console.log('📡 Remove response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Remove successful:', data)
        
        // Clear photo immediately
        setPhoto('')
        alert('✅ Profile photo removed successfully!')
        
        // Reload to reflect changes
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
      } else {
        const errorData = await response.json()
        console.error('❌ Remove failed:', errorData)
        alert('❌ Failed to remove photo: ' + (errorData.error || 'Unknown error'))
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('❌ Remove error:', error)
      alert('❌ Network error. Please check console for details.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
      
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* Photo Display */}
        <div className="flex-shrink-0">
          {hasValidPhoto ? (
            <div className="relative">
              {/* Actual uploaded photo */}
              <img
                src={photo}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                onError={(e) => {
                  // If image fails to load, fall back to initial
                  console.log('🖼️ Image failed to load, using fallback')
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              {/* Fallback initial - hidden but ready */}
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-blue-500 shadow-lg opacity-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              <button
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors border-2 border-white shadow-md"
                title="Remove photo"
              >
                ×
              </button>
            </div>
          ) : (
            // No photo - show initial
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-4 border-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
              id="profilePhoto"
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choose Photo
                  </>
                )}
              </button>
              
              {hasValidPhoto && (
                <button
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                JPG, PNG, or WebP. Max size 5MB.
              </p>
              
              {/* Status indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${hasValidPhoto ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600 font-medium">
                  {hasValidPhoto ? 'Photo uploaded successfully!' : 'No photo uploaded'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Professional Editable Field Component
function EditableField({ 
  label, 
  value, 
  onSave,
  type = "text",
  placeholder = ""
}: {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  type?: string;
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditedValue(value);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    if (!editedValue.trim()) {
      alert(`${label} cannot be empty`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedValue.trim());
      // Success - exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Failed to save ${label.toLowerCase()}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        
        {/* EDIT/SAVE/CANCEL BUTTONS */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Saving
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 shadow-sm"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>
      
      {/* FIELD CONTENT */}
      {isEditing ? (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type={type}
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
            placeholder={placeholder}
            disabled={isSaving}
          />
          <p className="text-xs text-gray-500">
            Press Enter to save, Esc to cancel
          </p>
        </div>
      ) : (
        <p className="text-gray-900 text-base font-medium">{value || <span className="text-gray-400 italic">Not set</span>}</p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        console.log('✅ User loaded:', userData)
      } else {
        console.log('❌ Auth failed, redirecting to login')
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('❌ Auth error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const showStatus = (status: 'saving' | 'success' | 'error') => {
    setSaveStatus(status);
    if (status !== 'saving') {
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSaveProfile = async (field: string, value: string) => {
    showStatus('saving');
    
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local user state with the returned user data
        setUser(data.user);
        showStatus('success');
        return Promise.resolve();
      } else {
        showStatus('error');
        return Promise.reject(data.error || 'Failed to update profile');
      }
    } catch (error) {
      showStatus('error');
      return Promise.reject(error);
    }
  };

  const handleSaveName = (name: string) => handleSaveProfile('name', name);
  const handleSaveEmail = (email: string) => handleSaveProfile('email', email);
  const handleSaveCompany = (companyName: string) => handleSaveProfile('company_name', companyName);

  const handleChangePassword = () => {
    alert('Change password functionality would be implemented here');
  };

  const handleTimezoneChange = async (timezone: string) => {
    showStatus('saving');
    try {
      const response = await fetch('/api/users/update-timezone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timezone }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        showStatus('success');
      } else {
        throw new Error(data.error || 'Failed to update timezone');
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
      showStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* PROFILE PHOTO SECTION */}
        {user && <ProfilePhoto user={user} />}

        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            <EditableField
              label="Email Address"
              value={user?.email || "syedalibukhairshah16@gmail.com"}
              onSave={handleSaveEmail}
              type="email"
              placeholder="Enter your email address"
            />
            
            <EditableField
              label="Full Name"
              value={user?.name || "All Bukhari"}
              onSave={handleSaveName}
              placeholder="Enter your full name"
            />
            
            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={handleChangePassword}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors group"
              >
                <svg className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Company */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Company</h2>
          
          <EditableField
            label="Company Name"
            value={user?.company_name || "Name of your company"}
            onSave={handleSaveCompany}
            placeholder="Enter your company name"
          />
        </div>

        {/* Timezone Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Timezone Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Timezone</label>
                <p className="text-gray-900 text-base font-medium">{user?.timezone || 'Asia/Karachi'}</p>
              </div>
              <select 
                value={user?.timezone || 'Asia/Karachi'}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
              >
                <option value="Asia/Karachi">Asia/Karachi</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">
              This timezone will be used to display all dates and times in the dashboard.
            </p>
          </div>
        </div>

        {/* Status Notification */}
        {saveStatus !== 'idle' && (
          <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-300 ${
            saveStatus === 'saving' ? 'bg-blue-500 text-white' :
            saveStatus === 'success' ? 'bg-green-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {saveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving changes...</span>
              </>
            )}
            {saveStatus === 'success' && (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Changes saved successfully!</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Failed to save changes</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}