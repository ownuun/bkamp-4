import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@bkamp/supabase/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'new', 'viewed', 'saved', 'applied', 'dismissed'
    const minScore = parseInt(searchParams.get('minScore') || '0');

    const offset = (page - 1) * limit;

    // Get user's job matches with job details
    let query = supabase
      .from('jobhunt_matches')
      .select(`
        *,
        job:job_postings(*)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .gte('fit_score', minScore)
      .order('fit_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: matches, error, count } = await query;

    if (error) {
      console.error('Error fetching matched jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch matched jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      matches: matches || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Matched jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
