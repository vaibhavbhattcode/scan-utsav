# ScanUtsav — Security Hardening Audit & Route Protection Summary

This document summarizes all API endpoints and page routes locked down with role-based access control (RBAC), middleware route guards, and server-side JWT verification.

---

## 🔒 Middleware Route Guards (`src/middleware.ts`)

| Route Path Pattern | Allowed Roles | Action on Unauthorized Request |
| :--- | :--- | :--- |
| `/admin/**` | `super_admin` | Redirects to `/login?redirect=<path>` |
| `/dashboard/**` | `host`, `super_admin` | Redirects to `/login?redirect=<path>` |
| Mutating `/api/**` (`POST`, `PUT`, `PATCH`, `DELETE`) | All (Exempt: Auth & Guest Upload) | Rejects with `403 Forbidden` if CSRF token header missing |

---

## 🔑 Locked Down API Endpoints (`src/lib/apiAuth.ts`)

| API Route | Method | Allowed Roles | Protection Mechanism |
| :--- | :--- | :--- | :--- |
| `/api/admin/users` | `GET`, `PATCH` | `super_admin` | `requireAuth(req, ["super_admin"])` + Server-side Role Check |
| `/api/admin/events` | `GET` | `super_admin` | `requireAuth(req, ["super_admin"])` |
| `/api/admin/cms` | `POST` | `super_admin` | `requireAuth(req, ["super_admin"])` |
| `/api/coupons` | `POST` | `super_admin` | `requireAuth(req, ["super_admin"])` |
| `/api/events` | `POST` | `host`, `super_admin` | `requireAuth(req, ["host", "super_admin"])` |
| `/api/media` | `PATCH` (Approve/Reject) | `host`, `super_admin` | `requireAuth(req, ["host", "super_admin"])` |
| `/api/media` | `POST` (Guest Upload) | `Public` (Rate-Limited) | Rate-Limited to 30 requests/min per IP |
| `/api/auth/login` | `POST` | `Public` (Rate-Limited) | Rate-Limited to 5 requests/min per IP |
| `/api/auth/register` | `POST` | `Public` (Rate-Limited) | Rate-Limited to 5 requests/min per IP |

---

## 🛡️ Password & Secrets Security

1. **Backdoor Removal**: Completely removed hardcoded `admin@scanutsav.com` super-admin bypass block from `/api/auth/login`. Authentication strictly uses `bcrypt.compare` against the `User` collection.
2. **Secrets Environment Enforcement**: Removed hardcoded JWT secret fallback strings from `src/lib/auth.ts`. App throws a startup error if `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing.
3. **One-Time Admin Seed Script**: Created `scripts/seed-admin.ts` (`npm run seed:admin`) reading `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` from `.env`.
4. **Git Isolation**: Confirmed `.env` is listed in `.gitignore`.
