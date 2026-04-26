'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Trash2, Eye, EyeOff, RefreshCw, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface BlogItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  is_approved?: boolean;
  is_public?: boolean;
  created_at?: string;
  author_id?: string;
  author_name?: string;
  author_identifier?: string;
  tags?: string[];
  approval_note?: string;
  approved_at?: string;
  published_at?: string;
}

export default function BlogManager() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<BlogItem | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiClient.getAdminBlogs().catch(() => []);
      setBlogs(Array.isArray(data) ? (data as BlogItem[]) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      setError('');
      await apiClient.approveBlog(id);
      // Force reload all blogs to get the updated status from server
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve blog.');
      setLoading(false);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionId(id);
      setError('');
      await apiClient.rejectBlog(id);
      // Force reload all blogs to get the updated status from server
      setLoading(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject blog.');
      setLoading(false);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this blog post?')) return;
    try {
      setActionId(id);
      await apiClient.adminDeleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog.');
    } finally {
      setActionId(null);
    }
  };

  const getStatusLabel = (blog: BlogItem): string => {
    if (blog.is_approved && blog.is_public) return 'Published';
    if (blog.is_approved === false) return 'Rejected';
    return 'Pending';
  };

  const statusBadge = (blog: BlogItem) => {
    const status = getStatusLabel(blog);
    if (status === 'Published') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (status === 'Rejected') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const pending = blogs.filter((b) => !b.is_approved || b.is_approved === undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Blog Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review and approve community blog submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pending.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pending.length} pending
            </span>
          )}
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
          <span className="text-gray-500 dark:text-gray-400">Loading blogs...</span>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No blog submissions yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blog</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {blogs.map((blog) => {
                  const isPending = !blog.is_approved || blog.is_approved === undefined;
                  const isApproved = blog.is_approved === true;
                  return (
                    <motion.tr
                      key={blog.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{blog.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{blog.content}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {blog.author_name || blog.author_identifier || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : '-'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(blog)}`}>
                          {getStatusLabel(blog)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreview(blog)}
                            title="Preview"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(blog.id)}
                                disabled={actionId === blog.id}
                                title="Approve"
                                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(blog.id)}
                                disabled={actionId === blog.id}
                                title="Reject"
                                className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded disabled:opacity-50"
                              >
                                <EyeOff className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isApproved && (
                            <button
                              onClick={() => handleReject(blog.id)}
                              disabled={actionId === blog.id}
                              title="Unpublish"
                              className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded disabled:opacity-50"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(blog.id)}
                            disabled={actionId === blog.id}
                            title="Delete"
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Blog Preview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This is how the blog will appear to readers
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Blog Preview Content */}
            <div className="p-6">
              {/* Cover Image */}
              {preview.image_url && (
                <div className="w-full h-64 md:h-80 mb-6 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.image_url} alt={preview.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {preview.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{preview.author_name || preview.author_identifier || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{preview.created_at ? new Date(preview.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Just now'}</span>
                </div>
                {Array.isArray(preview.tags) && preview.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {preview.tags.map((tag) => (
                      <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content - Rendered as Markdown */}
              <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {preview.content}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(preview)}`}>
                    {getStatusLabel(preview)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white dark:bg-gray-800 pt-4 border-t border-gray-200 dark:border-gray-700">
                {(!preview.is_approved || preview.is_approved === undefined) && (
                  <>
                    <button
                      onClick={() => { handleApprove(preview.id); setPreview(null); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve & Publish
                    </button>
                    <button
                      onClick={() => { handleReject(preview.id); setPreview(null); }}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <EyeOff className="w-5 h-5" /> Reject
                    </button>
                  </>
                )}
                {preview.is_approved === true && (
                  <button
                    onClick={() => { handleReject(preview.id); setPreview(null); }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <EyeOff className="w-5 h-5" /> Unpublish
                  </button>
                )}
                <button
                  onClick={() => { handleDelete(preview.id); setPreview(null); }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> Delete
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
