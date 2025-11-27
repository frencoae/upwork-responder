//app/api/proposals/send/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { jobId, jobTitle, proposalText, originalProposal, editReason } = await request.json()

    if (!proposalText) {
      return NextResponse.json({ error: 'Proposal text is required' }, { status: 400 })
    }

    console.log('💾 Saving and training AI with proposal for job:', jobTitle)

    // Save the main proposal
    const proposalResult = await pool.query(
      `INSERT INTO proposals 
       (user_id, job_id, job_title, generated_proposal, edited_proposal, status, sent_at, created_at) 
       VALUES ($1, $2, $3, $4, $5, 'sent', NOW(), NOW()) 
       RETURNING id`,
      [user.id, jobId, jobTitle, originalProposal, proposalText]
    )

    const proposalId = proposalResult.rows[0].id

    // Save edit for AI training if there are changes
    if (originalProposal !== proposalText) {
      const learnedPatterns = await analyzeProposalEdits(originalProposal, proposalText)
      
      await pool.query(
        `INSERT INTO proposal_edits 
         (user_id, job_id, original_proposal, edited_proposal, edit_reason, learned_patterns, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [user.id, jobId, originalProposal, proposalText, editReason || 'User improvements', learnedPatterns]
      )

      console.log('🧠 AI training data saved with patterns:', learnedPatterns)
    }

    return NextResponse.json({ 
      success: true,
      message: '✅ Proposal sent successfully! AI will learn from your edits.',
      proposalId: proposalId,
      trained: originalProposal !== proposalText
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Proposal sending error:', error)
    return NextResponse.json({ 
      error: 'Failed to send proposal: ' + error.message 
    }, { status: 500 })
  }
}

// Analyze what the AI can learn from user edits
async function analyzeProposalEdits(original: string, edited: string): Promise<string[]> {
  const patterns: string[] = []
  
  // Advanced pattern analysis for AI training
  if (edited.length > original.length) patterns.push('user_adds_more_details')
  if (edited.length < original.length) patterns.push('user_prefers_conciseness')
  if (edited.includes('portfolio') && !original.includes('portfolio')) patterns.push('user_adds_portfolio_links')
  if (edited.includes('call') || edited.includes('meeting')) patterns.push('user_adds_call_to_action')
  if (edited.includes('$') || edited.includes('budget')) patterns.push('user_discusses_budget')
  if (edited.includes('experience') && !original.includes('experience')) patterns.push('user_emphasizes_experience')
  if (edited.includes('specific') || edited.includes('detailed')) patterns.push('user_prefers_specificity')
  if ((edited.match(/I/g) || []).length > (original.match(/I/g) || []).length) patterns.push('user_increases_personal_references')
  
  // Tone analysis
  if (edited.includes('excited') || edited.includes('enthusiastic')) patterns.push('user_prefers_enthusiastic_tone')
  if (edited.includes('professional') || edited.includes('expertise')) patterns.push('user_emphasizes_professionalism')
  
  return patterns
}