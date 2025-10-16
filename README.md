# User Management Portal — Backend

This repository contains the backend for the User Management Portal. It is an Express.js server using Sequelize (sqlite3 by default), JWT authentication, and serves OpenAPI documentation via Swagger UI. It also exposes a protobuf export endpoint for user data.

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

## Endpoints (overview)

- POST /api/auth/login — authenticate and receive a token
- GET /api/users — list users (protected)
- POST /api/users — create user (protected, admin only)
- GET /api/users/export — export users as protobuf (protected)
- GET /api/users/:id — get single user (protected)
- PUT /api/users/:id — update user (protected)
- DELETE /api/users/:id — delete user (protected)

## Authentication & token usage

- The login endpoint returns a JSON object with `token` and `user` fields, e.g.:

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
  - `swagger/auth.json` (login operation)
  - `swagger/user.json` (user operations)

How to authorize in Swagger UI:

1. Open `/api-docs` in the browser.
2. Click `Authorize` and paste your JWT token. Use the prefix `Bearer ` if the UI doesn't add it automatically.
3. After authorization, protected endpoints will send the Authorization header.

## Protobuf export

- The endpoint `/api/users/export` returns `application/x-protobuf`. The proto file is available at `/api/protos/user.proto` (served from `src/protos` -> `public/protos` copy).
- The proto defines a `Users` message with repeated `User` entries. `createdAt` is represented as `google.protobuf.Timestamp` in the proto for precise timestamp handling.

## Environment variables

See `.env.example` for the main variables. Important ones:

- PORT — port to run the server
- JWT_SECRET — secret used to sign JWTs
- JWT_EXPIRES — token expiry (e.g., 1d)

## Troubleshooting

- If Swagger UI doesn't show protected endpoints as authorized, ensure you clicked Authorize and provided the token string (some UIs require the `Bearer ` prefix).
- If protobuf export fails with a verification error, ensure the proto file in `src/protos/user.proto` matches the server's payload shape.
- For DB issues, check `src/config/database.js` and ensure the sqlite file is writable or adjust config to your DB.

## Development

- Lint: `npm run lint`
- Dev server with auto-restart: `npm run dev`

## Contributing

Open a PR with tests or a clear explanation of fixes. Keep API changes backward-compatible where possible.

---

If you'd like I can:

- Add example requests (curl/postman) for each endpoint
- Add automated OpenAPI validation or a script to generate the merged spec to a file
- Add decoding example for protobuf exports
