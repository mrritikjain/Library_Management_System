# Full-Stack Web Development Interview Cheat Sheet

This document compiles the core concepts, terminologies, and design choices used in this Library Management System. Use this sheet to prepare for interviews and understand exactly *why* and *how* the codebase works.

---

## 1. Software Development Flow & Architecture

### Why build the Backend before the Frontend?
*   **Separation of Concerns:** The backend holds the business logic, security, and database access. Building it first establishes a single source of truth.
*   **API-First Design:** By defining and testing API endpoints (e.g., in Postman) beforehand, you ensure the server works correctly in isolation. Once the APIs are ready, the frontend's job is simply to display data and call these APIs.
*   **Parallel Development:** In teams, once backend APIs are defined (often documented with Swagger/OpenAPI), frontend developers can mock the backend responses and build the UI simultaneously.

---

## 2. Node.js & Express.js (Backend Core)

### What is Node.js?
Node.js is a **runtime environment** that allows you to run JavaScript on the server (outside of a web browser). It uses an asynchronous, event-driven, single-threaded model which makes it highly scalable for I/O-heavy applications.

### What is Express.js?
Express is a lightweight **web application framework** built on top of Node.js. It simplifies handling HTTP requests, creating routing rules, and using middleware.

### Key Express Concepts:
1.  **Request (`req`) & Response (`res`):**
    *   `req` contains information sent by the client (headers, URL parameters, query parameters, request body).
    *   `res` is the object used to send data back to the client (status codes, JSON payloads, HTML).
2.  **Routing:** Mapping URL paths (e.g., `/api/auth/login`) and HTTP methods (GET, POST, PUT, DELETE) to specific functions that execute when a request arrives.
3.  **Middleware:** Functions that execute sequentially during the request-response cycle. They have access to `req`, `res`, and the `next` function.
    *   *Built-in middleware:* `express.json()` parses incoming JSON request bodies.
    *   *Third-party middleware:* `cors()` enables Cross-Origin Resource Sharing.
    *   *Custom middleware:* `authMiddleware` intercepts requests to verify a JWT before letting the request reach a protected route.

### Why Dotenv must be loaded at the very beginning of the app entry point?
*   **Initialization Lifecycle:** In Node.js, `process.env` is an object that holds environment configuration. By default, it only has system-level properties.
*   **Dotenv's Job:** Calling `require("dotenv").config()` reads the physical `.env` file and merges those key-value pairs into the global `process.env` object.
*   **The Trap:** If you import a module that connects to the database (e.g. `mongoose.connect(process.env.MONGO_URI)`) *before* calling `dotenv.config()`, `process.env.MONGO_URI` will be `undefined`, causing the server to crash immediately. Hence, `dotenv.config()` must be the very first line executed in your server's entry point (`index.js`).

---

## 3. MongoDB & Mongoose (Database Layer)

### SQL vs. NoSQL (MongoDB)
*   **SQL (Relational):** Data is stored in tables with fixed columns and rows. Good for complex relations.
*   **NoSQL (Document-based MongoDB):** Data is stored in flexible, JSON-like documents. It is highly scalable and matches JavaScript objects naturally, making it perfect for rapid development in Node.js.

### What is Mongoose?
Mongoose is an **Object Data Modeling (ODM)** library for MongoDB and Node.js. Since MongoDB is schemaless by default, Mongoose allows us to define schemas (structures) for our documents and provides built-in validation, type casting, and query helpers.

### Key Mongoose Terms:
*   **Schema:** The blueprint defining what fields a document can have, their types (String, Number, Date), and constraints (required, unique, default values).
*   **Model:** A wrapper around the Schema. The Model provides the interface to query the database (e.g., `Library.findOne()`, `Library.create()`).

### MongoDB Atlas connection URI (`mongodb+srv://`) & Mongoose Promises
*   **SRV Record Protocol:** The standard connection prefix `mongodb://` specifies a single hostname. The prefix `mongodb+srv://` specifies a Connection String that queries DNS SRV records. This is critical for Atlas because it connects to a replica set (a group of redundant database nodes). If one node crashes, the DNS points you to the healthy node automatically without needing to change your code.
*   **Why does `mongoose.connect()` use `.then()` and `.catch()`?**
    *   **Asynchronous Action:** Establishing a TCP connection over the internet to MongoDB Atlas is a network request. It takes time.
    *   **Non-Blocking:** If Node.js waited synchronously for the database to connect, the server would freeze and block other incoming user requests.
    *   **Promises:** Mongoose returns a Promise representing the database connection lifecycle. We use `.then()` for success handling (e.g., logging connection success) and `.catch()` for error handling (e.g., database connection failure).

---

## 4. Security & Cryptography

### Why hash passwords? (Bcrypt)
*   **Security Hazard:** Storing plain-text passwords in a database is a massive security risk. If the database is compromised, hacker's gain access to all user accounts.
*   **Hashing vs. Encryption:**
    *   *Encryption* is a two-way function (data can be decrypted back to plain text using a key).
    *   *Hashing* is a one-way cryptographic function. Once a password is hashed, it cannot be reversed. When logging in, the server hashes the input password and compares the result to the stored hash.
*   **Salt:** A random string added to the password before hashing. This ensures that if two users have the same password (e.g., "password123"), their stored hashes will look completely different, preventing **Rainbow Table attacks** (pre-calculated tables of common hashes).
*   **Bcrypt:** A standard hashing algorithm that incorporates salt and is designed to be computationally slow (using a "work factor" or "rounds"), protecting against brute-force attacks.

