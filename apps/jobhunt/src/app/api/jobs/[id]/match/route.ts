import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { calculateFitScore } from '@/lib/openai';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get user preferences
    const { data: preferences } = await supabase
      .from('jobhunt_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get job posting
    const { data: job, error: jobError } = await supabase
      .from('jobhunt_postings')
      .select('*')
      .eq('id', params.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate fit score
    const fitResult = await calculateFitScore(
      resume.parsed_data as any,
      {
        title: job.title,
        description: job.description || '',
        skills_required: job.skills_required || [],
        experience_required: job.experience_required,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
      },
      {
        desired_salary_min: preferences?.desired_salary_min || null,
        desired_salary_max: preferences?.desired_salary_max || null,
      }
    );

    // Save or update job match
    const { data: match, error: matchError } = await supabase
      .from('jobhunt_matches')
      .upsert({
        user_id: user.id,
        job_id: params.id,
        fit_score: fitResult.score,
        fit_reasons: fitResult.reasons,
        fit_explanation: fitResult.explanation,
        status: 'new',
      }, {
        onConflict: 'user_id,job_id',
      })
      .select()
      .single();

    if (matchError) {
      console.error('Match error:', matchError);
      return NextResponse.json(
        { error: 'Failed to save match' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fitResult,
      match,
    });
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
