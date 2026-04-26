'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag,
  Share2,
  Trash2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  excerpt?: string;
  slug: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  author_name?: string;
  author_identifier?: string;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  author_name?: string;
  author_identifier?: string;
  is_mine?: boolean;
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const loadBlog = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getPublicBlogBySlug(slug);
      setBlog(data as BlogPost);
      
      // Load all blogs for navigation
      const blogsData = await apiClient.getPublicBlogs();
      const blogs = Array.isArray(blogsData) ? (blogsData as BlogPost[]) : [];
      setAllBlogs(blogs);
      
      // Find current blog index
      const index = blogs.findIndex(b => b.slug === slug || b.id === (data as BlogPost).id);
      setCurrentBlogIndex(index);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog post.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!blog?.id) return;
    try {
      const data = await apiClient.getBlogComments(blog.id);
      setComments(Array.isArray(data) ? (data as Comment[]) : []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  useEffect(() => {
    if (slug) {
      void loadBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (blog?.id) {
      void loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog?.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to like this post.');
      return;
    }
    if (!blog) return;

    try {
      setLikingPost(true);
      if (blog.is_liked) {
        await apiClient.unlikeBlog(blog.id);
        setBlog((prev) => prev ? {
          ...prev,
          is_liked: false,
          likes_count: Math.max(0, (prev.likes_count || 0) - 1)
        } : null);
      } else {
        await apiClient.likeBlog(blog.id);
        setBlog((prev) => prev ? {
          ...prev,
          is_liked: true,
          likes_count: (prev.likes_count || 0) + 1
        } : null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update like.');
    } finally {
      setLikingPost(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to comment.');
      return;
    }
    if (!blog || !commentText.trim()) return;

    try {
      setSubmittingComment(true);
      await apiClient.createBlogComment(blog.id, commentText.trim());
      setCommentText('');
      await loadComments();
      setBlog((prev) => prev ? {
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      setDeletingCommentId(commentId);
      await apiClient.deleteBlogComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setBlog((prev) => prev ? {
        ...prev,
        comments_count: Math.max(0, (prev.comments_count || 0) - 1)
      } : null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete comment.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt || blog?.title,
          url,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Failed to copy link.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-500 dark:text-gray-400">Loading blog post...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Blog post not found.'}</p>
            <button
              onClick={() => router.push('/blogs')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blogs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Previous Blog */}
          <button
            onClick={() => {
              if (currentBlogIndex > 0 && allBlogs[currentBlogIndex - 1]) {
                const prevBlog = allBlogs[currentBlogIndex - 1];
                router.push(`/blogs/${prevBlog.slug || prevBlog.id}`);
              }
            }}
            disabled={currentBlogIndex <= 0}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-0 flex-1"
            title={currentBlogIndex > 0 && allBlogs[currentBlogIndex - 1] ? allBlogs[currentBlogIndex - 1].title : 'No previous blog'}
          >
            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium truncate hidden sm:inline">
              {currentBlogIndex > 0 && allBlogs[currentBlogIndex - 1] ? 'Previous' : 'No previous'}
            </span>
          </button>

          {/* Return to Blog Home */}
          <button
            onClick={() => router.push('/blogs')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Blog Home</span>
          </button>

          {/* Next Blog */}
          <button
            onClick={() => {
              if (currentBlogIndex >= 0 && currentBlogIndex < allBlogs.length - 1 && allBlogs[currentBlogIndex + 1]) {
                const nextBlog = allBlogs[currentBlogIndex + 1];
                router.push(`/blogs/${nextBlog.slug || nextBlog.id}`);
              }
            }}
            disabled={currentBlogIndex < 0 || currentBlogIndex >= allBlogs.length - 1}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-w-0 flex-1 justify-end"
            title={currentBlogIndex >= 0 && currentBlogIndex < allBlogs.length - 1 && allBlogs[currentBlogIndex + 1] ? allBlogs[currentBlogIndex + 1].title : 'No next blog'}
          >
            <span className="text-sm font-medium truncate hidden sm:inline">
              {currentBlogIndex >= 0 && currentBlogIndex < allBlogs.length - 1 && allBlogs[currentBlogIndex + 1] ? 'Next' : 'No next'}
            </span>
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          </button>
        </div>

        {/* Blog Post */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Cover Image */}
          {blog.image_url ? (
            <div className="w-full h-64 md:h-96 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No cover image</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{blog.author_name || blog.author_identifier || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(blog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blog Content - Markdown Rendered */}
            <div className="prose prose-gray dark:prose-invert max-w-none mb-8">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                  img: ({ node, ...props }) => (
                    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                    <img {...props} className="rounded-lg my-4 w-full" loading="lazy" />
                  ),
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
                  ),
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLike}
                disabled={likingPost}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  blog.is_liked
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <Heart className={`w-5 h-5 ${blog.is_liked ? 'fill-current' : ''}`} />
                <span>{blog.likes_count || 0}</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                <MessageCircle className="w-5 h-5" />
                <span>{blog.comments_count || 0}</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
              <p className="text-amber-700 dark:text-amber-300">
                Please <button onClick={() => router.push('/signin')} className="underline font-medium">sign in</button> to leave a comment.
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.author_name || comment.author_identifier || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.comment}
                      </p>
                    </div>
                    {comment.is_mine && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
