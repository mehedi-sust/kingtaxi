# Additional Backend APIs Required for Blog Feature

This document outlines the additional backend API endpoints needed to support the full blog viewing experience with comments, likes, and enhanced features.

## 🔴 Critical APIs (Must Have)

### 1. Get Blog by Slug
**Endpoint:** `GET /blogs/public/{slug}`

**Purpose:** Retrieve a single blog post by its URL-friendly slug for the detail page.

**Response:**
```json
{
  "id": "uuid",
  "title": "Blog Title",
  "content": "Full markdown content...",
  "image_url": "https://example.com/image.jpg",
  "excerpt": "Short description",
  "slug": "blog-title-slug",
  "tags": ["tag1", "tag2"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-02T00:00:00Z",
  "author_name": "John Doe",
  "author_identifier": "user@example.com",
  "likes_count": 42,
  "comments_count": 15,
  "is_liked": false
}
```

**Notes:**
- `is_liked` should be `true` if the authenticated user has liked this post, `false` otherwise
- If user is not authenticated, `is_liked` should be `false`
- Slug should be auto-generated from title (e.g., "My Blog Post" → "my-blog-post")

---

### 2. Like a Blog Post
**Endpoint:** `POST /blogs/{blog_id}/likes`

**Purpose:** Allow authenticated users to like a blog post.

**Authentication:** Required

**Response:**
```json
{
  "message": "Blog liked successfully",
  "likes_count": 43
}
```

