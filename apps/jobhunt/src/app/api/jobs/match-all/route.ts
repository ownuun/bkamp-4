import { NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { calculateFitScore, type ResumeAnalysis } from '@/lib/openai';
import { sendJobAlertEmail } from '@/lib/email';

// This endpoint is called by cron to match new jobs with all users
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await createClient();

    // Get all users with resumes and preferences
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        resumes!inner(parsed_data, skills, experience_years),
        job_preferences(*)
      `)
      .not('resumes.parsed_data', 'is', null);

    if (usersError || !users) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get recent jobs that haven't been matched yet (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: jobs, error: jobsError } = await supabase
      .from('job_postings')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError || !jobs) {
      console.error('Error fetching jobs:', jobsError);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    console.log(`Processing ${users.length} users and ${jobs.length} jobs`);

    let matchesCreated = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    // Process each user
    for (const user of users) {
      const resume = user.resumes?.[0];
      const preferences = user.job_preferences?.[0];

      if (!resume?.parsed_data) continue;

      const resumeAnalysis = resume.parsed_data as ResumeAnalysis;
      const minFitScore = preferences?.min_fit_score || 70;
      const highFitJobs: Array<{ job: any; fitScore: any }> = [];

      // Calculate fit score for each job
      for (const job of jobs) {
        try {
          // Check if match already exists
          const { data: existingMatch } = await supabase
            .from('job_matches')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', job.id)
            .single();

          if (existingMatch) continue;

          // Calculate fit score
          const fitScore = await calculateFitScore(
            resumeAnalysis,
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

          // Save match
          const { error: matchError } = await supabase
            .from('job_matches')
            .insert({
              user_id: user.id,
              job_id: job.id,
              fit_score: fitScore.score,
              fit_reasons: fitScore.reasons,
              fit_explanation: fitScore.explanation,
              status: 'new',
            });

          if (matchError) {
            errors.push(`Match error for user ${user.id}: ${matchError.message}`);
          } else {
            matchesCreated++;

            // Collect high-fit jobs for email
            if (fitScore.score >= minFitScore) {
              highFitJobs.push({ job, fitScore });
            }
          }
        } catch (error) {
          errors.push(`Fit score error: ${error}`);
        }
      }

      // Send email alert for high-fit jobs
      if (highFitJobs.length > 0 && user.email) {
        try {
          await sendJobAlertEmail({
            to: user.email,
            userName: user.full_name || 'there',
            jobs: highFitJobs.map(({ job, fitScore }) => ({
              title: job.title,
              company: job.company_name || 'Unknown',
              fitScore: fitScore.score,
              explanation: fitScore.explanation,
              url: job.external_url,
            })),
          });
          emailsSent++;

          // Mark as notified
          for (const { job } of highFitJobs) {
            await supabase
              .from('job_matches')
              .update({ notified_at: new Date().toISOString() })
              .eq('user_id', user.id)
              .eq('job_id', job.id);
          }
        } catch (error) {
          errors.push(`Email error for ${user.email}: ${error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        usersProcessed: users.length,
        jobsProcessed: jobs.length,
        matchesCreated,
        emailsSent,
        errors: errors.length,
      },
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error) {
    console.error('Match-all error:', error);
    return NextResponse.json(
      { error: 'Failed to process matches' },
      { status: 500 }
    );
  }
}
