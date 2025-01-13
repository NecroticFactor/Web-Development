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
