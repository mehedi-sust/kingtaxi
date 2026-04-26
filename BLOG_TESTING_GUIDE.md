# Blog Feature Testing Guide

Quick guide for testing the new blog feature before and after backend implementation.

## 🧪 Testing Phases

### Phase 1: Frontend Testing (Current)
Test the UI and user experience without backend APIs.

### Phase 2: Integration Testing (After Backend)
Test the complete flow with real backend APIs.

### Phase 3: Production Testing
Final checks before going live.

---

## 📋 Phase 1: Frontend Testing (Now)

### Test Blog Listing Page (`/blogs`)

#### Test Cases:
1. **Navigation**
   - [ ] Navigate to `/blogs` from navbar
   - [ ] Page loads without errors
   - [ ] All three tabs are visible (All Blogs, Write a Blog, My Blogs)

2. **All Blogs Tab**
   - [ ] Blog cards display correctly
   - [ ] Images load (if any)
   - [ ] Tags display properly
   - [ ] Dates format correctly
   - [ ] Hover effects work
   - [ ] Click on card navigates to detail page

3. **Write a Blog Tab**
   - [ ] Form displays correctly
   - [ ] Writing tips show
   - [ ] Title input works
   - [ ] Image URL input works
   - [ ] Tags input works
   - [ ] Content textarea works
   - [ ] Markdown helper buttons work
   - [ ] Submit button is disabled when not signed in
   - [ ] Error messages display correctly

4. **My Blogs Tab** (requires sign-in)
   - [ ] Shows "sign in" message when not authenticated
   - [ ] Shows user's blogs when authenticated
   - [ ] Edit button works
   - [ ] Delete button works
   - [ ] Status badges display correctly

5. **Responsive Design**
   - [ ] Mobile view (< 640px)
   - [ ] Tablet view (640px - 1024px)
   - [ ] Desktop view (> 1024px)

6. **Dark Mode**
   - [ ] Toggle dark mode
   - [ ] All elements visible in dark mode
   - [ ] Colors contrast properly

---

### Test Blog Detail Page (`/blogs/[slug]`)

#### Test Cases:
1. **Page Load**
   - [ ] Navigate to a blog detail page
   - [ ] Loading state shows
   - [ ] Content loads correctly
   - [ ] Back button works

2. **Content Display**
   - [ ] Title displays correctly
   - [ ] Cover image shows (if present)
   - [ ] Author name displays
   - [ ] Date formats correctly
   - [ ] Tags display properly
   - [ ] Markdown content renders correctly
   - [ ] Inline images load
   - [ ] Links work and open in new tab
   - [ ] Code blocks display with syntax highlighting
   - [ ] Lists format correctly
   - [ ] Tables display properly

3. **Like Feature**
   - [ ] Like button displays
   - [ ] Like count shows
   - [ ] Click like when not signed in shows message
   - [ ] Click like when signed in (will fail until backend ready)
   - [ ] Heart fills when liked
   - [ ] Unlike works

4. **Comment Feature**
   - [ ] Comments section displays
   - [ ] Comment count shows
   - [ ] Comment form shows when signed in
   - [ ] "Sign in" message shows when not signed in
   - [ ] Can type in comment textarea
   - [ ] Submit button enables/disables correctly
   - [ ] Comments list displays
   - [ ] Delete button shows only on own comments

5. **Share Feature**
   - [ ] Share button displays
   - [ ] Click share on mobile (native share)
   - [ ] Click share on desktop (copy to clipboard)
   - [ ] Success message shows

6. **Responsive Design**
   - [ ] Mobile: single column, readable text
   - [ ] Tablet: proper spacing
   - [ ] Desktop: optimal reading width

7. **Dark Mode**
   - [ ] All content visible in dark mode
   - [ ] Prose styling works in dark mode
   - [ ] Buttons visible in dark mode

---

### Test Admin Blog Manager

#### Test Cases:
1. **Blog List**
   - [ ] Navigate to Admin Dashboard
   - [ ] Blog Management section visible
   - [ ] Pending count badge shows
   - [ ] Refresh button works
   - [ ] Table displays all blogs
   - [ ] Status badges show correctly

2. **Preview Modal**
   - [ ] Click eye icon to preview
   - [ ] Modal opens
   - [ ] Cover image displays
   - [ ] Title shows
   - [ ] Author and date display
   - [ ] Tags show
   - [ ] Content displays
   - [ ] Status badge shows
   - [ ] Action buttons visible
   - [ ] Close button works
   - [ ] Click outside closes modal

3. **Admin Actions**
   - [ ] Approve button works (will fail until backend ready)
   - [ ] Reject button works (will fail until backend ready)
   - [ ] Delete button works (will fail until backend ready)
   - [ ] Confirmation dialog shows for delete

4. **Responsive Design**
   - [ ] Modal responsive on mobile
   - [ ] Scrollable content
   - [ ] Buttons stack on mobile

