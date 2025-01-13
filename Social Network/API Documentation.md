### API Documentation

### **Login API**

#### **Endpoint**

`POST /login/`

#### **Description**

Authenticates a user with their username and password and logs them in if the credentials are valid. If authentication fails, an error message is returned.

#### **Request Method**

`POST`

#### **Request Parameters**

| Parameter  | Type     | Required | Description               |
| ---------- | -------- | -------- | ------------------------- |
| `username` | `string` | Yes      | The username of the user. |
| `password` | `string` | Yes      | The password of the user. |

#### **Request Body Example**

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

#### **Response**

**On Success**

- **Status Code:** `302 Found` (Redirects to the index page)
- **Description:** User is successfully authenticated and logged in.

**On Failure**

- **Status Code:** `200 OK`
- **Description:** Renders the login page with an error message.
- **Response Example (Rendered HTML):**

```html
<html>
  <body>
    <div>Invalid username and/or password.</div>
  </body>
</html>
```

#### **Notes**

- This endpoint requires a `POST` request. If accessed with a `GET` request, the login page is rendered.
- Ensure that the `username` and `password` fields are sent as part of a form-encoded request body (`application/x-www-form-urlencoded`).

---

---

### **Register API**

#### **Endpoint**

`POST /register/`

#### **Description**

Registers a new user by creating an account with a username, email, and password. If the registration is successful, the user is logged in and redirected to the index page. If there are errors (e.g., passwords do not match or the username is already taken), an appropriate error message is displayed.

#### **Request Method**

`POST`

#### **Request Parameters**

| Parameter      | Type     | Required | Description                               |
| -------------- | -------- | -------- | ----------------------------------------- |
| `username`     | `string` | Yes      | The desired username for the new account. |
| `email`        | `string` | Yes      | The email address of the user.            |
| `password`     | `string` | Yes      | The password for the account.             |
| `confirmation` | `string` | Yes      | Must match the `password` field.          |

#### **Request Body Example**

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "securepassword123",
  "confirmation": "securepassword123"
}
```

#### **Response**

**On Success**

- **Status Code:** `302 Found` (Redirects to the index page)
- **Description:** User is successfully registered and logged in.

**On Failure**

- **Status Code:** `200 OK`
- **Description:** Renders the registration page with an error message.

**Error Response Examples**

1. Passwords do not match:

```html
<html>
  <body>
    <div>Passwords must match.</div>
  </body>
</html>
```

2. Username already taken:

```html
<html>
  <body>
    <div>Username already taken.</div>
  </body>
