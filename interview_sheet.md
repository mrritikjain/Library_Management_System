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

### CommonJS (`require`) vs. ES Modules (`import/export`)
*   **CommonJS (CJS):** 
    *   The traditional Node.js module system. Uses `require()` and `module.exports`.
    *   Modules are loaded **synchronously** (one after another).
    *   File extensions are optional (e.g. `require('./db')`).
*   **ES Modules (ESM):**
    *   The modern, standardized JavaScript module system. Activated in Node.js by setting `"type": "module"` in `package.json`.
    *   Uses `import` and `export default` / `export const` syntax.
    *   Modules can be parsed **asynchronously**, leading to better startup performance.
    *   **ESM Rule:** You *must* specify file extensions for local relative imports (e.g., `import connectDB from "./db.js"`). If you omit `.js`, Node will throw a `module not found` error.

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

---

## 10. Common Full-Stack Integration Bugs (For Interview & Debugging)

### Destructuring and Import mismatch (CommonJS Trap)
*   **The Bug:** Writing `const { default: connectDB } = require("./db.js")` when the file exported `module.exports = connectDB;`.
*   **Why it fails:** Destructuring `{ default }` is only needed when importing ES Modules that were converted to CommonJS by a compiler (like Babel/Webpack). For normal Node.js CommonJS files, `require()` directly returns the exported value. Destructuring it will result in `undefined`, leading to runtime crashes like `connectDB is not a function`.

### Casing Mismatches across the Stack
*   **The Bug:** Using `"OName"` on the frontend form, destructuring `Oname` (lowercase `n`) on the backend controller, and saving to `Oname` in the schema.
*   **Why it fails:** JavaScript is strictly **case-sensitive**. When the frontend sends `OName`, `req.body.Oname` is `undefined`. Accessing properties or calling methods (like `.trim()`) on it causes a fatal runtime crash (`TypeError: Cannot read properties of undefined (reading 'trim')`), throwing a generic `500 Internal Server Error` to the client.
*   **Best Practice:** Always define and document a strict casing standard (usually `camelCase` e.g., `ownerName`, `libraryName`) across your database schemas, server endpoints, and frontend forms.

---

## 11. Core Full-Stack Interview Questions & Answers

### Q1: What is the difference between `<Link>` and `<NavLink>` in React Router?
*   **Link:** Renders a standard anchor tag (`<a>`) that intercepts browser navigation and updates the history state without refreshing the page.
*   **NavLink:** A wrapper around `<Link>` that knows whether the link's path matches the current active URL. It exposes an `isActive` boolean or class callback, which is ideal for dynamically highlighting active tabs in a Sidebar or Navigation menu.

### Q2: Why is the `withCredentials: true` option required in Axios/Fetch requests?
*   **Default Behavior:** By default, browsers do not send cross-origin cookies or authorization headers (like `Cookie` headers) with AJAX requests for security reasons.
*   **The Option:** Setting `withCredentials: true` tells Axios to include credentials (cookies, basic auth headers, SSL certificates) in the request. Without it, your server won't receive the JWT cookie from the client, causing endpoints like `/userDetails` to return `401 Unauthorized`.

