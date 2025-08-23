# Reddit Clone API Documentation

## Comment Management with Nested Comments

### Create Comment
**POST** `/api/v1/comments`

Create a new comment or reply to an existing comment.

```json
{
  "content": "This is a comment",
  "userId": 1,
  "postId": 1,
  "parentCommentId": null  // Optional: for nested comments/replies
}
```

### Get Comments for Post
**GET** `/api/v1/comments/post/{postId}?page=0&size=10`

Retrieves all top-level comments for a post with their nested replies loaded recursively.

### Get Replies for Comment
**GET** `/api/v1/comments/{commentId}/replies?page=0&size=10`

Get direct replies to a specific comment.

### Get Comment Count
**GET** `/api/v1/comments/post/{postId}/count`

Returns the total number of comments (including nested) for a post.

### Get Reply Count
**GET** `/api/v1/comments/{commentId}/replies/count`

Returns the number of direct replies to a comment.

### Update Comment
**PUT** `/api/v1/comments/{id}`

```json
{
  "content": "Updated comment content",
  "userId": 1
}
```

### Delete Comment
**DELETE** `/api/v1/comments/{id}`

Deletes a comment and all its nested replies (cascade delete).

## Post Management

### Create Post
**POST** `/api/v1/posts`

```json
{
  "title": "Post Title",
  "content": "Post content",
  "type": "TEXT",
  "userId": 1,
  "communityId": 1,
  "url": null,
  "imageUrl": null
}
```

### Get Post
**GET** `/api/v1/posts/{id}`

### Update Post
**PUT** `/api/v1/posts/{id}`

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "userId": 1
}
```

### Delete Post
**DELETE** `/api/v1/posts/{id}`

Deletes a post and all associated comments and votes (cascade delete).

### Get Posts
- **GET** `/api/v1/posts?page=0&size=10` - All posts (newest first)
- **GET** `/api/v1/posts/hot?page=0&size=10` - Hot posts (by score and recency)
- **GET** `/api/v1/posts/top?page=0&size=10` - Top posts (by score)
- **GET** `/api/v1/posts/new?page=0&size=10` - Newest posts
- **GET** `/api/v1/posts/community/{communityId}?page=0&size=10` - Posts in community
- **GET** `/api/v1/posts/feed/{userId}?page=0&size=10` - User's personalized feed

### Search Posts
**GET** `/api/v1/posts/search?query=searchterm&page=0&size=10`

## Database Features

### Nested Comments Structure
- Comments can have unlimited nesting levels
- Parent-child relationships are maintained in the database
- Cascade deletion ensures data integrity

### Cascade Deletion
- Deleting a post removes all associated comments and votes
- Deleting a parent comment removes all nested replies
- Orphan removal is enabled for clean database maintenance

### Performance Optimizations
- Lazy loading for comment replies
- Efficient counting queries
- Paginated results for large datasets
- Recursive loading with depth control

## Data Models

### Comment Model
```java
{
  "id": 1,
  "content": "Comment text",
  "user": { "id": 1, "username": "user1" },
  "post": { "id": 1, "title": "Post title" },
  "parentComment": { "id": 2 },  // null for top-level comments
  "replies": [...],  // nested comments
  "upvotes": 5,
  "downvotes": 1,
  "score": 4,
  "createdAt": "2025-01-01T12:00:00",
  "updatedAt": "2025-01-01T12:00:00"
}
```

### Post Model
```java
{
  "id": 1,
  "title": "Post Title",
  "content": "Post content",
  "type": "TEXT",
  "user": { "id": 1, "username": "user1" },
  "community": { "id": 1, "name": "community1" },
  "upvotes": 10,
  "downvotes": 2,
  "score": 8,
  "commentCount": 15,
  "createdAt": "2025-01-01T12:00:00",
  "updatedAt": "2025-01-01T12:00:00"
}
```