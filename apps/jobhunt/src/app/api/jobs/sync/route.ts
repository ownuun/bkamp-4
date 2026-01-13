import { NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';
import { fetchAllUpworkJobs } from '@/lib/scrapers/upwork';

// This endpoint can be called by a cron job (e.g., Vercel Cron)
// or manually to sync jobs from Upwork
export async function POST(request: Request) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // If CRON_SECRET is set, require authorization
      // Skip check if not set (for development)
      if (authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = await createClient();

    // Fetch jobs from Upwork
    console.log('Fetching jobs from Upwork...');
    const upworkJobs = await fetchAllUpworkJobs();
    console.log(`Fetched ${upworkJobs.length} jobs from Upwork`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    // Upsert jobs into database
    for (const job of upworkJobs) {
      const { error } = await supabase
        .from('job_postings')
        .upsert(
          {
            platform: 'upwork',
            external_id: job.externalId,
            title: job.title,
            description: job.description,
            external_url: job.link,
            salary_min: job.budget.min,
            salary_max: job.budget.max,
            salary_type: job.budget.type,
            skills_required: job.skills,
            location: job.country,
            raw_data: job,
            created_at: new Date(job.pubDate).toISOString(),
          },
          {
            onConflict: 'platform,external_id',
            ignoreDuplicates: false,
          }
        );

      if (error) {
        console.error('Error upserting job:', error);
        errors++;
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        fetched: upworkJobs.length,
        inserted,
        updated,
        errors,
      },
    });
  } catch (error) {
    console.error('Job sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync jobs' },
      { status: 500 }
    );
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('job_postings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    const { data: latest } = await supabase
      .from('job_postings')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      totalJobs: count,
      lastSync: latest?.created_at || null,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
