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

Deployment: Vercel serves the CRA build from `Client/build` and runs the Express app from `Server/` as a
serverless function at `/api` (see `vercel.json` and `api/index.js`). Set `MONGODB_URI` in the Vercel project.
