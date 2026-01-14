'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@bkamp/supabase/client';
import type { Story, Comment } from '@/lib/types';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commentFormRef = useRef<HTMLFormElement>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentNickname, setCommentNickname] = useState('');
  const [commentPassword, setCommentPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 댓글 수정/삭제 관련 상태
  const [commentModal, setCommentModal] = useState<{ type: 'edit' | 'delete'; comment: Comment } | null>(null);
  const [commentPasswordInput, setCommentPasswordInput] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // 수정/삭제 관련 상태
  const [showPasswordModal, setShowPasswordModal] = useState<'edit' | 'delete' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: storyData } = await supabase
        .from('bluetree_stories')
        .select('*')
        .eq('id', params.id)
        .single();

      const { data: commentsData } = await supabase
        .from('bluetree_comments')
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
    if (!/^\d{4}$/.test(commentPassword)) {
      alert('비밀번호는 4자리 숫자로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bluetree_comments')
      .insert({
        story_id: params.id,
        nickname: commentNickname.trim() || '익명의 응원',
        content: newComment.trim(),
        password: commentPassword,
      })
      .select()
      .single();

    if (!error && data) {
      setComments([...comments, data]);
      setNewComment('');
      setCommentNickname('');
      setCommentPassword('');
    }
    setSubmitting(false);
  }

  async function handleCommentPasswordSubmit() {
    if (!commentModal) return;
    const supabase = createClient();

    if (commentModal.type === 'edit') {
      // 비밀번호 확인 후 수정 모드 진입
      const { data } = await supabase
        .from('bluetree_comments')
        .select('id')
        .eq('id', commentModal.comment.id)
        .eq('password', commentPasswordInput)
        .single();

      if (data) {
        setEditingComment(commentModal.comment);
        setEditCommentContent(commentModal.comment.content);
        setCommentModal(null);
        setCommentPasswordInput('');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } else if (commentModal.type === 'delete') {
      // 비밀번호 확인 후 삭제
      const { error } = await supabase
        .from('bluetree_comments')
        .delete()
        .eq('id', commentModal.comment.id)
        .eq('password', commentPasswordInput);

      if (!error) {
        setComments(comments.filter((c) => c.id !== commentModal.comment.id));
        setCommentModal(null);
        setCommentPasswordInput('');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }
  }

  async function handleCommentEditSave() {
    if (!editingComment || !editCommentContent.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('bluetree_comments')
      .update({ content: editCommentContent.trim() })
      .eq('id', editingComment.id);

    if (!error) {
      setComments(
        comments.map((c) =>
          c.id === editingComment.id ? { ...c, content: editCommentContent.trim() } : c
        )
      );
      setEditingComment(null);
      setEditCommentContent('');
    } else {
      alert('수정에 실패했습니다.');
    }
  }

  async function handlePasswordSubmit() {
    if (!story) return;
    const supabase = createClient();

    if (showPasswordModal === 'edit') {
      // 비밀번호 확인 후 수정 모드 진입
      const { data } = await supabase
        .from('bluetree_stories')
        .select('id')
        .eq('id', story.id)
        .eq('password', passwordInput)
        .single();

      if (data) {
        setIsEditing(true);
        setEditTitle(story.title);
        setEditContent(story.content);
        setShowPasswordModal(null);
        setPasswordInput('');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } else if (showPasswordModal === 'delete') {
      // 비밀번호 확인 후 삭제
      const { error } = await supabase
        .from('bluetree_stories')
        .delete()
        .eq('id', story.id)
        .eq('password', passwordInput);

      if (!error) {
        router.push('/stories');
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    }
  }

  async function handleEditSave() {
    if (!story || !editTitle.trim() || !editContent.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('bluetree_stories')
      .update({
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      .eq('id', story.id);

    if (!error) {
      setStory({ ...story, title: editTitle.trim(), content: editContent.trim() });
      setIsEditing(false);
    } else {
      alert('수정에 실패했습니다.');
    }
  }

  if (loading) {
    return <div className="text-center py-12">불러오는 중...</div>;
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-dark/70">사연을 찾을 수 없습니다.</p>
        <div className="mt-4">
          <button className="sketch-btn" onClick={() => router.push('/stories')}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button className="sketch-btn" onClick={() => router.push('/stories')}>
        목록으로
      </button>

      <div className="sketch-card">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="sketch-input text-xl"
              placeholder="제목"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="sketch-input resize-none"
              rows={8}
              placeholder="내용"
            />
            <div className="flex gap-2">
              <button className="sketch-btn" onClick={handleEditSave}>
                저장
              </button>
              <button
                className="sketch-btn"
                onClick={() => setIsEditing(false)}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl text-primary-dark mb-2">{story.title}</h1>
            <p className="text-sm text-primary-dark/60 mb-6">
              {story.nickname} · {new Date(story.created_at).toLocaleDateString('ko-KR')}
            </p>
            <div className="text-primary-dark/80 whitespace-pre-wrap leading-relaxed mb-6">
              {story.content}
            </div>
            <div className="flex gap-2 pt-4 border-t border-primary-dark/20">
              <button
                className="sketch-btn text-sm"
                onClick={() => setShowPasswordModal('edit')}
              >
                수정
              </button>
              <button
                className="sketch-btn text-sm"
                onClick={() => setShowPasswordModal('delete')}
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="sketch-card max-w-sm w-full mx-4">
            <h3 className="text-lg text-primary-dark mb-4">
              {showPasswordModal === 'edit' ? '수정하려면' : '삭제하려면'} 비밀번호를 입력하세요
            </h3>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value.replace(/\D/g, ''))}
              placeholder="4자리 숫자"
              className="sketch-input mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button className="sketch-btn" onClick={handlePasswordSubmit}>
                확인
              </button>
              <button
                className="sketch-btn"
                onClick={() => {
                  setShowPasswordModal(null);
                  setPasswordInput('');
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl text-primary-dark">응원 메시지 ({comments.length})</h2>

        {comments.map((comment) => (
          <div key={comment.id} className="sketch-card !p-4">
            {editingComment?.id === comment.id ? (
              <div className="space-y-3">
                <textarea
                  value={editCommentContent}
                  onChange={(e) => setEditCommentContent(e.target.value)}
                  className="sketch-input resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button className="sketch-btn text-sm" onClick={handleCommentEditSave}>
                    저장
                  </button>
                  <button
                    className="sketch-btn text-sm"
                    onClick={() => {
                      setEditingComment(null);
                      setEditCommentContent('');
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-primary-dark/80 mb-2">{comment.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary-dark/50">
                    {comment.nickname} · {new Date(comment.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-primary-dark/50 hover:text-primary-dark"
                      onClick={() => setCommentModal({ type: 'edit', comment })}
                    >
                      수정
                    </button>
                    <button
                      className="text-xs text-primary-dark/50 hover:text-primary-dark"
                      onClick={() => setCommentModal({ type: 'delete', comment })}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="sketch-card !p-4">
          <form ref={commentFormRef} onSubmit={handleCommentSubmit} className="space-y-3">
            <input
              type="text"
              value={commentNickname}
              onChange={(e) => setCommentNickname(e.target.value)}
              placeholder="닉네임 (선택사항)"
              className="sketch-input"
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻한 응원 메시지를 남겨주세요..."
              rows={3}
              className="sketch-input resize-none"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={commentPassword}
              onChange={(e) => setCommentPassword(e.target.value.replace(/\D/g, ''))}
              placeholder="비밀번호 4자리 (수정/삭제 시 필요)"
              className="sketch-input"
            />
            <button
              type="button"
              className="sketch-btn"
              onClick={() => commentFormRef.current?.requestSubmit()}
            >
              {submitting ? '등록 중...' : '응원 남기기'}
            </button>
          </form>
        </div>
      </section>

      {/* 댓글 비밀번호 확인 모달 */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="sketch-card max-w-sm w-full mx-4">
            <h3 className="text-lg text-primary-dark mb-4">
              {commentModal.type === 'edit' ? '수정하려면' : '삭제하려면'} 비밀번호를 입력하세요
            </h3>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={commentPasswordInput}
              onChange={(e) => setCommentPasswordInput(e.target.value.replace(/\D/g, ''))}
              placeholder="4자리 숫자"
              className="sketch-input mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button className="sketch-btn" onClick={handleCommentPasswordSubmit}>
                확인
              </button>
              <button
                className="sketch-btn"
                onClick={() => {
                  setCommentModal(null);
                  setCommentPasswordInput('');
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
