// app/dashboard/history/page.tsx 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Proposal {
  id: number
  job_title: string
  job_description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client_info: any
  budget: string
  skills: string[]
  generated_proposal: string
  edited_proposal: string
  status: string
  sent_at: string
  created_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedProposal, setEditedProposal] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    loadProposals()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const loadProposals = async () => {
    try {
      setError('')
      const response = await fetch('/api/proposals/history')
      const data = await response.json()

      if (response.ok) {
        setProposals(data.proposals || [])
        console.log('✅ Loaded proposals:', data.proposals)
      } else {
        setError(data.error || 'Failed to load proposals')
        setProposals([])
      }
    } catch (error) {
      console.error('Failed to load proposals:', error)
      setError('Network error. Please try again.')
      setProposals([])
    }
  }

  const startEditing = (proposal: Proposal) => {
    setEditingId(proposal.id)
    setEditedProposal(proposal.edited_proposal || proposal.generated_proposal)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditedProposal('')
  }

  const saveProposal = async (id: number) => {
    if (!editedProposal.trim()) {
      alert('Proposal cannot be empty')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/proposals/history', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: id,
          editedProposal: editedProposal
        })
      })

      const data = await response.json()

      if (response.ok) {
        await loadProposals()
        setEditingId(null)
        setEditedProposal('')
        alert('Proposal updated successfully!')
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving proposal:', error)
      alert('Failed to update proposal: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProposal = async (id: number) => {
    if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch('/api/proposals/history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: id })
      })

      const data = await response.json()

      if (response.ok) {
        await loadProposals()
        alert('Proposal deleted successfully!')
      } else {
        throw new Error(data.error || 'Failed to delete')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error deleting proposal:', error)
      alert('Failed to delete proposal: ' + error.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading History...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposals History</h1>
          <p className="text-gray-600">
            View and manage your generated proposals - All sent and saved proposals are stored here
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button 
              onClick={loadProposals}
              className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Proposals List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4 text-6xl">📝</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Proposals Yet</h3>
              <p className="text-gray-500 mb-6">Your generated proposals will appear here once you save or send them</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Your First Proposal
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {proposal.job_title || 'Untitled Job'}
                      </h3>
                      
                      {/* Job Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Budget</h4>
                          <p className="text-blue-700 font-semibold">{proposal.budget || 'Not specified'}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-1">Status</h4>
                          <p className={`font-semibold ${
                            proposal.status === 'sent' ? 'text-green-600' : 
                            proposal.status === 'saved' ? 'text-blue-600' : 'text-yellow-600'
                          }`}>
                            {proposal.status || 'draft'}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-purple-900 mb-1">Created</h4>
                          <p className="text-purple-700 font-semibold">
                            {new Date(proposal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {proposal.skills && proposal.skills.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Required:</h4>
                          <div className="flex flex-wrap gap-1">
                            {proposal.skills.map((skill, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Job Description Preview */}
                      {proposal.job_description && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Job Description:</h4>
                          <p className="text-gray-600 text-sm line-clamp-3 bg-gray-50 p-3 rounded border">
                            {proposal.job_description}
                          </p>
                        </div>
                      )}

                      {/* Proposal Content */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          {editingId === proposal.id ? 'Edit Proposal:' : 'Proposal:'}
                        </h4>
                        
                        {editingId === proposal.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editedProposal}
                              onChange={(e) => setEditedProposal(e.target.value)}
                              rows={8}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Write your proposal..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveProposal(proposal.id)}
                                disabled={saving}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {saving ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={saving}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                              {proposal.edited_proposal || proposal.generated_proposal || 'No proposal content available'}
                            </p>
                            
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => startEditing(proposal)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteProposal(proposal.id)}
                                disabled={deletingId === proposal.id}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                              >
                                {deletingId === proposal.id ? 'Deleting...' : '🗑️ Delete'}
                              </button>
                              <button
                                onClick={() => {
                                  const textToCopy = proposal.edited_proposal || proposal.generated_proposal
                                  if (textToCopy) {
                                    navigator.clipboard.writeText(textToCopy)
                                    alert('Proposal copied to clipboard!')
                                  }
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                              >
                                📋 Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {proposals.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{proposals.length}</div>
              <div className="text-gray-600">Total Proposals</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {proposals.filter(p => p.status === 'sent').length}
              </div>
              <div className="text-gray-600">Sent Proposals</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {proposals.filter(p => p.status === 'saved').length}
              </div>
              <div className="text-gray-600">Saved Proposals</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {proposals.filter(p => p.edited_proposal).length}
              </div>
              <div className="text-gray-600">Edited Proposals</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}