---

## 🔌 Phase 2: Integration Testing (After Backend)

### Prerequisites:
- [ ] Backend APIs implemented (see `BLOG_BACKEND_APIS_NEEDED.md`)
- [ ] Database tables created
- [ ] Test data seeded

### Test Blog Creation Flow

1. **Create a Blog**
   ```
   Steps:
   1. Sign in as a regular user
   2. Go to /blogs → Write a Blog
   3. Fill in:
      - Title: "Test Blog Post"
      - Image URL: "https://picsum.photos/1200/630"
      - Tags: "test, demo"
      - Content: Use sample markdown (see below)
   4. Click Submit
   
   Expected:
   - Success message shows
   - Blog appears in "My Blogs" with "pending" status
   - Blog does NOT appear in "All Blogs" yet
   ```

2. **Admin Approval**
   ```
   Steps:
   1. Sign in as admin
   2. Go to Admin Dashboard → Blog Management
   3. Find the test blog (status: pending)
   4. Click eye icon to preview
   5. Review the full preview
   6. Click "Approve & Publish"
   
   Expected:
   - Success message shows
   - Status changes to "approved"
   - Blog now appears in public "All Blogs"
   ```

3. **View Published Blog**
   ```
   Steps:
   1. Sign out (or use incognito)
   2. Go to /blogs
   3. Find the test blog
   4. Click on it
   
   Expected:
   - Blog detail page loads
   - All content displays correctly
   - Slug in URL is clean (e.g., /blogs/test-blog-post)
   ```

---

### Test Like Feature

1. **Like a Blog**
   ```
   Steps:
   1. Sign in as a user
   2. Navigate to any blog detail page
   3. Click the heart button
   
   Expected:
   - Heart fills with color
   - Like count increases by 1
   - Button shows "liked" state
   ```

2. **Unlike a Blog**
   ```
   Steps:
   1. On the same blog, click heart again
   
   Expected:
   - Heart becomes outline
   - Like count decreases by 1
   - Button shows "unliked" state
   ```

3. **Like Persistence**
   ```
   Steps:
   1. Like a blog
   2. Refresh the page
   
   Expected:
   - Blog still shows as liked
   - Like count is correct
   ```

4. **Multiple Users**
   ```
   Steps:
   1. User A likes a blog (count: 1)
   2. User B likes the same blog (count: 2)
   3. User A unlikes (count: 1)
   
   Expected:
   - Each user's like is tracked separately
   - Count updates correctly
   ```

---

### Test Comment Feature

1. **Post a Comment**
   ```
   Steps:
   1. Sign in as a user
   2. Navigate to any blog detail page
   3. Type a comment in the textarea
   4. Click "Post Comment"
   
   Expected:
   - Comment appears in the list
   - Comment count increases
   - Textarea clears
   - Success feedback shows
   ```

2. **View Comments**
   ```
   Steps:
   1. Sign out
   2. View the same blog
   
   Expected:
   - Comments are visible to everyone
   - Author names display
   - Dates display correctly
   - Delete button NOT visible (not signed in)
   ```

3. **Delete Own Comment**
   ```
   Steps:
   1. Sign in as the comment author
   2. View the blog with your comment
   3. Click delete button on your comment
   4. Confirm deletion
   
   Expected:
   - Comment disappears
   - Comment count decreases
   - Other comments remain
   ```

4. **Cannot Delete Others' Comments**
   ```
   Steps:
   1. Sign in as a different user
   2. View a blog with comments from others
   
   Expected:
   - Delete button NOT visible on others' comments
   - Delete button visible only on own comments
   ```

---

### Test Slug Generation

1. **Simple Title**
   ```
   Input: "My First Blog Post"
   Expected Slug: "my-first-blog-post"
   URL: /blogs/my-first-blog-post
   ```

2. **Special Characters**
   ```
   Input: "Top 10 Tips for Taxi Booking!"
   Expected Slug: "top-10-tips-for-taxi-booking"
   URL: /blogs/top-10-tips-for-taxi-booking
   ```

3. **Duplicate Titles**
   ```
   Input: "Test Post" (already exists)
   Expected Slug: "test-post-2"
   URL: /blogs/test-post-2
   ```

---

### Test Error Handling

1. **Invalid Blog Slug**
   ```
   Steps:
   1. Navigate to /blogs/non-existent-slug
   
   Expected:
   - Error message displays
   - "Back to Blogs" button shows
   - No crash
   ```

2. **Network Error**
   ```
   Steps:
   1. Disconnect internet
   2. Try to load a blog
   
   Expected:
   - Error message displays
   - Graceful fallback
   - No crash
   ```

3. **Failed Like**
   ```
   Steps:
   1. Like a blog
   2. Simulate API failure
   
   Expected:
   - Error message shows
   - UI reverts to previous state
   - No crash
   ```

---

## 🎯 Phase 3: Production Testing