**Notes:**
- Should be idempotent (liking twice doesn't create duplicate likes)
- Should increment the blog's `likes_count`
- Should track which user liked which blog

---

### 3. Unlike a Blog Post
**Endpoint:** `DELETE /blogs/{blog_id}/likes`

**Purpose:** Allow authenticated users to remove their like from a blog post.

**Authentication:** Required

**Response:**
```json
{
  "message": "Blog unliked successfully",
  "likes_count": 42
}
```

**Notes:**
- Should decrement the blog's `likes_count`
- Should remove the like record for this user

---

### 4. Get Blog Comments
**Endpoint:** `GET /blogs/{blog_id}/comments`

**Purpose:** Retrieve all comments for a specific blog post.

**Response:**
```json
[
  {
    "id": "uuid",
    "comment": "Great article!",
    "created_at": "2024-01-01T00:00:00Z",
    "author_name": "Jane Smith",
    "author_identifier": "jane@example.com",
    "is_mine": false
  },
  {
    "id": "uuid",
    "comment": "Very helpful, thanks!",
    "created_at": "2024-01-02T00:00:00Z",
    "author_name": "Current User",
    "author_identifier": "current@example.com",
    "is_mine": true
  }
]
```

**Notes:**
- `is_mine` should be `true` if the comment was created by the authenticated user
- Comments should be ordered by `created_at` (oldest first or newest first - your choice)
- Should work for both authenticated and unauthenticated users (public endpoint)

---

### 5. Create Blog Comment
**Endpoint:** `POST /blogs/{blog_id}/comments`

**Purpose:** Allow authenticated users to post a comment on a blog.

**Authentication:** Required

**Request Body:**
```json
{
  "comment": "This is my comment text"
}
```

**Response:**
```json
{
  "id": "uuid",
  "comment": "This is my comment text",
  "created_at": "2024-01-01T00:00:00Z",
  "author_name": "Current User",
  "author_identifier": "current@example.com",
  "is_mine": true
}
```

**Notes:**
- Should increment the blog's `comments_count`
- Should validate that comment is not empty
- Should associate comment with the authenticated user

---

### 6. Delete Blog Comment
**Endpoint:** `DELETE /blogs/comments/{comment_id}`

**Purpose:** Allow users to delete their own comments.

**Authentication:** Required

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

**Notes:**
- Should only allow users to delete their own comments
- Should decrement the blog's `comments_count`
- Admins should be able to delete any comment

---

## 🟡 Important Enhancements (Recommended)

### 7. Update Blog Slug Generation
**Endpoint:** Modify existing `POST /blogs` and `PATCH /blogs/{blog_id}`

**Purpose:** Auto-generate URL-friendly slugs from blog titles.

**Slug Generation Rules:**
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (keep only alphanumeric and hyphens)
- Handle duplicates by appending a number (e.g., "my-post-2")

**Example:**
- "My Amazing Blog Post!" → "my-amazing-blog-post"
- "Top 10 Tips for Taxi Booking" → "top-10-tips-for-taxi-booking"

---

### 8. Update Public Blogs Endpoint
**Endpoint:** Modify existing `GET /blogs/public`

**Purpose:** Include like and comment counts in the blog list.

**Enhanced Response:**
```json
[
  {
    "id": "uuid",
    "title": "Blog Title",
    "content": "Content preview...",
    "image_url": "https://example.com/image.jpg",
    "excerpt": "Short description",
    "slug": "blog-title-slug",
    "tags": ["tag1", "tag2"],
    "created_at": "2024-01-01T00:00:00Z",
    "likes_count": 42,
    "comments_count": 15
  }
]
```

---

## 🟢 Nice-to-Have Features (Optional)

### 9. Get Popular Blogs
**Endpoint:** `GET /blogs/popular?limit=5`

**Purpose:** Retrieve the most liked or most commented blogs.

**Query Parameters:**
- `limit` (optional, default: 5): Number of blogs to return
- `sort_by` (optional, default: "likes"): Sort by "likes" or "comments"

---

### 10. Get Related Blogs
**Endpoint:** `GET /blogs/{blog_id}/related?limit=3`

**Purpose:** Retrieve blogs with similar tags or topics.

**Query Parameters:**
- `limit` (optional, default: 3): Number of related blogs to return

---

## 📊 Database Schema Additions

### Blog Likes Table
```sql
CREATE TABLE blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

CREATE INDEX idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX idx_blog_likes_user_id ON blog_likes(user_id);
```

### Blog Comments Table
```sql
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
```

### Update Blogs Table
```sql
ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE blogs ADD COLUMN likes_count INTEGER DEFAULT 0;
ALTER TABLE blogs ADD COLUMN comments_count INTEGER DEFAULT 0;

CREATE INDEX idx_blogs_slug ON blogs(slug);
```

---

## 🔒 Security Considerations

1. **Rate Limiting:** Implement rate limiting on comment and like endpoints to prevent spam
2. **Content Validation:** Sanitize comment text to prevent XSS attacks
3. **Authorization:** Ensure users can only delete their own comments
4. **Spam Prevention:** Consider implementing a cooldown period between comments from the same user

---

## 📝 Implementation Priority

1. **Phase 1 (Critical):** APIs 1-6 (Blog detail, likes, comments)
2. **Phase 2 (Enhancement):** APIs 7-8 (Slug generation, enhanced listing)
3. **Phase 3 (Optional):** APIs 9-10 (Popular blogs, related blogs)

---

## 🧪 Testing Checklist

- [ ] Blog detail page loads correctly with slug
- [ ] Like button works for authenticated users
- [ ] Unlike button works correctly
- [ ] Like count updates in real-time
- [ ] Comments display correctly
- [ ] Comment submission works
- [ ] Comment deletion works (own comments only)
- [ ] Comment count updates correctly
- [ ] Unauthenticated users see appropriate messages
- [ ] Slug generation handles special characters
- [ ] Duplicate slugs are handled correctly

---

## 📚 API Documentation Example

For your backend API documentation (Swagger/OpenAPI), here's a sample for the like endpoint:

```yaml
/blogs/{blog_id}/likes:
  post:
    summary: Like a blog post
    tags:
      - Blogs
    security:
      - BearerAuth: []
    parameters:
      - name: blog_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: Blog liked successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                likes_count:
                  type: integer
      401:
        description: Unauthorized
      404:
        description: Blog not found
```

---

## 🎯 Frontend Integration Notes

The frontend is already implemented and expects these exact API responses. Key integration points:

1. **Blog Detail Page:** `/blogs/[slug]/page.tsx`
   - Calls `getPublicBlogBySlug(slug)`
   - Calls `likeBlog(id)` and `unlikeBlog(id)`
   - Calls `getBlogComments(id)`, `createBlogComment(id, comment)`, `deleteBlogComment(commentId)`

2. **API Client:** `src/lib/api.ts`
   - All API methods are already defined
   - Just need backend endpoints to match

3. **Blog Listing:** `/blogs/page.tsx`
   - Clickable blog cards navigate to `/blogs/{slug}`
   - Expects `slug` field in blog objects

---

## 🚀 Quick Start for Backend Developers

1. Create the database tables (blog_likes, blog_comments)
2. Add slug field to blogs table
3. Implement the 6 critical API endpoints
4. Test with the frontend (already built)
5. Deploy and enjoy! 🎉
