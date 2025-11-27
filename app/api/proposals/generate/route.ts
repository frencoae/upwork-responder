// app/api/proposals/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getCurrentUser } from '../../../../lib/auth'
import pool from '../../../../lib/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { jobId, jobTitle, jobDescription, clientInfo, budget, skills } = await request.json()

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
    }

    console.log('🤖 Generating professional proposal for:', jobTitle)

    // Load user's prompt settings for personalized proposals
    const settingsResult = await pool.query(
      'SELECT basic_info, proposal_templates, ai_settings FROM prompt_settings WHERE user_id = $1',
      [user.id]
    )

    let userSettings = {
      basicInfo: {
        specialty: 'Full Stack Development',
        provisions: 'Web Applications, Mobile Apps, API Development',
        hourlyRate: '$25-50'
      },
      proposalTemplates: [
        {
          id: '1',
          content: `Write a professional Upwork proposal that shows understanding of client needs and highlights relevant experience.`
        }
      ],
      aiSettings: {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 600
      }
    }

    if (settingsResult.rows.length > 0) {
      const dbSettings = settingsResult.rows[0]
      userSettings = {
        basicInfo: dbSettings.basic_info || userSettings.basicInfo,
        proposalTemplates: dbSettings.proposal_templates || userSettings.proposalTemplates,
        aiSettings: dbSettings.ai_settings || userSettings.aiSettings
      }
    }

    // Build advanced prompt with user's personal info
    const prompt = `
PROFESSIONAL UPWORK PROPOSAL GENERATION

CLIENT JOB DETAILS:
Job Title: ${jobTitle}
Description: ${jobDescription}
Budget: ${budget}
Required Skills: ${skills?.join(', ') || 'Not specified'}
Client: ${clientInfo?.name || 'Unknown'} (Rating: ${clientInfo?.rating || 'N/A'})

FREELANCER PROFILE:
Name: ${user.name}
Specialty: ${userSettings.basicInfo.specialty}
Services: ${userSettings.basicInfo.provisions}
Hourly Rate: ${userSettings.basicInfo.hourlyRate}

GENERATION INSTRUCTIONS:
${userSettings.proposalTemplates[0]?.content || 'Write a professional proposal that addresses client needs and shows relevant experience.'}

SPECIFIC REQUIREMENTS:
1. Address the client's main pain points from the job description
2. Show relevant experience with similar projects
3. Keep professional but friendly tone
4. Include clear call-to-action for next steps
5. Maximum 250 words
6. Use the freelancer's name: ${user.name}
7. Focus on providing value and solutions

Generate a proposal that will get high response rates and show genuine interest in the project.
`

    try {
      const completion = await openai.chat.completions.create({
        model: userSettings.aiSettings.model,
        messages: [
          { 
            role: "system", 
            content: "You are an expert freelancer who writes winning Upwork proposals that get high response rates. You understand client needs and provide specific, relevant examples." 
          },
          { role: "user", content: prompt }
        ],
        max_tokens: userSettings.aiSettings.maxTokens,
        temperature: userSettings.aiSettings.temperature,
      })

      const proposal = completion.choices[0]?.message?.content

      if (!proposal) {
        throw new Error('AI could not generate proposal')
      }

      // Save to database for AI training and history
      await pool.query(
        `INSERT INTO proposals (user_id, job_id, job_title, job_description, generated_proposal, ai_model, temperature, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'generated', NOW())`,
        [user.id, jobId, jobTitle, jobDescription, proposal, userSettings.aiSettings.model, userSettings.aiSettings.temperature]
      )

      return NextResponse.json({ 
        success: true,
        proposal,
        message: 'Professional proposal generated successfully!',
        details: {
          model: userSettings.aiSettings.model,
          temperature: userSettings.aiSettings.temperature,
          length: proposal.length
        }
      })

    } catch (aiError) {
      console.error('OpenAI error:', aiError)
      // Fallback proposal if OpenAI fails
      const fallbackProposal = `Dear ${clientInfo?.name || 'Client'},

I am writing to express my interest in your "${jobTitle}" project. With my experience in ${skills?.slice(0, 2).join(' and ') || 'this field'}, I am confident I can help you achieve your objectives.

I have successfully completed similar projects where I delivered [relevant achievement]. My approach focuses on [key methodology] to ensure [desired outcome].

I would be happy to discuss how I can contribute to your project's success. Please let me know a convenient time for a quick call.

Best regards,
${user.name}`

      return NextResponse.json({ 
        success: true,
        proposal: fallbackProposal,
        message: 'Proposal generated successfully (fallback mode)',
        details: {
          model: 'fallback',
          temperature: 0,
          length: fallbackProposal.length
        }
      })
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Proposal generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate proposal: ' + error.message 
    }, { status: 500 })
  }
}