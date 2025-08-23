# Manual API Testing Guide

## Prerequisites
1. Start the application: `./gradlew bootRun`
2. The application will run on `http://localhost:7777`
3. Make sure MySQL is running and the database `reddit` exists

## Test the Comment and Post Functionality

### 1. Create a User (if not exists)
```bash
curl -X POST http://localhost:7777/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Create a Community (if not exists)
```bash
curl -X POST http://localhost:7777/api/v1/communities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "testcommunity",
    "displayName": "r/testcommunity",
    "description": "Test community for API testing"
  }'
```

### 3. Create a Post
```bash
curl -X POST http://localhost:7777/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post for Comments",
    "content": "This is a test post to test comment functionality",
    "type": "TEXT",
    "userId": 1,
    "communityId": 1
  }'
```

### 4. Create a Parent Comment
```bash
curl -X POST http://localhost:7777/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a parent comment",
    "userId": 1,
    "postId": 1
  }'
```

### 5. Create a Nested Comment (Reply)
```bash
curl -X POST http://localhost:7777/api/v1/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a reply to the parent comment",
    "userId": 1,
    "postId": 1,
    "parentCommentId": 1
  }'
```

### 6. Get Comments for Post
```bash
curl -X GET "http://localhost:7777/api/v1/comments/post/1?page=0&size=10"
```

### 7. Get Comment Count for Post
```bash
curl -X GET http://localhost:7777/api/v1/comments/post/1/count
```

### 8. Get Reply Count for Comment
```bash
curl -X GET http://localhost:7777/api/v1/comments/1/replies/count
```

### 9. Delete a Comment (will cascade delete replies)
```bash
curl -X DELETE http://localhost:7777/api/v1/comments/1
```

### 10. Delete a Post (will cascade delete all comments)
```bash
curl -X DELETE http://localhost:7777/api/v1/posts/1
```

## Expected Results

- Comments should be created with proper parent-child relationships
- Nested comments should be loaded recursively when fetching post comments
- Deleting a parent comment should delete all its replies
- Deleting a post should delete all associated comments
- Comment counts should be accurate and update automatically

## Database Verification

You can check the database directly to verify the relationships:

```sql
-- Check comments table
SELECT id, content, post_id, parent_comment_id, user_id FROM comments;

-- Check posts table
SELECT id, title, comment_count FROM posts;

-- Verify cascade deletion worked
-- After deleting a comment, check that its replies are also deleted
```