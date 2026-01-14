import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { generateCoverLetter } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get user's resume with analysis
    const { data: resume, error: resumeError } = await supabase
      .from('jobhunt_resumes')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    if (resumeError || !resume || !resume.parsed_data) {
      return NextResponse.json(
        { error: 'No analyzed resume found' },
        { status: 400 }
      );
    }

    // Get job posting
    const { data: job, error: jobError } = await supabase
      .from('jobhunt_postings')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      resume.parsed_data as any,
      {
        title: job.title,
        company_name: job.company_name,
        description: job.description || '',
      }
    );

    return NextResponse.json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