### Q3: What is a Shared Layout in React Router (v6/v7) and why use it?
*   **What it is:** A layout route wrapper that renders shared visual components (such as a header and sidebar) alongside a nested `<Outlet />` containing the child view.
*   **Why use it:** 
    1.  **DRY (Don't Repeat Yourself) Code:** Prevents you from importing and rendering the `<Sidebar>` and `<Topbar>` components manually on every single page.
    2.  **Performance:** Keeps the Sidebar and Topbar mounted between page transitions. The browser only updates and re-renders the children inside the `<Outlet />`, saving rendering cycles.
    3.  **State Persistence:** Shared states (like toggle state of sidebar or user details) remain intact instead of getting reset when changing pages.

### Q4: How does cookie-based authentication prevent XSS, and how do we protect against CSRF?
*   **XSS Protection:** By setting the `httpOnly: true` flag when the server issues a cookie, you instruct the browser that client-side JavaScript (like `document.cookie`) cannot read the cookie. This makes it impossible for attackers executing a Cross-Site Scripting (XSS) script to steal the JWT token.
*   **CSRF Protection:** Since browsers automatically attach cookies to cross-origin requests, hackers can trick users into triggering requests to your backend (Cross-Site Request Forgery). We mitigate this by:
    1.  Setting `sameSite: "Lax"` or `"Strict"` on the cookie so it is not sent on third-party site requests.
    2.  Using custom CSRF tokens or custom request headers (like `X-Requested-With`) that cannot be set automatically by standard HTML forms.

### Q5: Why is server-side validation mandatory even if client-side validation is implemented?
*   Client-side validation (e.g., using `react-hook-form` or HTML validation) is purely for User Experience (UX), providing instant feedback.
*   It is incredibly easy for an attacker to bypass client-side validation by using APIs directly via Postman, curl, or changing the local code.
*   Server-side validation is the absolute security boundary protecting your database from corrupted, malicious, or malformed data.

---

## 12. Interview Tips & Best Practices

1.  **Explain the Flow Systematically:**
    When asked how you built a feature, walk the interviewer through the data flow:
    `Database Schema (Mongoose)` ➔ `Controller Business Logic (Express)` ➔ `Router Endpoints` ➔ `Authentication Middleware` ➔ `Axios Client Request` ➔ `React State/Context Render`.
2.  **Highlight Security Tradeoffs:**
    Discussing the pros and cons of local storage vs HttpOnly cookies shows seniority. Be ready to explain XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery) and how you mitigated them.
3.  **Emphasize Performance and clean architecture:**
    Mentioning how you structured layout routes to avoid re-rendering common layouts or using `react-hook-form` to avoid form keypress re-renders demonstrates that you think about performance.
4.  **Know Your Database:**
    Be prepared to explain when to use indexing (e.g., indexing the `email` field in the User schema with `unique: true` to optimize lookup speed) and the difference between SQL relations and NoSQL document nesting.

---

## 13. MongoDB Schema Pitfalls & Best Practices (Mongoose)

### 1. The Duplicate Key Trap in Object Literals
*   **The Problem:** In JavaScript, defining duplicate keys in a single object literal results in the later definitions silently overwriting the earlier ones.
    *   *Incorrect Example:*
        ```javascript
        const SeatSchema = new mongoose.Schema({
          morning: { type: Boolean, default: false },
          studentId: { type: ObjectId, ref: 'Student' },
          evening: { type: Boolean, default: false },
          studentId: { type: ObjectId, ref: 'Student' } // Overwrites previous 'studentId'!
        });
        ```
    *   *Result:* Only **one** `studentId` field is created at the root level of the schema.
*   **The Interview Answer:** Explain that when structuring schemas containing shift-specific metadata, you should nest attributes under separate sub-objects (e.g., `morning.studentId` and `evening.studentId`). This prevents naming collisions and preserves correct logical grouping.

### 2. Spelling Traps: `require` vs `required`
*   **The Trap:** In Mongoose, the valid validator key is `required: true` (past tense). Setting `require: true` (present tense) is syntactically ignored by Mongoose.
*   **Why it's dangerous:** No syntax error is thrown during schema initialization, but Mongoose will silently fail to enforce validation, allowing records to save with missing fields in the database.
*   **Interview Tip:** Always double-check validation keywords. Mentioning this trap shows you have hands-on debugging experience and pay close attention to runtime behaviors.

### 3. Multi-Tenant Scoping & Security Boundaries
*   **The Concept:** In shared library apps, data must be isolated by tenant (e.g. `libraryOwner` / `createdBy`).
*   **Best Practice:**
    1.  Always index the tenant field (`libraryOwner`) on document schemas to optimize queries.
    2.  In controllers, query using both the record ID and the tenant ID:
        ```javascript
        const seat = await Seat.findOne({ _id: seatId, createdBy: req.userID });
        ```
    3.  This prevents **Insecure Direct Object Reference (IDOR)** vulnerabilities where an attacker edits another user's resources by guessing or modifying a URL parameter.

