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

Let me know when you’re ready for the next one!
