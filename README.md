🚀 Secure Task Management System – Nx Monorepo

✨ Your full-stack Task Management System, built inside an Nx Workspace,
is ready ✨.

This project contains a complete Angular + NestJS monorepo featuring
JWT Authentication, Role-Based Access Control (ADMIN / OWNER / VIEWER),
task creation, assignment, and secure organization-aware filtering.

Run npx nx graph to visually explore this workspace.

------------------------------------------------------------------------

🗂️ Workspace Overview

This Nx workspace includes two applications and two shared libraries:

    apps/
     ├── api/          → NestJS backend (JWT, RBAC, SQLite, TypeORM)
     └── dashboard/    → Angular frontend (Standalone Components, Tailwind)

    libs/
     ├── auth/         → Shared JWT guard + interfaces
     └── data/         → Shared DTOs, models, enums

Nx enables clean separation, modular code organization, and reusable
shared libraries.

------------------------------------------------------------------------

👥 Seeded User Accounts (IMPORTANT)

These users are preloaded into the database and required for testing
authentication + RBAC.

  Role     Email             Password
  -------- ----------------- -----------
  Admin    admin@demo.com    admin123
  Owner    owner@demo.com    owner123
  Viewer   viewer@demo.com   viewer123

✔ Admin = Full access
✔ Owner = Organization-level access
✔ Viewer = Read-only + status updates

------------------------------------------------------------------------

🔐 Role Permissions

🛡️ ADMIN

-   Full control over all tasks
-   Create / Update / Delete tasks
-   Assign tasks to ANY user
-   View ALL organizations and users

👤 OWNER

-   Create tasks
-   Assign tasks only within their own organization
-   Update tasks in their organization
-   Cannot delete Admin tasks

👁️ VIEWER

-   View tasks assigned to them
-   Update status only
-   Cannot create / edit / delete tasks

------------------------------------------------------------------------

▶️ Run Tasks

🔵 Run the Angular Dashboard

    npx nx serve dashboard

Dashboard runs at:

    http://localhost:4200

------------------------------------------------------------------------

🟠 Run the NestJS API

    npx nx serve api

API runs at:

    http://localhost:3000/api

------------------------------------------------------------------------

📦 Create Production Builds

Dashboard:

    npx nx build dashboard

API:

    npx nx build api

------------------------------------------------------------------------

🔍 View All Available Project Targets

    npx nx show project dashboard
    npx nx show project api

More info: https://nx.dev/features/run-tasks

------------------------------------------------------------------------

🚀 Key Features

🟠 Backend (NestJS)

-   JWT Authentication
-   RBAC for Admin / Owner / Viewer
-   SQLite + TypeORM
-   Task CRUD with role restrictions
-   Organization-aware filtering
-   DTO validation
-   Auto-seeding on startup

🔵 Frontend (Angular 17)

-   Standalone components
-   Tailwind CSS for UI
-   Auth Guard + HTTP Interceptor
-   Login with JWT token handling
-   Role-based UI control
-   Task table with actions
-   Status update controls
-   Clean, responsive UI

📚 Shared Libraries (Nx)

-   libs/data → DTOs, enums, interfaces
-   libs/auth → JWT Guard + CurrentUser interface

------------------------------------------------------------------------

➕ Add New Projects (Nx)

Generate a new Angular app:

    npx nx g @nx/angular:app myapp

Generate a new library:

    npx nx g @nx/angular:lib mylib

List plugins:

    npx nx list

More info: https://nx.dev/concepts/nx-plugins

------------------------------------------------------------------------

⚙️ Set Up CI

Step 1 — Connect to Nx Cloud

    npx nx connect

Step 2 — Generate a CI Workflow

    npx nx g ci-workflow

Learn more: https://nx.dev/ci/intro/ci-with-nx

------------------------------------------------------------------------

🧪 Testing

    npx nx test api
    npx nx test dashboard

------------------------------------------------------------------------

📞 Contact

Yashoda Varma
GitHub: https://github.com/YashodaPVarma
