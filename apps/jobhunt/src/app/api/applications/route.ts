import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { generateCoverLetter, type ResumeAnalysis } from '@/lib/openai';

// Create a new application (Quick Apply)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, coverLetter, generateCover } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Get user's primary resume
    const { data: resume, error: resumeError } = await supabase
      .from('jobhunt_resumes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Please upload a resume first' },
        { status: 400 }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobhunt_postings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Get existing match
    const { data: match } = await supabase
      .from('jobhunt_matches')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single();

    // Generate cover letter if requested
    let finalCoverLetter = coverLetter || '';
    if (generateCover && resume.parsed_data) {
      finalCoverLetter = await generateCoverLetter(
        resume.parsed_data as ResumeAnalysis,
        {
          title: job.title,
          company_name: job.company_name,
          description: job.description || '',
        }
      );
    }

    // Check for existing application
    const { data: existingApp } = await supabase
      .from('jobhunt_applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: appError } = await supabase
      .from('jobhunt_applications')
      .insert({
        user_id: user.id,
        job_id: jobId,
        match_id: match?.id || null,
        resume_id: resume.id,
        cover_letter: finalCoverLetter,
        status: 'submitted',
        applied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (appError) {
      console.error('Application error:', appError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Update job match status to 'applied'
    if (match) {
      await supabase
        .from('jobhunt_matches')
        .update({ status: 'applied' })
        .eq('id', match.id);
    }

    return NextResponse.json({
      success: true,
      application,
      externalUrl: job.external_url, // URL for user to complete application on Upwork
      coverLetter: finalCoverLetter,
    });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's applications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobhunt_applications')
      .select(`
        *,
        job:job_postings(*),
        resume:resumes(file_name)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Applications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
