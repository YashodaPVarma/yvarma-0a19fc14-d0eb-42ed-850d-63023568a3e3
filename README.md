🚀 Secure Task Management System – Nx Monorepo

✨ Your full-stack Task Management System, built inside an Nx Workspace,
is ready ✨.

This project contains a complete Angular + NestJS monorepo featuring
JWT Authentication, Role-Based Access Control (ADMIN / OWNER / VIEWER),
task creation, assignment, and organization-aware permission filtering.

Run npx nx graph to visually explore this workspace.

------------------------------------------------------------------------

🗂️ Workspace Overview

This Nx workspace includes two applications and two shared libraries:

apps/ ├── api/ → NestJS backend (JWT, RBAC, SQLite, TypeORM) └──
dashboard/ → Angular frontend (Standalone Components, Tailwind)

libs/ ├── auth/ → Shared JWT guard + interfaces └── data/ → Shared DTOs,
models, enums

Nx ensures scalable, modular development with reusable shared code.

------------------------------------------------------------------------

👥 Seeded User Accounts (IMPORTANT)

These users are preloaded in the database and required to test RBAC &
organizations.

  Role        Email                Password
  ----------- -------------------- -----------
  Admin       admin@demo.com       admin123
  IT Owner    it.owner@demo.com    owner123
  HR Owner    hr.owner@demo.com    owner123
  IT Viewer   it.viewer@demo.com   viewer123
  HR Viewer   hr.viewer@demo.com   viewer123

------------------------------------------------------------------------

🔐 Role Permissions

ADMIN: - Full access to all organizations - Create / Update / Delete any
task - Assign tasks to any user - View all tasks globally

OWNERS (IT Owner / HR Owner): - Create new tasks - Assign tasks only
within their own organization - Update tasks in their organization -
Cannot delete Admin tasks

VIEWERS (IT Viewer / HR Viewer): - View tasks assigned to them - Update
status only - Cannot create / edit / delete tasks

------------------------------------------------------------------------

▶️ Run Tasks

Run the Angular Dashboard: npx nx serve dashboard Dashboard runs at:
http://localhost:4200

Run the NestJS API: npx nx serve api API runs at:
http://localhost:3000/api

Create Production Builds: Frontend: npx nx build dashboard Backend: npx
nx build api

View All Project Targets: npx nx show project dashboard npx nx show
project api

------------------------------------------------------------------------

🚀 Key Features

Backend (NestJS): - JWT Authentication - RBAC for Admin / Owners /
Viewers - SQLite + TypeORM - Task CRUD with role restrictions -
Organization-aware filtering - DTO validation - Auto-seeding on startup

Frontend (Angular 17): - Standalone components - Tailwind UI - Token
interceptor + AuthGuard - Task list with role-based actions - Status
update control - Clean responsive UI

Shared Libraries: - libs/data → DTOs, enums, interfaces - libs/auth →
JWT Guard & auth interfaces

------------------------------------------------------------------------

➕ Add New Projects (Nx)

Generate new Angular app: npx nx g @nx/angular:app myapp

Generate new library: npx nx g @nx/angular:lib mylib

List plugins: npx nx list

------------------------------------------------------------------------

🧪 Testing

Run API tests: npx nx test api

Run Dashboard tests: npx nx test dashboard

------------------------------------------------------------------------
🌐 Live Demo (Frontend)

Your application is deployed and accessible at:

🔗 https://yashodapvarma.github.io/yvarma-0a19fc14-d0eb-42ed-850d-63023568a3e3

This link loads the Angular dashboard, which communicates with the NestJS API running locally or deployed separately.

📞 Contact

Yashoda Varma GitHub: https://github.com/YashodaPVarma
