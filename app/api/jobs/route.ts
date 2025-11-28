// app/api/jobs/route.ts - SINGLE UPDATED FILE
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth'

const professionalJobs = [
  {
    id: "job_001",
    title: "Architect Needed for Tactile Design on Floor Plan",
    description: "We are looking for an experienced architect to create tactile designs for floor plans. The project involves creating accessible designs for visually impaired individuals. The ideal candidate should have experience in architectural design and accessibility standards.",
    budget: "$15.0-30.0 USD",
    postedDate: "Nov 21, 2025 3:13 PM",
    client: {
      name: "Design Solutions Inc",
      rating: 4.8,
      country: "United States", 
      totalSpent: 25000,
      totalHires: 45
    },
    skills: ["Architectural Design", "Tactile Design", "Floor Plans", "Accessibility"],
    proposals: 15,
    verified: true,
    category: "Design & Creative",
    duration: "1-3 months"
  },
  {
    id: "job_002",
    title: "Full Stack Developer Needed for E-commerce Platform",
    description: "Looking for experienced full stack developer to build e-commerce platform with React, Node.js and MongoDB. The project includes user authentication, payment integration, and admin dashboard. Experience with Stripe API and cloud deployment is a plus.",
    budget: "$35.0-70.0 USD", 
    postedDate: "Nov 21, 2025 2:45 PM",
    client: {
      name: "Tech Solutions LLC",
      rating: 4.9,
      country: "United States",
      totalSpent: 18000,
      totalHires: 32
    },
    skills: ["React", "Node.js", "MongoDB", "E-commerce", "Stripe API"],
    proposals: 23,
    verified: true,
    category: "Web Development", 
    duration: "2-4 months"
  },
  {
    id: "job_003",
    title: "Mobile App Developer for Fitness Tracking Application",
    description: "Seeking skilled mobile app developer to create a fitness tracking application for iOS and Android. Features include workout plans, progress tracking, and social sharing. Experience with React Native and health APIs required.",
    budget: "$20.0-50.0 USD",
    postedDate: "Nov 21, 2025 1:20 PM",
    client: {
      name: "FitTech Innovations",
      rating: 4.7,
      country: "Canada",
      totalSpent: 12000,
      totalHires: 18
    },
    skills: ["React Native", "iOS", "Android", "Fitness API", "Mobile Development"],
    proposals: 18,
    verified: true,
    category: "Mobile Development",
    duration: "3-6 months"
  },
  {
    id: "job_004",
    title: "UI/UX Designer for SaaS Dashboard Redesign",
    description: "We need a creative UI/UX designer to redesign our SaaS product dashboard. The project focuses on improving user experience, creating modern interfaces, and enhancing usability. Portfolio of previous dashboard designs required.",
    budget: "$25.0-60.0 USD",
    postedDate: "Nov 21, 2025 11:30 AM",
    client: {
      name: "CloudSoft Systems",
      rating: 4.9,
      country: "United Kingdom",
      totalSpent: 32000,
      totalHires: 52
    },
    skills: ["UI/UX Design", "Figma", "Dashboard Design", "User Research", "Prototyping"],
    proposals: 27,
    verified: true,
    category: "Design & Creative",
    duration: "1-2 months"
  },
  {
    id: "job_005",
    title: "DevOps Engineer for Cloud Infrastructure Setup",
    description: "Looking for DevOps engineer to set up and optimize cloud infrastructure on AWS. Responsibilities include CI/CD pipeline setup, containerization with Docker, and monitoring implementation. Terraform experience preferred.",
    budget: "$40.0-80.0 USD",
    postedDate: "Nov 21, 2025 10:15 AM",
    client: {
      name: "DataFlow Technologies",
      rating: 4.8,
      country: "Germany",
      totalSpent: 28000,
      totalHires: 38
    },
    skills: ["AWS", "Docker", "CI/CD", "Terraform", "Kubernetes"],
    proposals: 14,
    verified: true,
    category: "DevOps & Infrastructure",
    duration: "2-3 months"
  },
  {
    id: "job_006",
    title: "Content Writer for Technical Blog and Documentation",
    description: "Need experienced technical content writer to create blog posts and documentation for our developer tools. Topics include API documentation, tutorials, and best practices. Strong understanding of programming concepts required.",
    budget: "$15.0-35.0 USD",
    postedDate: "Nov 21, 2025 9:45 AM",
    client: {
      name: "CodeCraft Labs",
      rating: 4.6,
      country: "Australia",
      totalSpent: 15000,
      totalHires: 24
    },
    skills: ["Technical Writing", "Documentation", "Blog Writing", "API Documentation", "Programming"],
    proposals: 32,
    verified: true,
    category: "Writing & Content",
    duration: "Ongoing"
  },
  {
    id: "job_007",
    title: "Data Scientist for Machine Learning Model Development",
    description: "Seeking data scientist to develop and deploy machine learning models for predictive analytics. Project involves data cleaning, model training, and performance optimization. Experience with Python, TensorFlow, and SQL required.",
    budget: "$50.0-100.0 USD",
    postedDate: "Nov 20, 2025 4:30 PM",
    client: {
      name: "Analytics Pro",
      rating: 4.9,
      country: "United States",
      totalSpent: 45000,
      totalHires: 67
    },
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL", "Data Analysis"],
    proposals: 19,
    verified: true,
    category: "Data Science & Analytics",
    duration: "4-6 months"
  },
  {
    id: "job_008",
    title: "WordPress Developer for Corporate Website Redesign",
    description: "Looking for WordPress developer to redesign corporate website with custom theme development and plugin integration. Experience with WooCommerce and page builders required. Must have portfolio of previous WordPress projects.",
    budget: "$20.0-45.0 USD",
    postedDate: "Nov 20, 2025 3:15 PM",
    client: {
      name: "Business Solutions Inc",
      rating: 4.7,
      country: "United States",
      totalSpent: 22000,
      totalHires: 31
    },
    skills: ["WordPress", "PHP", "WooCommerce", "CSS", "JavaScript"],
    proposals: 41,
    verified: true,
    category: "Web Development",
    duration: "1-2 months"
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

    console.log(`🎯 Loaded ${filteredJobs.length} professional jobs for user: ${user.email}`)
    
    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
      message: `Loaded ${filteredJobs.length} professional jobs matching your profile`
    })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Jobs API error:', error)
    return NextResponse.json({
      success: false,
      jobs: [],
      error: 'Failed to load jobs: ' + error.message
    }, { status: 500 })
  }
}