# User Management Portal — Backend

This repository contains the backend for the User Management Portal. It is an Express.js server using Sequelize (sqlite3 by default), JWT authentication, and serves OpenAPI documentation via Swagger UI. It also exposes a protobuf export endpoint for user data.

This repository contains the backend for the User Management Portal. It's an Express.js server using Sequelize (sqlite3 by default), JWT authentication, Swagger UI for OpenAPI docs, and a Protobuf export endpoint for user data.

IMPORTANT: This project stores multiple representations of user email addresses for security and export needs:

- `email` (string): SHA-384 hex digest of the normalized email; used as the canonical unique identifier and as the message digest for signatures.
- `ogEmail` (string): original plaintext email (stored as-is). Present for backward compatibility / export needs. Be careful: this reduces privacy.
- `emailSignature` (string): base64 RSA signature of the `email` digest (signed with server private key).

If you prefer not to store plaintext emails (`ogEmail`) keep `ogEmail` null and rely on `emailEncrypted` instead.

## Features

- REST endpoints for users and auth (login)
- JWT-based authentication (Authorization: Bearer <token>)
- Admin-protected user creation endpoint
- Swagger UI at `/api-docs` (auto-merged JSON specs from `swagger/`)
- Protobuf export endpoint: `/api/users/export` (application/x-protobuf)

## Requirements

- Node.js 18+ (ESM support)
- npm

## Quick start

1. Install dependencies

```bash
npm install
```

2. Copy environment variables

```bash
cp .env.example .env
# Edit .env to set values like PORT and JWT_SECRET
```

3. Seed an admin user (optional)

```bash
npm run seed
```

4. Start the server

```bash
# production
npm start

# development (auto-restart)
npm run dev
```

By default the server reads `PORT` from `.env` (fallback 3000). After start you should see `Server running on port <PORT>`.

## Scripts

- `npm start` — start node server
- `npm run dev` — start with nodemon
- `npm run lint` — run eslint
- `npm run seed` — seed admin user

## Endpoints (overview)

- POST /api/auth/login — authenticate and receive a token
- GET /api/users — list users (protected)
- POST /api/users — create user (protected, admin only)
- GET /api/users/export — export users as protobuf (protected)
- GET /api/users/:id — get single user (protected)
- PUT /api/users/:id — update user (protected)
- DELETE /api/users/:id — delete user (protected)
- GET /api/users/public-key — returns server public key PEM for signature verification
- POST /api/users/verify-signature — verify a signature server-side (accepts raw email or emailHash)

## Authentication & token usage

- The login endpoint returns a JSON object with a `token` field,

```json
{
  "token": "<jwt>"
}
```

- Use the token in the `Authorization` header for protected requests:

```
Authorization: Bearer <token>
```

## Swagger / OpenAPI

- API docs are served at: `/api-docs`
- The server merges JSON files from the `swagger/` folder. Files included by default in this project:
  - `swagger/security.json` (defines bearerAuth)
  - `swagger/auth.json` (login operations)
  - `swagger/user.json` (user operations)

How to authorize in Swagger UI:

1. Open `/api-docs` in the browser.
2. Click `Authorize` and paste your JWT token. Use the prefix `Bearer ` if the UI doesn't add it automatically.
3. After authorization, protected endpoints will send the Authorization header.

## Protobuf export

- The endpoint `/api/users/export` returns `application/x-protobuf` and includes plaintext `ogEmail`, hashed `email`, and `emailSignature`. The proto file is located at `src/protos/user.proto` and is also exposed by the server.
- The `User` proto now contains fields: `id`, `name`, `email` (hash), `ogEmail` (plaintext), `role`, `status`, `emailSignature`, and `createdAt` (ISO string).

Client verification flow (recommended):

1. Fetch the public key: `GET /api/users/public-key` (returns PEM).
2. Decode the protobuf export or read `ogEmail` and `emailSignature` directly if you parse JSON.
3. Compute the SHA-384 digest of the normalized email (lowercased + trimmed) or use the server-provided `email` field (hex digest).
4. Verify the RSA signature over the digest bytes using RSASSA-PKCS1-v1_5 with SHA-384.

See `src/utils/crypto.js` for the exact hashing and signing algorithm used by the server.

## Data model notes

- `email` (string): SHA-384 hex digest of normalized email (used for uniqueness and signing)
- `emailEncrypted` (text): AES-256-GCM encrypted plaintext email
- `ogEmail` (string): plaintext original email
- `emailSignature` (string): base64-encoded RSA signature of the `email` digest

## Security and key management

- The server stores an RSA key pair in `keys/private.pem` and `keys/public.pem` (generated automatically if missing). These are used to sign/verify email digests.
- The server also stores a symmetric AES key for email encryption at `keys/email.key` (generated automatically). This key decrypts `emailEncrypted` and must be treated as a secret.

Recommendations:

- For production, store keys in a secure secrets manager (KMS, Vault) instead of files on disk.
- Limit access to endpoints that return plaintext `ogEmail` (admin-only) and log exports.
- Back up `keys/email.key` — losing it prevents decryption of stored `emailEncrypted`.

## Database migrations

- This project uses Sequelize. If you run migrations manually, add a migration to create `ogEmail` and `emailEncrypted` columns (they are present in the model but not automatically migrated).

## Testing / verification examples

1. Create user

POST `/api/users` (admin) body:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

Response: contains `emailHash` (SHA-384 hex) and `emailSignature`. The `ogEmail` will be stored in DB for exports.

2. Export users

GET `/api/users/export` — returns protobuf with `ogEmail` included. Use `src/protos/user.proto` to decode on the client.

3. Verify signature client-side

See the frontend verification guide in this README (or use the server `POST /api/users/verify-signature` endpoint as fallback).

## Troubleshooting

- If export fails: make sure `src/protos/user.proto` matches the actual payload shape.
- If you cannot decrypt `emailEncrypted`, check `keys/email.key` exists and has correct permissions.
- If login fails despite correct credentials: ensure the login email is normalized (lowercase + trimmed) — the server hashes the normalized email before lookup.

## Development

- Lint: `npm run lint`
- Dev server: `npm run dev`

## Contributing

- Open a PR with tests or a clear explanation of fixes. Keep API changes backward-compatible where possible.

---

If you'd like, I can:

- Add example curl/Postman collections for each endpoint
- Add a migration and a small backfill script to populate `ogEmail`/`emailEncrypted` for existing users (if you have the plaintext emails somewhere)
- Add a React example that downloads the protobuf export and verifies signatures client-side
