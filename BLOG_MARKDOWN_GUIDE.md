# Blog Markdown Guide for King Taxi

A quick reference for writing beautiful blog posts using Markdown.

## 📝 Basic Formatting

### Headings
```markdown
# Heading 1 (Main Title - use once per blog)
## Heading 2 (Major Sections)
### Heading 3 (Subsections)
#### Heading 4 (Minor Sections)
```

### Text Styling
```markdown
**Bold text** or __Bold text__
*Italic text* or _Italic text_
***Bold and italic*** or ___Bold and italic___
~~Strikethrough text~~
```

**Result:**
- **Bold text**
- *Italic text*
- ***Bold and italic***
- ~~Strikethrough text~~

---

## 📋 Lists

### Unordered Lists
```markdown
- First item
- Second item
- Third item
  - Nested item
  - Another nested item
```

**Result:**
- First item
- Second item
- Third item
  - Nested item
  - Another nested item

### Ordered Lists
```markdown
1. First step
2. Second step
3. Third step
   1. Sub-step
   2. Another sub-step
```

**Result:**
1. First step
2. Second step
3. Third step
   1. Sub-step
   2. Another sub-step

### Task Lists
```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

**Result:**
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

---

## 🔗 Links and Images

### Links
```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Hover text")
```

**Result:**
[King Taxi Website](https://kingtaxi.com)

### Images
```markdown
![Alt text](https://example.com/image.jpg)
![Image with title](https://example.com/image.jpg "Image title")
```

**Tips for Images:**
- Use the image URL field in the blog form for the cover image
- Use markdown syntax for inline images in your content
- Always include descriptive alt text for accessibility
- Use high-quality images (recommended: 1200x630px for cover)

---

## 💬 Quotes and Code

### Blockquotes
```markdown
> This is a quote
> It can span multiple lines
>
> And have multiple paragraphs
```

**Result:**
> This is a quote
> It can span multiple lines

### Inline Code
```markdown
Use `code` for inline code snippets
```

**Result:**
Use `code` for inline code snippets

### Code Blocks
````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```
````

**Result:**
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
```

---

## 📊 Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |
```

**Result:**
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |

### Aligned Tables
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
| Left | Center | Right |
```

**Result:**
| Left | Center | Right |
|:-----|:------:|------:|
| L    | C      | R     |
| Left | Center | Right |

---

## 🎯 Advanced Features

### Horizontal Rules
```markdown
---
or
***
or
___
```

**Result:**
---

### Line Breaks
```markdown
First line  
Second line (two spaces at end of first line)

Or use a blank line for paragraph break
```

### Escaping Characters
```markdown
\* Not italic \*
\# Not a heading
\[Not a link\](url)
```

---

## ✍️ Blog Writing Tips

### 1. Structure Your Content
```markdown
# Main Title (H1)

Brief introduction paragraph...

## First Major Section (H2)

Content for this section...

### Subsection (H3)

More detailed content...

## Second Major Section (H2)

More content...

## Conclusion (H2)

Wrap up your thoughts...
```

### 2. Use Visual Elements
- **Images:** Break up text with relevant images
- **Lists:** Make information scannable
- **Quotes:** Highlight important points
- **Code blocks:** Show examples clearly

### 3. Write Engaging Content
```markdown
## 5 Tips for Better Taxi Booking

1. **Book in Advance** - Save time and money
   - Plan your trips ahead
   - Get better rates
   
2. **Check Reviews** - Choose reliable drivers
   - Read customer feedback
   - Look for high ratings

3. **Compare Prices** - Find the best deals
   - Use fare calculator
   - Check special offers
```

### 4. Add Call-to-Actions
```markdown
Ready to book your next ride? [Book Now](https://kingtaxi.com/book)

Have questions? [Contact our support team](https://kingtaxi.com/contact)
```

---

## 📱 Mobile-Friendly Writing

### Keep Paragraphs Short
```markdown
Short paragraphs are easier to read on mobile.

Each paragraph should focus on one idea.

This makes your content more scannable.
```

### Use Subheadings Frequently
```markdown
## Main Topic

### Subtopic 1
Content...

### Subtopic 2
Content...

### Subtopic 3
Content...
```

---

## 🎨 Styling Best Practices

### DO:
✅ Use headings hierarchically (H1 → H2 → H3)
✅ Add alt text to all images
✅ Keep paragraphs short (3-4 sentences)
✅ Use lists for multiple points
✅ Include relevant links
✅ Break up text with images
✅ Use bold for emphasis sparingly

### DON'T:
❌ Skip heading levels (H1 → H3)
❌ Use ALL CAPS for emphasis
❌ Create walls of text
❌ Overuse bold or italic
❌ Use too many exclamation marks!!!
❌ Forget to proofread

---

## 🚀 Example Blog Post

Here's a complete example:

```markdown
# Top 5 Tips for Booking a Taxi in Dhaka

Navigating Dhaka's busy streets can be challenging. Here are our top tips for a smooth taxi booking experience.

## 1. Book in Advance

**Save time and avoid last-minute stress** by booking your taxi ahead of time.

- Plan your trips the night before
- Get guaranteed availability
- Lock in better rates

## 2. Use the Fare Calculator

Not sure how much your trip will cost? Our fare calculator helps you:

1. Enter pickup and dropoff locations
2. Select vehicle type
3. Get instant price estimate

[Try our fare calculator](https://kingtaxi.com/book)

## 3. Check Driver Reviews

> "Always read reviews before booking. It helps you choose the most reliable drivers."
> — Happy Customer

Look for drivers with:
- ⭐ High ratings (4.5+)
- 💬 Positive comments
- 🚗 Clean vehicles

## 4. Compare Vehicle Options

| Vehicle Type | Passengers | Luggage | Best For |
|--------------|-----------|---------|----------|
| 4-Seater     | 1-4       | 2 bags  | City trips |
| 8-Seater     | 5-8       | 4 bags  | Groups |

## 5. Take Advantage of Offers

Check our [special offers page](/offers) regularly for:
- Seasonal discounts
- Airport transfer deals
- Loyalty rewards

## Ready to Book?

Follow these tips for a better taxi experience in Dhaka. 

[Book Your Ride Now](https://kingtaxi.com/book)

---

*Have more questions? [Contact us](https://kingtaxi.com/contact) anytime!*
```

---

## 🔍 SEO Tips for Blog Posts

### 1. Use Keywords Naturally
```markdown
# Best Taxi Service in Dhaka: Complete Guide

Looking for reliable taxi service in Dhaka? This guide covers everything you need to know about booking taxis in Bangladesh's capital city.
```

### 2. Write Descriptive Headings
```markdown
❌ ## Tips
✅ ## 5 Money-Saving Tips for Taxi Booking in Dhaka

❌ ## How To
✅ ## How to Book an Airport Taxi in 3 Easy Steps
```

### 3. Add Internal Links
```markdown
Learn more about our [fare structure](/fares) and [vehicle options](/vehicles).

Check out our guide on [airport transfers](/blog/airport-transfer-guide).
```

### 4. Use Tags Effectively
When submitting your blog, add relevant tags:
- `taxi tips, dhaka, booking, travel, transportation`
- `airport transfer, fare calculator, ride booking`
- `customer guide, taxi service, bangladesh`

---

## 🎓 Learning Resources

### Markdown Editors (for practice):
- [StackEdit](https://stackedit.io/) - Online markdown editor
- [Dillinger](https://dillinger.io/) - Another great online editor
- [Typora](https://typora.io/) - Desktop markdown editor

### Markdown Guides:
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown](https://guides.github.com/features/mastering-markdown/)
- [CommonMark](https://commonmark.org/)

---

## 💡 Quick Reference Cheatsheet

```markdown
# H1          ## H2         ### H3
**bold**      *italic*      ***both***
~~strike~~    `code`        [link](url)
![img](url)   > quote       - list
1. ordered    - [ ] task    ---
```

---

## ❓ FAQ

### Q: Can I use HTML in my blog posts?
A: Yes, but it will be sanitized for security. Stick to markdown for best results.

### Q: How do I add a cover image?
A: Use the "Image URL" field in the blog form. This will be your cover image.

### Q: Can I edit my blog after submission?
A: Yes, go to "My Blogs" tab and click "Edit" on any of your posts.

### Q: How long should my blog post be?
A: Aim for 500-1500 words. Quality over quantity!

### Q: Can I preview my blog before submitting?
A: The admin will see a full preview before approving. Write in a markdown editor first to preview locally.

---

## 🎉 You're Ready!

Now you know everything you need to write amazing blog posts for King Taxi. Start writing and share your experiences!

**Happy blogging! 📝✨**
