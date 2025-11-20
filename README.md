🚀 Secure Task Management System — Nx Monorepo

A Full-Stack Angular + NestJS Application with Authentication, RBAC &
Organization-Aware Permissions

This repository contains a complete Task Management System built using
an Nx Monorepo, featuring:

-   JWT Authentication
-   Role-Based Access Control (RBAC)
-   Organization-aware task filtering
-   NestJS backend (API)
-   Angular 17 frontend (dashboard)
-   SQLite + TypeORM
-   Shared libraries (auth & data)

Run: npx nx graph to explore the workspace.

Project Structure

apps/ ├── api/ → NestJS backend └── dashboard/ → Angular frontend

libs/ ├── auth/ → Shared JWT helpers └── data/ → Shared DTOs, enums,
models

Preloaded User Accounts

Admin: admin@demo.com / admin123 IT Owner: it.owner@demo.com / owner123
HR Owner: hr.owner@demo.com / owner123 IT Viewer: it.viewer@demo.com /
viewer123 HR Viewer: hr.viewer@demo.com / viewer123

Role Permissions

ADMIN – full access across all organizations. OWNERS – manage tasks only
inside their org. VIEWERS – view and update status only.

How to Run Locally

1.  Install dependencies: npm install
2.  Run backend: npx nx serve api (http://localhost:3000/api)
3.  Run frontend: npx nx serve dashboard (http://localhost:4200)
4.  Production builds:
    -   Frontend: npx nx build dashboard
    -   Backend: npx nx build api

Live Deployment Notes

Frontend built using: ng build –base-href=“//” Hosted via GitHub Pages.
Backend CORS enabled for GitHub Pages origin. Angular environment
updated to point to live API.

Features

Backend: - JWT Auth, RBAC, SQLite, TypeORM, Auto-seeding

Frontend: - Angular 17 Standalone, TailwindCSS, Token interceptor,
Guards

Shared Libraries: - libs/auth and libs/data

Testing

API: npx nx test api Frontend: npx nx test dashboard

Contact

Yashoda Varma GitHub: https://github.com/YashodaPVarma
