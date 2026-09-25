# Rent & Roll

---

A project that has 3 types of users who can use the webapp to book cars on hourly basis.
The types of users are:

- A normal user,
- A subscription based user, and
- an admin

The admin channel can

- add cars
- change cars' details

A subscription user

- Gets a 40% discount on each booking

A user can

- Book a car based on it's availability

An anonymous user can

- Surf the entire site, view cars; but cannot book or view profile or bookings page

The users can search any bookings with the dynamic search bar.

---

HOW TO RUN:

1.  Clone this repository in your local folder

```
git clone "https://github.com/darshpandya02/Rent-Roll".
```

2.  open terminal and cd into Client folder

```
cd Client
```

3.  install all dependencies

```
npm i
```

4.  run the Client

```
npm start
```

5.  open another terminal, cd into server directory

```
cd Server
```

6.  install all dependencies

```
npm i
```

7.  run npm init for a package-json

```
npm init
```

8.  install nodemon

```
npm i nodemon
```

8.  run server

```
nodemon
```

Further notes -

Create a .env file in server and client to store secret keys and strings

Live Demo - https://rent-and-roll.vercel.app

Demo accounts (also shown on the login page):

| Role | Email | Password |
| --- | --- | --- |
| User | demo@rentroll.app | demo1234 |
| Subscriber (40% off) | subscriber@rentroll.app | demo1234 |
| Admin | admin@rentroll.app | admin1234 |

Payments are mocked in the demo; no card is charged. The contact form does not send email.

## Authentication

- **Google sign-in (OAuth 2.0 / OpenID Connect).** Authorization code flow with PKCE (S256), a `state` parameter
  against CSRF, and an OIDC `nonce` checked inside the ID token. The ID token signature, audience and
  `email_verified` claim are verified with `google-auth-library`. State, nonce and the PKCE verifier travel in a
  signed, httpOnly, 10 minute cookie, so no session store is needed on serverless. A Google account is matched on its
  stable `sub`, then linked to an existing account with the same verified email, otherwise a new account is created.
  The session token is handed back in the URL fragment so it never appears in server logs.
- **Email and password.** Passwords are hashed with bcrypt and never returned by the API. Accounts created before
  hashing was added are re-hashed on their next successful login. Unknown emails are compared against a dummy hash
  so response time does not reveal which accounts exist.
- **Sessions and authorization.** The API issues 2 hour HS256 JWTs. Booking, profile and user routes require a
  session, fleet changes and the user list require an admin, users can only read or edit their own profile, and a
  booking is always recorded against the signed-in user rather than whatever the client sends.

Configuration (Vercel project or `Server/.env`):

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing sessions (required in production) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client from Google Cloud Console. The Google button is hidden until both are set |
| `APP_URL` | Public origin, e.g. `https://rent-and-roll.vercel.app`. The OAuth redirect URI is `APP_URL/api/auth/google/callback` |

Tests: `cd Server && npm test` runs 13 integration tests against an in-memory MongoDB, covering hashing, the
legacy password upgrade, route authorization, booking ownership, and the Google callback (PKCE, state, nonce,
unverified email and account linking), with only Google's token endpoint stubbed.

Deployment: Vercel serves the CRA build from `Client/build` and runs the Express app from `Server/` as a
serverless function at `/api` (see `vercel.json` and `api/index.js`). Set `MONGODB_URI` in the Vercel project.