</html>
```

#### **Notes**

- This endpoint requires a `POST` request. If accessed with a `GET` request, the registration page is rendered.
- Ensure that all fields are included in the request body and are valid.

---

---

### **Logout API**

#### **Endpoint**

`GET /logout/`

#### **Description**

Logs out the currently authenticated user and redirects them to the index page.

#### **Request Method**

`GET`

#### **Response**

**On Success**

- **Status Code:** `302 Found` (Redirects to the index page)
- **Description:** User is successfully logged out.

#### **Notes**

- This endpoint requires no request body or parameters.
- It clears the user's session and logs them out.

---

---

### **Update User Profile API**

#### **Endpoint**

`PUT /update_profile/`

#### **Description**

Allows an authenticated user to update their username and account type. Validates the account type and ensures no duplicate usernames.

#### **Request Method**

`PUT`

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Request Parameters**

| Parameter      | Type     | Required | Description                                                              |
| -------------- | -------- | -------- | ------------------------------------------------------------------------ |
| `username`     | `string` | No       | The new username for the user.                                           |
| `account_type` | `string` | No       | The new account type for the user. Must be either `private` or `public`. |

#### **Request Body Example**

```json
{
  "username": "newusername",
  "account_type": "private"
}
```

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Description:** User details updated successfully.
- **Response Example:**

```json
{
  "detail": "User updated successfully."
}
```

**On Failure**

1. Invalid account type:

   - **Status Code:** `400 Bad Request`
   - **Response Example:**

   ```json
   {
     "account_type": "Invalid account type. Allowed values are: ['private', 'public']"
   }
   ```

2. Username already taken:

   - **Status Code:** `400 Bad Request`
   - **Response Example:**

   ```json
   {
     "detail": "Username already taken."
   }
   ```

3. No changes detected:
   - **Status Code:** `304 Not Modified`
   - **Response Example:**
   ```json
   {
     "detail": "No changes detected."
   }
   ```

#### **Notes**

- The `account_type` must be either `private` or `public`.
- If no fields are provided in the request body, the current values for `username` and `account_type` will remain unchanged.
- This endpoint requires the user to be authenticated.

---

---

### **Posts API**

#### **Base Endpoint**

`/posts/`

#### **Description**

Provides CRUD operations for posts. Users can create, retrieve, update, delete, and list posts. The endpoint enforces authentication and respects user privacy settings.

### **Endpoints**

#### **1. List Posts**

**Endpoint**
`GET /posts/`

#### **Description**

Fetches posts for a specific user. If the user is private, only followers with an accepted request can view their posts. The response includes nested user and post details.

#### **Request Method**

`GET`

#### **Request Parameters**

| Parameter | Type    | Required | Description                                       |
| --------- | ------- | -------- | ------------------------------------------------- |
| `user_id` | Integer | Yes      | The ID of the user whose posts are to be fetched. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "title": "First Post",
    "body": "This is the content of the first post.",
    "total_likes": 10,
    "total_comments": 3,
    "created_at": "2025-01-13T10:00:00Z"
  },
  {
    "id": 2,
    "user": {
      "id": 3,
      "username": "user3",
      "account_type": "private",
      "first_name": "Jane",
      "last_name": "Smith",
      "total_followers": 50,
      "total_following": 75,
      "total_posts": 3
    },
    "title": "Second Post",
    "body": "This is the content of the second post.",
    "total_likes": 5,
    "total_comments": 1,
    "created_at": "2025-01-12T10:00:00Z"
  }
]
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. User not found:

   - **Status Code:** `404 Not Found`
   - **Response Example:**

   ```json
   {
     "detail": "User not found."
   }
   ```

3. User's account is private and the requesting user is not following:
   - **Status Code:** `403 Forbidden`
   - **Response Example:**
   ```json
   {
     "detail": "This user's account is private."
   }
   ```

#### **2. Create a Post**

**Endpoint**
`POST /posts/`

**Description**
Creates a new post for the authenticated user.

**Request Body Example**

```json
{
  "content": "This is my new post!"
}
```

**Response**

**On Success**

- **Status Code:** `201 Created`
- **Response Example:**

```json
{
  "id": 1,
  "user": 2,
  "content": "This is my new post!",
  "created_at": "2025-01-13T10:00:00Z"
}
```

**On Failure**

1. User not authenticated:
   - **Status Code:** `401 Unauthorized`
   - **Response Example:**
   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

#### **3. Delete a Post**

**Endpoint**
`DELETE /posts/{id}/`

**Description**
Deletes a specific post belonging to the authenticated user.

**Response**

**On Success**

- **Status Code:** `204 No Content`
- **Response Example:**

```json
{
  "detail": "Post deleted successfully.",
  "total_posts": 5
}
```

**On Failure**

1. Post not found:

   - **Status Code:** `404 Not Found`
   - **Response Example:**

   ```json
   {
     "detail": "Post does not exist"
   }
   ```

2. User not authenticated:
   - **Status Code:** `401 Unauthorized`
   - **Response Example:**
   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

#### **Notes**

- This endpoint requires the user to be authenticated.
- You must provide a `user_id` to fetch posts for a specific user.
- If the user's account is private, only users who follow them with an accepted request can view their posts.
- The response includes nested details about the user and post, such as `user`'s profile information and `post`'s like and comment counts.

---

---

### **Comments API**

#### **Endpoint**

`GET /posts/{post_id}/comments/`

#### **Description**

Fetches all comments under a specific post. Comments can only be created or viewed for posts that the user has access to. If the post is private, the user must be a follower of the post's owner.

#### **Request Method**

`GET`

#### **Request Parameters**

| Parameter | Type    | Required | Description                                          |
| --------- | ------- | -------- | ---------------------------------------------------- |
| `post_id` | Integer | Yes      | The ID of the post whose comments are to be fetched. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "post": {
      "id": 1,
      "title": "First Post",
      "body": "This is the content of the first post."
    },
    "comments": "Great post!",
    "total_replies": 2,
    "created_at": "2025-01-13T10:00:00Z"
  }
]
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. Post not found:

   - **Status Code:** `404 Not Found`
   - **Response Example:**

   ```json
   {
     "detail": "Post not found."
   }
   ```

3. User cannot comment on a private post without being a follower:
   - **Status Code:** `403 Forbidden`
   - **Response Example:**
   ```json
   {
     "detail": "You cannot comment on a private post unless you are a follower."
   }
   ```

### **Create Comment API**

#### **Endpoint**

`POST /posts/{post_id}/comments/`

#### **Description**

Adds a comment to a specific post. The post must be accessible by the user (either public or they must be a follower of the post's owner).

#### **Request Method**

`POST`

#### **Request Parameters**

| Parameter | Type    | Required | Description                       |
| --------- | ------- | -------- | --------------------------------- |
| `post_id` | Integer | Yes      | The ID of the post to comment on. |

#### **Request Body**

| Parameter  | Type   | Required | Description                 |
| ---------- | ------ | -------- | --------------------------- |
| `comments` | String | Yes      | The content of the comment. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `201 Created`
- **Response Example:**

```json
{
  "detail": "Comment added successfully.",
  "total_comments": 2,
  "comment": {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "post": {
      "id": 1,
      "title": "First Post",
      "body": "This is the content of the first post."
    },
    "comments": "Great post!",
    "total_replies": 0,
    "created_at": "2025-01-13T10:00:00Z"
  }
}
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. User cannot comment on a private post without being a follower:
   - **Status Code:** `403 Forbidden`
   - **Response Example:**
   ```json
   {
     "detail": "You cannot comment on a private post unless you are a follower."
   }
   ```

