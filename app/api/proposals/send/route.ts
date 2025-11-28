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

    if (!proposalText || !jobId) {
      return NextResponse.json({ error: 'Proposal text and Job ID are required' }, { status: 400 })
    }

    console.log('💾 Saving and sending proposal for job:', jobTitle)
    console.log('🎯 Job ID:', jobId)

    // ✅ PEHLE CHECK KAREIN KE SAME JOB KA PROPOSAL PEHLE SE HAI YA NAHI
    const existingProposal = await pool.query(
      `SELECT id, status FROM proposals WHERE user_id = $1 AND job_id = $2`,
      [user.id, jobId]
    )

    let proposalId: number
    let isUpdate = false

    if (existingProposal.rows.length > 0) {
      // ✅ UPDATE EXISTING PROPOSAL
      isUpdate = true
      proposalId = existingProposal.rows[0].id
      
      await pool.query(
        `UPDATE proposals SET 
          edited_proposal = $1,
          status = 'sent',
          sent_at = NOW(),
          updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [proposalText, proposalId, user.id]
      )
      
      console.log('✅ Existing proposal updated and sent with ID:', proposalId)
    } else {
      // ✅ NAYA PROPOSAL CREATE KAREIN
      const proposalResult = await pool.query(
        `INSERT INTO proposals 
         (user_id, job_id, job_title, generated_proposal, edited_proposal, status, sent_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, 'sent', NOW(), NOW()) 
         RETURNING id`,
        [user.id, jobId, jobTitle, originalProposal, proposalText]
      )
      
      proposalId = proposalResult.rows[0].id
      console.log('✅ New proposal sent with ID:', proposalId)
    }

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
      message: isUpdate ? '✅ Proposal updated and sent successfully!' : '✅ Proposal sent successfully!',
      proposalId: proposalId,
      trained: originalProposal !== proposalText
    })

  } catch (error: unknown) {
    console.error('❌ Proposal sending error:', error)
    
    let errorMessage = 'Failed to send proposal'
    if (error instanceof Error) {
      errorMessage = `Failed to send proposal: ${error.message}`
    } else if (typeof error === 'string') {
      errorMessage = `Failed to send proposal: ${error}`
    } else {
      errorMessage = 'Failed to send proposal: Unknown error occurred'
    }

    return NextResponse.json({ 
      success: false,
      error: errorMessage 
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
  
  // Tone analysis
  if (edited.includes('excited') || edited.includes('enthusiastic')) patterns.push('user_prefers_enthusiastic_tone')
  if (edited.includes('professional') || edited.includes('expertise')) patterns.push('user_emphasizes_professionalism')
  
  return patterns
}