---

## 5. Authentication (AuthN) vs. Authorization (AuthZ)

*   **Authentication (AuthN):** Verifying **who** a user is (e.g., verifying their email and password during Login).
*   **Authorization (AuthZ):** Verifying **what** an authenticated user is allowed to do (e.g., checking if they have permission to view `/dashboard` or edit a specific library record).

---

## 6. JWT (JSON Web Token) Deep Dive

### What is a JWT?
A JSON Web Token is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.

### JWT Structure (Three Parts separated by dots `.`):
1.  **Header:** Specifies the algorithm used to sign the token (e.g., HS256) and the token type (JWT).
2.  **Payload:** Contains the claims (the actual data, such as `userId` or `email`, and expiration time `exp`). *Never put passwords or sensitive data here because the payload is only base64-encoded, not encrypted!*
3.  **Signature:** Created by signing the encoded Header and Payload with a secret key known only to the server. This ensures the token cannot be tampered with.

```
JWT = Base64(Header) + "." + Base64(Payload) + "." + Signature(Header, Payload, Secret)
```

### JWT Storage: Memory vs. LocalStorage vs. Cookies
This is a standard senior developer interview question! Here is the breakdown:

| Storage Type | Read/Write Access | XSS Vulnerability | CSRF Vulnerability | Persistence on Refresh |
| :--- | :--- | :--- | :--- | :--- |
| **LocalStorage** | High (Any JS script can read/write) | **High** (Malicious scripts can steal the token) | Low (CSRF doesn't automatically attach localStorage) | Yes |
| **In-Memory (React State)** | Low (JS code variables, not persistent) | **Low** (Hard to exploit since variables are isolated inside React context) | Low | **No** (Token is cleared on page refresh) |
| **HttpOnly Cookies** | None (JavaScript cannot read the cookie) | **None** (Immune to XSS token theft) | **High** (Browsers send cookies automatically on all requests) | Yes |

*   **XSS (Cross-Site Scripting):** A vulnerability where an attacker injects malicious JavaScript into your site. If your JWT is in `localStorage`, the attacker can run `localStorage.getItem("token")` and send it to their server.
*   **CSRF (Cross-Site Request Forgery):** An attack where an unauthorized website sends a request to your server, and the browser automatically attaches cookies. (Mitigated using `SameSite=Strict`, `Secure` flags, or CSRF double-submit tokens).
*   **Our Choice (In-Memory JWT):** We store the token in a React State (`AuthContext`). It is highly secure against XSS. However, on page refresh, the state resets and the user must log in again. In production, we solve this by having the backend issue a **Refresh Token** inside a secure `HttpOnly` cookie, and a short-lived **Access Token** in memory.

---

## 7. Cross-Origin Resource Sharing (CORS)

### What is CORS?
CORS is a security mechanism implemented by web browsers. By default, browsers prevent client-side JavaScript (e.g., running on `http://localhost:5173`) from making requests to a different domain/port (e.g., `http://localhost:5000`) unless the server explicitly sends HTTP headers allowing it.

### How do we solve it?
We use the `cors` package in Express:
```javascript
app.use(cors({
  origin: "http://localhost:5173", // Allow requests from our React app
  credentials: true // Allow sending cookies/authorization headers
}));
```
This tells the browser that requests from the React app are safe and should not be blocked.

---

## 8. Validation: Client-Side vs. Server-Side

*   **Client-Side Validation (React):**
    *   *Purpose:* User Experience (UX). It alerts the user immediately if they entered an invalid email format, left a field empty, or typed a negative number, without waiting for a slow network request.
    *   *Security:* **Zero**. Anyone can bypass frontend validation by making API calls directly using tools like Curl or Postman.
*   **Server-Side Validation (Express + Joi):**
    *   *Purpose:* Security and Data Integrity. It is the final gatekeeper. It validates the request format before talking to the database. If validation fails, it aborts the request and returns a `400 Bad Request` error.
    *   **Rule:** **Never trust client-side data.** Server-side validation is mandatory.

### Form Validation: `react-hook-form` vs Standard Component State (`useState`)
*   **Performance (Re-renders):** 
    *   *Standard State:* Every keypress in a controlled input triggers a component state update, which causes the entire form (and all child components) to re-render.
    *   *React Hook Form:* Uses **uncontrolled inputs** behind the scenes. It hooks directly into the input's DOM references. The form component only re-renders when validation errors change or upon submission, resulting in significantly higher rendering performance.
*   **Ease of Validation Rules:** Rather than writing complex custom conditional validation statements for every input field, `react-hook-form` allows you to register validation rules directly into the hook register function (e.g., `required`, `minLength`, `pattern` for emails) and handles printing errors cleanly.

---

## 9. React Context API & React Router (v7)

### Why React Context for Authentication?
*   Without Context, you would have to pass the user state and login/logout functions down through every component (prop drilling).
*   Context allows us to define a global `AuthContext` containing the in-memory token and user data. Any component (Login, Register, Navbar, Dashboard) can consume this context to know if the user is authenticated.

### React Router Protected Routes
To secure pages like `/dashboard`, we create a wrapper component `ProtectedRoute`. It checks the `AuthContext` to see if a token exists:
*   If **yes**, it renders the dashboard.
*   If **no**, it redirects the user to the login page (`/`). This prevents unauthenticated users from seeing pages they shouldn't access.
