'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { createClient } from '@bkamp/supabase/client';
import type { Story, Comment } from '@/lib/types';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: storyData } = await supabase
        .from('stories')
        .select('*')
        .eq('id', params.id)
        .single();

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('story_id', params.id)
        .order('created_at', { ascending: true });

      setStory(storyData);
      setComments(commentsData || []);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('comments').insert({
      story_id: params.id,
      nickname: commentNickname.trim() || '익명의 응원',
      content: newComment.trim(),
    }).select().single();

    if (!error && data) {
      setComments([...comments, data]);
      setNewComment('');
      setCommentNickname('');
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-dark/70">사연을 찾을 수 없습니다.</p>
        <div className="mt-4">
          <Button onClick={() => router.push('/stories')}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => router.push('/stories')}>목록으로</Button>

      <Card>
        <div className="p-6">
          <h1 className="text-2xl text-primary-dark mb-2">{story.title}</h1>
          <p className="text-sm text-primary-dark/60 mb-6">
            {story.nickname} · {new Date(story.created_at).toLocaleDateString('ko-KR')}
          </p>
          <div className="text-primary-dark/80 whitespace-pre-wrap leading-relaxed">
            {story.content}
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl text-primary-dark">응원 메시지 ({comments.length})</h2>

        {comments.map((comment) => (
          <Card key={comment.id}>
            <div className="p-4">
              <p className="text-primary-dark/80 mb-2">{comment.content}</p>
              <p className="text-sm text-primary-dark/50">
                {comment.nickname} · {new Date(comment.created_at).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </Card>
        ))}

        <Card>
          <div className="p-4">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Input
                value={commentNickname}
                onChange={(v) => setCommentNickname(v)}
              />
              <Textarea
                value={newComment}
                onChange={(v) => setNewComment(v)}
                placeholder="따뜻한 응원 메시지를 남겨주세요..."
              />
              <Button onClick={() => {}}>
                {submitting ? '등록 중...' : '응원 남기기'}
              </Button>
            </form>
          </div>
        </Card>
      </section>
    </div>
  );
}