### **Delete Comment API**

#### **Endpoint**

`DELETE /posts/{post_id}/comments/{comment_id}/`

#### **Description**

Deletes a comment from a specific post. The user must be the owner of the comment to delete it.

#### **Request Method**

`DELETE`

#### **Request Parameters**

| Parameter    | Type    | Required | Description                      |
| ------------ | ------- | -------- | -------------------------------- |
| `post_id`    | Integer | Yes      | The ID of the post.              |
| `comment_id` | Integer | Yes      | The ID of the comment to delete. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `204 No Content`
- **Response Example:**

```json
{
  "detail": "Comment deleted successfully.",
  "total_comments": 1
}
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. User does not have permission to delete the comment:

   - **Status Code:** `403 Forbidden`
   - **Response Example:**

   ```json
   {
     "detail": "You do not have permission to delete this comment."
   }
   ```

3. Comment not found:

   - **Status Code:** `404 Not Found`
   - **Response Example:**

   ```json
   {
     "detail": "Comment not found."
   }
   ```

### Commented Posts API

#### Endpoint

`GET /commented-posts/`

#### Description

Fetches all posts that the authenticated user has commented on. The user must be authenticated to access this endpoint.

#### Request Method

`GET`

#### Request Headers

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### Response

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "title": "First Post",
    "body": "This is the content of the first post.",
    "total_likes": 10,
    "total_comments": 5,
    "created_at": "2025-01-13T10:00:00Z"
  }
]
```

---

---

### **Likes API**

#### **Endpoint**

`GET /posts/{post_id}/likes/`

#### **Description**

Fetches all likes for a specific post. Users can like a post if the post is public or they are following the post's owner.

#### **Request Method**

`GET`

#### **Request Parameters**

| Parameter | Type    | Required | Description                            |
| --------- | ------- | -------- | -------------------------------------- |
| `post_id` | Integer | Yes      | The ID of the post to fetch likes for. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "post": {
      "id": 1,
      "title": "First Post",
      "body": "This is the content of the first post."
    }
  }
]
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. Post not found:
   - **Status Code:** `404 Not Found`
   - **Response Example:**
   ```json
   {
     "detail": "Post not found."
   }
   ```

### **Create Like API**

#### **Endpoint**

`POST /posts/{post_id}/likes/`

#### **Description**

Likes a specific post. The post must be public or the user must be a follower of the post's owner.

#### **Request Method**

`POST`

#### **Request Parameters**

| Parameter | Type    | Required | Description                 |
| --------- | ------- | -------- | --------------------------- |
| `post_id` | Integer | Yes      | The ID of the post to like. |

#### **Request Body**

| Parameter | Type    | Required | Description                         |
| --------- | ------- | -------- | ----------------------------------- |
| `like`    | Boolean | Yes      | Whether to like or unlike the post. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `201 Created`
- **Response Example:**