### Pre-Launch Checklist

#### Functionality:
- [ ] All blog CRUD operations work
- [ ] Likes work correctly
- [ ] Comments work correctly
- [ ] Admin approval flow works
- [ ] Slug generation works
- [ ] Search engines can crawl blogs

#### Performance:
- [ ] Page load time < 3 seconds
- [ ] Images load quickly
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

#### SEO:
- [ ] Meta tags present on all blog pages
- [ ] Open Graph tags work (test with Facebook Debugger)
- [ ] Twitter Cards work (test with Twitter Card Validator)
- [ ] JSON-LD structured data valid (test with Google Rich Results Test)
- [ ] Sitemap includes blog posts
- [ ] Robots.txt allows blog crawling

#### Security:
- [ ] XSS protection works (try injecting `<script>alert('xss')</script>`)
- [ ] SQL injection protected
- [ ] Authentication required for protected actions
- [ ] Authorization works (users can't delete others' content)
- [ ] Rate limiting works (try spamming comments)

#### Accessibility:
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient
- [ ] Alt text on all images
- [ ] Focus indicators visible

#### Mobile:
- [ ] Responsive on iPhone
- [ ] Responsive on Android
- [ ] Touch targets large enough
- [ ] No horizontal scroll
- [ ] Forms work on mobile

#### Cross-Browser:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 🧪 Sample Test Data

### Sample Blog Post (Markdown)

```markdown
# Welcome to King Taxi Blog

This is a **test blog post** to demonstrate all markdown features.

## Text Formatting

You can use *italic*, **bold**, and ***bold italic*** text. You can also use ~~strikethrough~~.

## Lists

### Unordered List
- First item
- Second item
- Third item
  - Nested item

### Ordered List
1. First step
2. Second step
3. Third step

## Links and Images

Check out our [website](https://kingtaxi.com) for more information.

![Sample Image](https://picsum.photos/800/400)

## Code

Inline `code` looks like this.

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

## Blockquote

> This is a quote from a satisfied customer.
> It can span multiple lines.

## Table

| Feature | Status |
|---------|--------|
| Likes   | ✅     |
| Comments| ✅     |
| Share   | ✅     |

## Conclusion

This blog post demonstrates all the markdown features supported by King Taxi blog system.
```

---

## 🐛 Common Issues and Solutions

### Issue: Blog detail page shows 404
**Solution:** Check that slug is being generated correctly in backend

### Issue: Likes don't persist
**Solution:** Verify `blog_likes` table exists and API is saving correctly

### Issue: Comments don't show
**Solution:** Check `blog_comments` table and API endpoint

### Issue: Images don't load
**Solution:** Verify image URLs are valid and accessible

### Issue: Markdown not rendering
**Solution:** Check that `react-markdown` dependencies are installed

### Issue: Dark mode broken
**Solution:** Verify dark mode classes in Tailwind config

---

## 📊 Test Results Template

Use this template to document your testing:

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Environment:** [Development/Staging/Production]
**Browser:** [Chrome/Firefox/Safari/Edge]
**Device:** [Desktop/Mobile/Tablet]

### Test Results:

#### Blog Listing Page
- [ ] Pass / [ ] Fail - Navigation works
- [ ] Pass / [ ] Fail - Blog cards display
- [ ] Pass / [ ] Fail - Responsive design
- [ ] Pass / [ ] Fail - Dark mode

#### Blog Detail Page
- [ ] Pass / [ ] Fail - Content loads
- [ ] Pass / [ ] Fail - Markdown renders
- [ ] Pass / [ ] Fail - Like feature
- [ ] Pass / [ ] Fail - Comment feature
- [ ] Pass / [ ] Fail - Share feature

#### Admin Panel
- [ ] Pass / [ ] Fail - Blog list displays
- [ ] Pass / [ ] Fail - Preview works
- [ ] Pass / [ ] Fail - Approve/Reject works
- [ ] Pass / [ ] Fail - Delete works

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Any additional observations]
```

---

## 🚀 Quick Test Commands

### Start Development Server
```bash
cd kingtaxi/kingtaxi-webapp
npm run dev
```

### Run Tests (when implemented)
```bash
npm test
```

### Build for Production
```bash
npm run build
```

### Check for Errors
```bash
npm run lint
```

---

## 📞 Reporting Issues

When reporting issues, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots/videos**
5. **Browser and device info**
6. **Console errors**

---

## ✅ Sign-Off Checklist

Before marking the feature as complete:

- [ ] All Phase 1 tests pass
- [ ] All Phase 2 tests pass
- [ ] All Phase 3 tests pass
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] SEO verified
- [ ] Accessibility verified
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] Documentation complete
- [ ] Team trained
- [ ] Stakeholders approved

---

## 🎉 Ready to Launch!

Once all tests pass, the blog feature is ready for production! 🚀

**Happy Testing! 🧪✨**
