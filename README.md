# Secure Task Management System – Nx Monorepo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45">
</a>

✨ Your full-stack **Task Management System** built with an **Nx Workspace** is ready ✨.

This repo contains a complete **Angular + NestJS** monorepo implementing  
**JWT Authentication**, **Role-Based Access Control (ADMIN / OWNER / VIEWER)**,  
task creation, assignment, and secure organization-level filtering.

Run `npx nx graph` to visually explore the entire workspace structure.

---

# Workspace Overview

This Nx workspace contains **two applications** and **two shared libraries**:

apps/
├── api/ → NestJS backend (JWT Auth, RBAC, SQLite, TypeORM)
└── dashboard/ → Angular frontend (Standalone Components, Tailwind)

libs/
├── auth/ → Shared authentication guard + interfaces
└── data/ → Shared DTOs, enums, and types

yaml
Copy code

Nx enables scalable, modular development with type-safe communication between frontend and backend.

---

# 👥 Seeded User Accounts (for Testing)

| Role      | Email               | Password      |
|-----------|----------------------|----------------|
| **Admin**   | admin@demo.com       | admin123       |
| **Owner**   | owner@demo.com       | owner123       |
| **Viewer**  | viewer@demo.com      | viewer123      |

---

# 🔐 Role Permissions

### 🛡 ADMIN
- Full control over all tasks  
- Create / Update / Delete  
- Assign tasks to anyone  
- View all tasks across all organizations  

### 👤 OWNER
- Can create tasks  
- Can assign tasks **only inside their own organization**  
- Can update tasks in their organization  
- Cannot delete Admin-created tasks  

### 👁 VIEWER
- Can view tasks assigned to them  
- Can update **status only**  
- Cannot create / edit / delete tasks  

---

# ▶️ Run tasks

## Run the Angular Dashboard

```sh
npx nx serve dashboard
Dashboard runs at:

arduino
Copy code
http://localhost:4200
Run the API Server (NestJS)
sh
Copy code
npx nx serve api
API available at:

bash
Copy code
http://localhost:3000/api
Create production builds
Frontend:

sh
Copy code
npx nx build dashboard
Backend:

sh
Copy code
npx nx build api
View all available project targets
sh
Copy code
npx nx show project dashboard
npx nx show project api
These targets are inferred automatically or defined in each project.json.

Learn more: https://nx.dev/features/run-tasks

🚀 Key Features
Backend (NestJS)
JWT Authentication

RBAC for Admin / Owner / Viewer

SQLite + TypeORM

Task CRUD with ownership restrictions

Organization-aware access filtering

DTO validation everywhere

Auto-seeded database on startup

Frontend (Angular 17)
Standalone components

Tailwind CSS

Login + token storage + interceptor

Task table with role-based actions

Status updates for Viewer

Create / Edit modals for Admin/Owner

Clean, responsive UI

Shared (Nx Libraries)
libs/data: DTOs, enums, status types

libs/auth: JWT guard & current-user model

➕ Add New Projects (Nx)
Generate a new Angular app:

sh
Copy code
npx nx g @nx/angular:app myapp
Generate a new library:

sh
Copy code
npx nx g @nx/angular:lib mylib
List installed plugins:

sh
Copy code
npx nx list
More info: https://nx.dev/concepts/nx-plugins

⚙️ Set up CI
Step 1 — Connect to Nx Cloud
sh
Copy code
npx nx connect
Enables:

Remote caching

Distributed execution

Faster CI tasks

Step 2 — Generate a CI workflow
sh
Copy code
npx nx g ci-workflow
Learn more: https://nx.dev/ci/intro/ci-with-nx

🧪 Testing
Run API tests:

sh
Copy code
npx nx test api
Run Dashboard tests:

sh
Copy code
npx nx test dashboard
🔗 Useful Links
Angular: https://angular.dev

NestJS: https://nestjs.com

Nx Documentation: https://nx.dev

TailwindCSS: https://tailwindcss.com

📞 Contact
Yashoda Varma
GitHub: https://github.com/YashodaPVarma

yaml
Copy code

---

If you'd like, I can also generate:

📌 Screenshot placeholders  
📌 Architecture diagrams  
📌 Animated badges (build, test, lint)  
📌 Short “Recruiter Summary” at top  

Just tell me!
