# Lender Banking System

A Node.js and MongoDB REST API for managing users, bank accounts, account balances, and ledger-backed money transfers. The project demonstrates core digital banking concepts such as JWT authentication, HTTP-only cookies, role-based system authorization, idempotent transactions, double-entry ledger records, and transaction email notifications.

## Overview

The Lender Banking System exposes an Express API with three primary resource areas:

- **Authentication**: user registration and login with bcrypt password hashing and JWT sessions.
- **Accounts**: creation and retrieval of a user's active INR account and ledger-derived balance.
- **Transactions**: transfers between accounts and system-funded initial transactions.

Account balances are not stored as a mutable field. They are calculated from immutable ledger entries:

- A `CREDIT` entry increases an account balance.
- A `DEBIT` entry decreases an account balance.
- The balance is calculated as total credits minus total debits.

## Technology Stack

- **Runtime**: Node.js
- **Web framework**: Express 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Password security**: bcryptjs
- **Email delivery**: Nodemailer with Gmail SMTP
- **Middleware**: CORS, cookie-parser, dotenv
- **Development tooling**: Nodemon

## Project Structure

```text
Ledger-Banking-System/
├── server.js                         # Application entry point
├── package.json                       # Dependencies and npm scripts
├── .gitignore                         # Ignores .env and node_modules
└── src/
    ├── app.js                         # Express app and route mounting
    ├── config/
    │   ├── db.js                      # MongoDB connection
    │   └── emailTemplate.js            # Registration email template
    ├── contollers/                    # Request handlers
    │   ├── account.controller.js
    │   ├── auth.controller.js
    │   └── transaction.controller.js
    ├── middleware/
    │   └── auth.middleware.js          # JWT and system-user guards
    ├── models/                        # Mongoose schemas
    │   ├── account.model.js
    │   ├── blackList.model.js
    │   ├── ledger.model.js
    │   ├── transaction.model.js
    │   └── user.model.js
    ├── routes/                        # API route definitions
    │   ├── account.routes.js
    │   ├── auth.routes.js
    │   └── transaction.routes.js
    └── utils/
        └── emailService.js             # Email transport and notifications
```

> The existing `contollers` directory name is part of the current import paths and should not be renamed without updating those imports.

## Requirements

Install the following before running the service:

- Node.js 18 or newer
- npm
- MongoDB, either locally or through MongoDB Atlas
- A Gmail account configured for SMTP, if email notifications are required

## Installation

```bash
git clone https://github.com/prakash-kumar592/Lender-Banking-System.git
cd Lender-Banking-System
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/
JWT_SECRET=replace-with-a-long-random-secret
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
```

The database connector appends `seventh` to `MONGODB_URI`. With the example above, the application connects to the `seventh` database. When using MongoDB Atlas, provide the connection string in a form that supports this suffix, or update `src/config/db.js` to select the database explicitly.

For Gmail, use a Google App Password rather than the normal account password. Keep `.env` private; it is excluded by `.gitignore`.

## Running the Application

Start the development server with automatic restarts:

```bash
npm run dev
```

The default server address is:

```text
http://localhost:5000
```

Start the API directly with Node.js:

```bash
node server.js
```

A successful startup connects to MongoDB and listens on the configured port. The health-style root response is:

```http
GET /
```

```text
Welcome to the Banking System API
```

## Authentication Model

Registration and login issue a JWT with a three-day expiration. The token is written to an HTTP-only cookie named `token`.

The protected middleware also accepts a bearer token:

```http
Authorization: Bearer <jwt-token>
```

For browser clients using cookie authentication, send requests with credentials enabled. For example, with `fetch`:

```js
fetch('http://localhost:5000/api/account', {
  credentials: 'include'
});
```

The authentication middleware verifies the JWT, checks the token blacklist, loads the user, and attaches the user to `req.user`. The system authorization middleware additionally requires `user.systemUser === true`.

## API Reference

All request bodies must be JSON:

```http
Content-Type: application/json
```

### Authentication Endpoints

#### Register a user

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "strong-password"
}
```

Success response: `201 Created`

```json
{
  "user": {
    "_id": "USER_ID",
    "email": "aarav@example.com",
    "name": "Aarav Sharma"
  },
  "status": "success"
}
```

The password must be at least six characters. Passwords are hashed before storage. A welcome email is sent after registration.

#### Log in

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "aarav@example.com",
  "password": "strong-password"
}
```

Success response: `200 OK`, with a new HTTP-only `token` cookie.

#### Log out

A logout controller exists and blacklists the current token, but no logout route is currently mounted in `src/routes/auth.routes.js`. To expose it, add a route such as:

```js
router.post('/logout', authController.logoutController);
```

### Account Endpoints

All account endpoints require authentication.

#### Create an account

```http
POST /api/account
```

No request body is required. A new account is created for the authenticated user with:

- `status`: `ACTIVE`
- `currency`: `INR`

Success response: `201 Created`

#### Get the current user's active account

```http
GET /api/account
```

