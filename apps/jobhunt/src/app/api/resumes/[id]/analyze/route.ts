import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { analyzeResume } from '@/lib/openai';

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

    // Get resume
    const { data: resume, error: resumeError } = await supabase
      .from('jobhunt_resumes')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // Get resume text from request body
    const { resumeText } = await request.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Analyze with OpenAI
    const analysis = await analyzeResume(resumeText);

    // Update resume with analysis
    const { data: updatedResume, error: updateError } = await supabase
      .from('jobhunt_resumes')
      .update({
        parsed_data: analysis,
        skills: analysis.skills,
        experience_years: analysis.experienceYears,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      resume: updatedResume,
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
