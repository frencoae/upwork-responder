// app/api/jobs/route.ts - SINGLE UPDATED FILE
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth'

const professionalJobs = [
  {
    id: "job_001",
    title: "Architect Needed for Tactile Design on Floor Plan",
    description: "We are looking for an experienced architect to create tactile designs for floor plans...",
    budget: "$15.0-30.0 USD",
    postedDate: "Nov 21, 2025 3:13 PM",
    client: {
      name: "Design Solutions Inc",
      rating: 4.8,
      country: "United States", 
      totalSpent: 25000,
      totalHires: 45
    },
    skills: ["Architectural Design", "Tactile Design", "Floor Plans"],
    proposals: 15,
    verified: true,
    category: "Design & Creative",
    duration: "1-3 months"
  },
  {
    id: "job_002",
    title: "Full Stack Developer Needed for E-commerce Platform",
    description: "Looking for experienced full stack developer to build e-commerce platform...",
    budget: "$35.0-70.0 USD", 
    postedDate: "Nov 21, 2025 2:45 PM",
    client: {
      name: "Tech Solutions LLC",
      rating: 4.9,
      country: "United States",
      totalSpent: 18000,
      totalHires: 32
    },
    skills: ["React", "Node.js", "MongoDB", "E-commerce"],
    proposals: 23,
    verified: true,
    category: "Web Development", 
    duration: "2-4 months"
  }
]

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    let filteredJobs = professionalJobs

    // Apply filters
    if (category && category !== 'all') {
      filteredJobs = filteredJobs.filter(job => 
        job.category?.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (search) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()))
      )
    }

    console.log(`🎯 Loaded ${filteredJobs.length} professional jobs`)
    
    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
      message: `Loaded ${filteredJobs.length} professional jobs`
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json({
      success: false,
      jobs: [],
      error: 'Failed to load jobs'
    }, { status: 500 })
  }
}