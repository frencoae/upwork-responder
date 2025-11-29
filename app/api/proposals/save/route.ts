// app/api/proposals/save/route.ts 
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { jobId, jobTitle, jobDescription, clientInfo, budget, skills, proposalText, status = 'saved' } = await request.json()

    if (!proposalText || !jobId) {
      return NextResponse.json({ error: 'Proposal text and Job ID are required' }, { status: 400 })
    }

    console.log('💾 Saving proposal to history for job:', jobTitle)
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
          job_title = $1,
          job_description = $2,
          client_info = $3,
          budget = $4,
          skills = $5,
          generated_proposal = $6,
          status = $7,
          updated_at = NOW()
         WHERE id = $8 AND user_id = $9`,
        [jobTitle, jobDescription, clientInfo || {}, budget || 'Not specified', skills || [], proposalText, status, proposalId, user.id]
      )
      
      console.log('✅ Existing proposal updated with ID:', proposalId)
    } else {
      // ✅ NAYA PROPOSAL CREATE KAREIN
      const proposalResult = await pool.query(
        `INSERT INTO proposals 
         (user_id, job_id, job_title, job_description, client_info, budget, skills, generated_proposal, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
         RETURNING id`,
        [user.id, jobId, jobTitle, jobDescription, clientInfo || {}, budget || 'Not specified', skills || [], proposalText, status]
      )
      
      proposalId = proposalResult.rows[0].id
      console.log('✅ New proposal saved with ID:', proposalId)
    }

    return NextResponse.json({ 
      success: true,
      message: isUpdate ? '✅ Proposal updated successfully!' : '✅ Proposal saved to history successfully!',
      proposalId: proposalId,
      isUpdate: isUpdate
    })

  } catch (error: unknown) {
    console.error('❌ Proposal save error:', error)
    
    let errorMessage = 'Failed to save proposal'
    if (error instanceof Error) {
      errorMessage = `Failed to save proposal: ${error.message}`
    }

    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 })
  }
}