Success response: `200 OK` with the active account. If no active account exists, the API returns `404 Not Found`.

#### Get account balance

```http
GET /api/account/balance/:accountId
```

Success response:

```json
{
  "balance": 12500,
  "status": "success"
}
```

The balance is derived from the ledger rather than read from a stored account balance field.

### Transaction Endpoints

#### Transfer funds between accounts

```http
POST /api/transaction
```

Request:

```json
{
  "fromAccount": "SENDER_ACCOUNT_ID",
  "toAccount": "RECEIVER_ACCOUNT_ID",
  "amount": 2500,
  "idempotencyKey": "transfer-2026-0001"
}
```

The `idempotencyKey` is unique and is intended to prevent duplicate processing when a client retries the same request. A successful transfer creates:

1. One `DEBIT` ledger entry for the sender.
2. One `CREDIT` ledger entry for the receiver.
3. One `COMPLETED` transaction record.
4. Email notifications for both parties.

The endpoint requires both accounts to be active and the sender to have sufficient ledger-derived balance.

#### Add an initial system fund

```http
POST /api/transaction/system/initial-fund
```

Request:

```json
{
  "toAccount": "CUSTOMER_ACCOUNT_ID",
  "amount": 10000,
  "idempotencyKey": "initial-fund-2026-0001"
}
```

This endpoint requires a JWT belonging to a system user. It creates a debit from the system account and a credit to the target account.

## Data Model

### User

Stores a user's name, unique email address, bcrypt-hashed password, and immutable `systemUser` flag. Passwords are excluded from normal queries.

### Account

Belongs to a user and contains an account status and currency. Supported statuses are `ACTIVE`, `CLOSED`, and `FROZEN`. The default currency is INR.

### Transaction

Records the source account, destination account, amount, status, and unique idempotency key. Supported statuses are `PENDING`, `COMPLETED`, `FAILED`, and `REVERSED`.

### Ledger

Represents an immutable accounting entry connected to an account and transaction. Ledger update and delete middleware prevents modification or deletion of existing entries.

### Blacklisted Token

Stores logged-out JWTs. A TTL index is intended to remove blacklist records after seven days.

## Transaction and Accounting Concepts

- **Double-entry bookkeeping**: every transfer should produce equal-value debit and credit entries.
- **Ledger of record**: immutable ledger entries provide the audit trail for account balances.
- **Idempotency**: a unique request key allows retries to return the existing transaction instead of creating another one.
- **Atomicity**: transfers are intended to use a MongoDB session and transaction so ledger writes commit together.
- **Authorization**: normal users can access their protected account operations; system-only operations require the `systemUser` flag.
- **Token revocation**: logout stores the JWT in a blacklist so it cannot be reused before expiration.

## Example cURL Flow

Register and save the authentication cookie:

```bash
curl -i -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Sharma","email":"aarav@example.com","password":"strong-password"}'
```

Create an account using the saved cookie:

```bash
curl -i -b cookies.txt -X POST http://localhost:5000/api/account
```

Read the current active account:

```bash
curl -i -b cookies.txt http://localhost:5000/api/account
```

## Security Considerations

Before using this API beyond local development:

- Use a long, randomly generated `JWT_SECRET`.
- Use HTTPS so authentication cookies and credentials are encrypted in transit.
- Configure a specific CORS origin instead of `origin: '*'`.
- Add secure cookie settings such as `secure` and an appropriate `sameSite` policy.
- Validate that the authenticated user owns the `fromAccount` used for a transfer.
- Add request validation, rate limiting, structured logging, and centralized error handling.
- Never commit `.env`, passwords, Gmail credentials, or database credentials.
- Use MongoDB replica-set support when relying on multi-document transactions.

## Known Implementation Limitations

The current source is an early banking-system prototype. The following items should be addressed before production deployment:

- `GET /api/account/balance/:accountId` calls `findByOne`, while Mongoose provides `findOne`.
- The regular transfer controller calls `fromAccount.getBalance()` although the loaded variable is named `fromAccountExists`.
- Some transaction writes call `mongoose.create`; ledger writes should use `ledgerModel.create`.
- Email notification calls use `transactionEmail`, while the email service exports `sendTransactionEmail`.
- The system-account lookup uses a `systemUser` field on the account query even though that field belongs to the user model.
- The system transaction creation path should consistently use an array with `Model.create` when a session is supplied and should verify populated user data safely.
- The auth routes do not currently expose the existing logout controller.
- There are no automated tests yet; `npm test` intentionally exits with “no test specified”.

## Development Practices

When extending the service, preserve these boundaries:

- Keep HTTP request handling in controllers and route registration in `src/routes`.
- Keep authorization checks in middleware.
- Keep persistence rules in Mongoose models.
- Treat ledger entries as append-only accounting records.
- Require an idempotency key for every money movement.
- Add endpoint tests for authentication, authorization, insufficient funds, duplicate requests, and atomic rollback behavior.

## License

This project currently uses the ISC license value declared in `package.json`.