```json
{
  "detail": "Like added successfully.",
  "total_likes": 1,
  "liked": true
}
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. User cannot like a private post without being a follower:

   - **Status Code:** `403 Forbidden`
   - **Response Example:**

   ```json
   {
     "detail": "You cannot like a private post unless you are a follower."
   }
   ```

3. User has already liked the post:
   - **Status Code:** `400 Bad Request`
   - **Response Example:**
   ```json
   {
     "detail": "You have already liked this post."
   }
   ```

### **Delete Like API**

#### **Endpoint**

`DELETE /posts/{post_id}/likes/`

#### **Description**

Removes a like from a post. The user must be the one who liked the post.

#### **Request Method**

`DELETE`

#### **Request Parameters**

| Parameter | Type    | Required | Description         |
| --------- | ------- | -------- | ------------------- |
| `post_id` | Integer | Yes      | The ID of the post. |

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `204 No Content`
- **Response Example:**

```json
{
  "detail": "Like removed successfully.",
  "total_likes": 0,
  "liked": false
}
```

**On Failure**

1. User not authenticated:

   - **Status Code:** `401 Unauthorized`
   - **Response Example:**

   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

2. User has not liked the post:

   - **Status Code:** `400 Bad Request`
   - **Response Example:**

   ```json
   {
     "detail": "You have not liked this post."
   }
   ```

3. Post not found:
   - **Status Code:** `404 Not Found`
   - **Response Example:**
   ```json
   {
     "detail": "Post not found."
   }
   ```

### **Liked Posts API**

#### **Endpoint**

`GET /liked-posts/`

#### **Description**

Fetches the posts that have been liked by the authenticated user. The response includes nested user and post details.

#### **Request Method**

`GET`

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
[
  {
    "id": 1,
    "user": {
      "id": 2,
      "username": "user2",
      "account_type": "public",
      "first_name": "John",
      "last_name": "Doe",
      "total_followers": 100,
      "total_following": 150,
      "total_posts": 5
    },
    "title": "This is a liked post",
    "body": "Content of the liked post",
    "total_likes": 10,
    "total_comments": 3,
    "created_at": "2025-01-13T10:00:00Z"
  },
  {
    "id": 2,
    "user": {
      "id": 3,
      "username": "user3",
      "account_type": "private",
      "first_name": "Jane",
      "last_name": "Smith",
      "total_followers": 50,
      "total_following": 75,
      "total_posts": 3
    },
    "title": "This is another liked post",
    "body": "Content of another liked post",
    "total_likes": 5,
    "total_comments": 1,
    "created_at": "2025-01-12T10:00:00Z"
  }
]
```

**On Failure**

1. User not authenticated:
   - **Status Code:** `401 Unauthorized`
   - **Response Example:**
   ```json
   {
     "detail": "Authentication credentials were not provided."
   }
   ```

#### **Notes**

- This endpoint requires the user to be authenticated.
- Only posts that the user has liked will be returned.
- The response includes nested details about the user and post, such as `user`'s profile information and `post`'s like and comment counts.

---

---

### **Replies API**

#### **Endpoint**

`GET /posts/{post_id}/comments/{comment_id}/replies/`

#### **Description**

Fetches all replies for a specific comment under a post.

#### **Request Method**

`GET`

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**
  ```json
  [
    {
      "id": 1,
      "content": "This is a reply to the comment.",
      "created_at": "2025-01-12T15:34:00Z",
      "updated_at": "2025-01-12T16:00:00Z",
      "user": {
        "id": 42,
        "username": "john_doe"
      },
      "comments": {
        "id": 12,
        "content": "Original comment content"
      }
    }
  ]
  ```

`POST /posts/{post_id}/comments/{comment_id}/replies/`

#### **Description**

Adds a new reply to a specific comment. If the post is private, the user must be a follower of the post’s owner.

#### **Request Method**

`POST`

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Request Body**

```json
{
  "content": "This is a new reply."
}
```

#### **Response**

**On Success**

- **Status Code:** `200 OK`
- **Response Example:**

```json
{
  "detail": "Reply added successfully.",
  "total_replies": 5,
  "reply": {
    "id": 23,
    "content": "This is a new reply.",
    "created_at": "2025-01-12T18:00:00Z",
    "updated_at": "2025-01-12T18:00:00Z",
    "user": {
      "id": 42,
      "username": "john_doe"
    },
    "comments": {
      "id": 12,
      "content": "Original comment content"
    }
  }
}
```

**On Failure**

1. User not authenticated:

- **Status Code:** `401 Unauthorized`
- **Response Example:**

```json
{
  "detail": "Authentication credentials were not provided."
}
```

2. Invalid content:
   - **Status Code:** `400 Bad Request`
   - **Response Example:**

```json
{
  "content": ["This field is required."]
}
```

`DELETE /posts/{post_id}/comments/{comment_id}/replies/{reply_id}/`

#### **Description**

Deletes a specific reply under a comment. This action will decrement the total_replies count for the comment.

#### **Request Method**

`DELETE`

#### **Request Headers**

| Header          | Value            | Required | Description                        |
| --------------- | ---------------- | -------- | ---------------------------------- |
| `Authorization` | `Bearer <token>` | Yes      | The token for user authentication. |

#### **Response**

**On Success**

- **Status Code:** `204 No Content`

**On Failure**

1. Reply not found:

- **Status Code:** `404 Not Found`
- **Response Example:**

```json
{
  "detail": "Not found."
}
```

---

---
