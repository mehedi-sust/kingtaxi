'use client';

import { useEffect, useRef, useState } from 'react';
import { PenSquare, BookOpen, Image as ImageIcon, Globe, User, Trash2, Pencil, X, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type BlogItem = {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
  is_approved?: boolean;
  is_public?: boolean;
  slug?: string;
  tags?: string[];
};

type ActiveTab = 'all' | 'write' | 'mine';

export default function BlogsPage() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [guide, setGuide] = useState<any>(null);
  const [publicBlogs, setPublicBlogs] = useState<BlogItem[]>([]);
  const [myBlogs, setMyBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    content: '',
    tags: '',
  });
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [guideData, publicData] = await Promise.all([
        apiClient.getBlogWritingGuide().catch(() => null),
        apiClient.getPublicBlogs().catch(() => []),
      ]);
      setGuide(guideData);
      setPublicBlogs(Array.isArray(publicData) ? (publicData as BlogItem[]) : []);
      if (isAuthenticated) {
        const mine = await apiClient.getMyBlogs().catch(() => []);
        setMyBlogs(Array.isArray(mine) ? (mine as BlogItem[]) : []);
      } else {
        setMyBlogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const insertAtCursor = (snippet: string) => {
    const node = contentRef.current;
    if (!node) {
      setForm((prev) => ({ ...prev, content: `${prev.content}\n${snippet}`.trim() }));
      return;
    }
    const start = node.selectionStart ?? node.value.length;
    const end = node.selectionEnd ?? node.value.length;
    const before = form.content.slice(0, start);
    const after = form.content.slice(end);
    const next = `${before}${snippet}${after}`;
    setForm((prev) => ({ ...prev, content: next }));
    window.requestAnimationFrame(() => {
      const cursor = start + snippet.length;
      node.focus();
      node.setSelectionRange(cursor, cursor);
    });
  };

  const resetForm = () => {
    setForm({ title: '', imageUrl: '', content: '', tags: '' });
    setEditingBlog(null);
    setError('');
    setSuccess('');
  };

  const startEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      imageUrl: blog.image_url || '',
      content: blog.content,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
    });
    setError('');
    setSuccess('');
    setActiveTab('write');
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      setDeletingId(blogId);
      await apiClient.deleteBlog(blogId);
      setMyBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog.');
    } finally {
      setDeletingId(null);
    }
  };

  const submitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!isAuthenticated) {
      setError('Please sign in to write and publish your blog.');
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    if (form.imageUrl.trim()) {
      try {
        const parsed = new URL(form.imageUrl.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setError('Image URL must start with http:// or https://');
          return;
        }
      } catch {
        setError('Please enter a valid image URL.');
        return;
      }
    }

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      image_url: form.imageUrl.trim() || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      setSubmitting(true);
      if (editingBlog) {
        await apiClient.updateBlog(editingBlog.id, payload);
        setSuccess('Blog updated successfully.');
      } else {
        await apiClient.createBlog(payload);
        setSuccess('Blog submitted! It will appear publicly after admin approval.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit blog.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = (blog: BlogItem): string => {
    if (blog.is_approved && blog.is_public) return 'Published';
    if (blog.is_approved === false) return 'Rejected';
    return 'Pending';
  };

  const statusColor = (blog: BlogItem) => {
    const status = getStatusLabel(blog);
    if (status === 'Published') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Blogs', icon: <Globe className="w-4 h-4" /> },
    { id: 'write', label: editingBlog ? 'Edit Blog' : 'Write a Blog', icon: <PenSquare className="w-4 h-4" /> },
    ...(isAuthenticated ? [{ id: 'mine' as ActiveTab, label: 'My Blogs', icon: <User className="w-4 h-4" /> }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Blogs</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Read customer stories and share your own experience with King Taxi.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id !== 'write') resetForm(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Blogs Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
                <span className="text-gray-500 dark:text-gray-400">Loading blogs...</span>
              </div>
            ) : publicBlogs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No public blogs yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Be the first to share your experience!</p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Write a Blog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicBlogs.map((blog) => (
                  <article
                    key={blog.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
                    onClick={() => window.location.href = `/blogs/${blog.slug || blog.id}`}
                  >
                    {blog.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={blog.image_url} alt={blog.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{blog.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-1">
                        {blog.content}
                      </p>
                      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {blog.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {blog.created_at && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Write / Edit Blog Tab */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            {/* Writing Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Writing Tips</h2>
              </div>
              {guide ? (
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {Array.isArray(guide?.tips) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {guide.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                    </ul>
                  ) : (
                    <p>{String(guide?.content || guide?.description || guide?.title || '')}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Keep it simple: add a clear title, describe your experience, and include practical details for readers.
                </p>
              )}
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PenSquare className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingBlog ? 'Edit Blog Post' : 'Write A Blog'}
                  </h2>
                </div>
                {editingBlog && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <p className="mb-4 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  Sign in to submit blogs. Public posts are visible to everyone after admin moderation.
                </p>
              )}
              {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</div>}
              {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-300">{success}</div>}

              <form onSubmit={submitBlog} className="space-y-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Blog title *"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Image URL (optional)"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-9 pr-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="Tags, comma separated (optional)"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Heading', snippet: '## Heading\n' },
                    { label: 'Bold', snippet: '**bold text**' },
                    { label: 'Bullet', snippet: '\n- bullet point' },
                    { label: 'Link', snippet: '[link text](https://example.com)' },
                  ].map(({ label, snippet }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => insertAtCursor(snippet)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog content here... *"
                  rows={12}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !isAuthenticated}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? 'Saving...' : editingBlog ? 'Update Blog' : 'Submit Blog'}
                  </button>
                  {editingBlog && (
                    <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Blogs Tab */}
        {activeTab === 'mine' && isAuthenticated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Blog Submissions</h2>
              <button
                onClick={() => setActiveTab('write')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                New Blog
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
                <span className="text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            ) : myBlogs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <PenSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No blog submissions yet.</p>
                <button
                  onClick={() => setActiveTab('write')}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium"
                >
                  Write Your First Blog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3"
                  >
                    {blog.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={blog.image_url} alt={blog.title} className="w-full h-36 object-cover rounded-lg" />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">{blog.title}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor(blog)}`}>
                        {getStatusLabel(blog)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{blog.content}</p>
                    {blog.created_at && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => startEdit(blog)}
                        className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === blog.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
