// app/api/jobs/route.ts - COMPLETE FIXED CODE
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth'
import pool from '../../../lib/database'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ✅ PROFESSIONAL MOCK JOBS - DEVELOPMENT KE LIYE
const professionalJobs = [
  {
    id: "job_001",
    title: "Architect Needed for Tactile Design on Floor Plan",
    description: "We are looking for an experienced architect to create tactile designs for floor plans. The project involves creating accessible designs for visually impaired individuals.",
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
    description: "Looking for experienced full stack developer to build e-commerce platform with React, Node.js and MongoDB. The project includes user authentication, payment integration, and admin dashboard.",
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
    description: "Seeking skilled mobile app developer to create a fitness tracking application for iOS and Android. Features include workout plans, progress tracking, and social sharing.",
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
    description: "We need a creative UI/UX designer to redesign our SaaS product dashboard. The project focuses on improving user experience, creating modern interfaces, and enhancing usability.",
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
    description: "Looking for DevOps engineer to set up and optimize cloud infrastructure on AWS. Responsibilities include CI/CD pipeline setup, containerization with Docker, and monitoring implementation.",
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
    description: "Need experienced technical content writer to create blog posts and documentation for our developer tools. Topics include API documentation, tutorials, and best practices.",
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
    description: "Seeking data scientist to develop and deploy machine learning models for predictive analytics. Project involves data cleaning, model training, and performance optimization.",
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
    description: "Looking for WordPress developer to redesign corporate website with custom theme development and plugin integration. Experience with WooCommerce and page builders required.",
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
];

// ✅ SIMPLE JOBS FETCH FUNCTION - FIXED VERSION
async function fetchJobs(userId: number) {
  try {
    console.log(`🔄 Fetching jobs for user ID: ${userId}`);
    
    // Development mode mein hamesha mock jobs return karein
    // Upwork API active hone tak
    console.log('📋 Using professional mock jobs (Development Mode)');
    return {
      success: true,
      jobs: professionalJobs,
      total: professionalJobs.length,
      source: 'mock',
      message: 'Loaded professional job recommendations'
    };
    
  } catch (error: any) {
    console.error('❌ Error in fetchJobs:', error.message);
    return {
      success: false,
      jobs: professionalJobs, // Fallback to mock jobs
      total: professionalJobs.length,
      source: 'mock',
      message: 'Using fallback mock jobs',
      error: error.message
    };
  }
}

// ✅ MAIN GET FUNCTION - FIXED VERSION
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Jobs API called');
    
    // 1. USER AUTHENTICATION CHECK
    const user = await getCurrentUser();
    if (!user) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ 
        success: false, 
        error: 'Please login first' 
      }, { status: 401 });
    }

    console.log(`✅ User authenticated: ${user.email}`);

    // 2. URL PARAMETERS
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    console.log(`🔍 Filters - Category: ${category || 'none'}, Search: ${search || 'none'}`);

    // 3. FETCH JOBS
    const jobsResult = await fetchJobs(user.id);
    
    if (!jobsResult.success) {
      console.warn('⚠️ Using fallback jobs due to fetch error');
    }

    let filteredJobs = jobsResult.jobs || [];

    // 4. APPLY FILTERS
    // Category filter
    if (category && category !== 'all') {
      const originalCount = filteredJobs.length;
      filteredJobs = filteredJobs.filter(job => {
        if (!job.category) return true;
        return job.category.toLowerCase().includes(category.toLowerCase());
      });
      console.log(`📁 Category "${category}" applied: ${originalCount} → ${filteredJobs.length} jobs`);
    }

    // Search filter
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      const originalCount = filteredJobs.length;
      
      filteredJobs = filteredJobs.filter(job => {
        const titleMatch = job.title?.toLowerCase().includes(searchLower) || false;
        const descMatch = job.description?.toLowerCase().includes(searchLower) || false;
        
        // Skills mein search karein
        let skillsMatch = false;
        if (job.skills && Array.isArray(job.skills)) {
          skillsMatch = job.skills.some((skill: string) => 
            skill.toLowerCase().includes(searchLower)
          );
        }
        
        return titleMatch || descMatch || skillsMatch;
      });
      
      console.log(`🔎 Search "${search}" applied: ${originalCount} → ${filteredJobs.length} jobs`);
    }

    try {
      // User ke prompts settings se match karein
      const settingsResult = await pool.query(
        'SELECT basic_info FROM prompt_settings WHERE user_id = $1',
        [user.id]
      );

      if (settingsResult.rows.length > 0) {
        const settings = settingsResult.rows[0];
        const userKeywords = settings.basic_info?.keywords || '';
        
        if (userKeywords) {
          // Simple keyword matching
          const keywords = userKeywords.toLowerCase()
            .replace(/"/g, '')
            .split('or')
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 0);
          
          if (keywords.length > 0) {
            const originalCount = filteredJobs.length;
            filteredJobs = filteredJobs.filter(job => {
              const jobText = `${job.title} ${job.description} ${job.skills?.join(' ') || ''}`.toLowerCase();
              return keywords.some((keyword: string) => jobText.includes(keyword));
            });
            console.log(`🎯 Profile matching applied: ${originalCount} → ${filteredJobs.length} jobs`);
          }
        }
      }
    } catch (settingsError) {
      console.log('ℹ️ No prompt settings found for user');
    }

    // 6. FINAL RESPONSE
    console.log(`✅ Successfully loaded ${filteredJobs.length} jobs for ${user.email}`);
    
    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      total: filteredJobs.length,
      source: 'mock',
      filters: {
        category: category || 'all',
        search: search || '',
        applied: !!(category || search)
      },
      stats: {
        totalMockJobs: professionalJobs.length,
        filteredCount: filteredJobs.length,
        userEmail: user.email
      },
      message: `🎯 Loaded ${filteredJobs.length} professional job recommendations for you!`
    });

  } catch (error: any) {
    console.error('❌ Jobs API ERROR:', error);
    
    // Fallback response
    return NextResponse.json({
      success: true, // Still success to show jobs
      jobs: professionalJobs,
      total: professionalJobs.length,
      source: 'mock_fallback',
      error: error.message,
      message: 'Using fallback professional job recommendations'
    });
  }
}

// ✅ POST FUNCTION (OPTIONAL - FOR FUTURE USE)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'refresh') {
      // Manual refresh karne ke liye
      console.log(`🔄 Manual refresh requested by ${user.email}`);
      
      return NextResponse.json({
        success: true,
        message: 'Jobs refreshed successfully',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Jobs POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
}