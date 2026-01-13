# Changelog

All notable changes to the TokoBapak project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🚀 Planned
- Mobile application (React Native + Expo)
- Admin dashboard application
- ML-based recommendation engine
- Voice search integration
- Image search capability

---

## [0.2.1] - 2026-01-13

### 🔧 Maintenance
- **Monorepo Cleanup**
  - Configured comprehensive `.gitignore` for Polyglot environmet (Node.js, Java, Go, Python).
  - Removed system garbage files (`.DS_Store`).
  - Fixed git index to ensure strict ignore rules.
  - Added Git & Changelog policy to AI assistant guidelines.

## [0.2.0] - 2026-01-13

### ✨ Added

#### Frontend - Web Application
- **Authentication System**
  - Login page dengan email/password authentication
  - Register page dengan form validation (Zod + React Hook Form)
  - Session management menggunakan Auth.js v5
  
- **Core Layout Components**
  - Header component dengan navigation menu
  - Footer component dengan footer links
  - Mobile-responsive navigation
  - Cart drawer sidebar

- **Product Features**
  - Product card component dengan hover effects
  - Product grid layout (responsive)
  - Product detail page structure
  - Product image gallery skeleton

- **Shopping Cart**
  - Cart store menggunakan Zustand
  - Add to cart functionality
  - Cart item quantity management
  - Cart persistence (localStorage)

- **UI Components (shadcn/ui)**
  - Button variants (primary, secondary, outline, ghost)
  - Input fields dengan validation states
  - Card components
  - Dialog/Modal components
  - Dropdown menus
  - Badge components
  - Skeleton loaders
  - Toast notifications
  - Navigation menu

- **Design System**
  - Tailwind CSS 4 configuration
  - Custom color palette (primary, secondary, accent)
  - Typography scale
  - Spacing system
  - Dark mode support (foundation)

### 🔧 Changed
- Upgraded to Next.js 15 with App Router
- Migrated to Tailwind CSS 4 (CSS-first configuration)
- Switched package manager from npm to Bun

### 📁 Project Structure
- Established monorepo structure for frontend, backend, and infrastructure
- Created documentation structure in `/docs`
- Added database migrations folder
- Set up infrastructure as code with Terraform modules
- Created Kubernetes manifests structure

---

## [0.1.0] - 2025-12-29

### ✨ Added

#### Project Foundation
- **Project Structure**
  - Comprehensive project structure document (`tokobapak_structure.txt`)
  - Directory organization for all components
  - Clear separation of concerns (frontend, backend, infrastructure)

- **Documentation**
  - Frontend PRD (Product Requirements Document)
  - Backend PRD (planned)
  - Architecture documentation structure
  - API documentation structure

- **Frontend Web Application Initialization**
  - Next.js 15 project setup with App Router
  - TypeScript strict mode configuration
  - Bun as package manager
  - ESLint configuration
  - Tailwind CSS 4 integration
  - shadcn/ui components setup
  - PostCSS configuration

- **Route Structure**
  - Authentication routes (`/login`, `/register`)
  - Shop routes (`/`, `/products`, `/categories`, `/cart`, `/checkout`)
  - Account routes (`/profile`, `/orders`, `/wishlist`)
  - Static pages structure

#### Backend Structure (Planned)
- Defined 18 microservices architecture
- API Gateway configuration structure (Kong/Nginx)
- gRPC proto files structure
- Event schemas structure (Avro)
- Shared libraries structure

#### Infrastructure (Planned)
- Kubernetes deployment manifests structure
- Terraform modules for AWS resources
- Helm charts structure
- Monitoring stack (Prometheus, Grafana, Jaeger, ELK)
- CI/CD workflows structure (GitHub Actions)

### 📝 Notes
- Initial project setup focused on establishing solid foundation
- Frontend web application prioritized for first release
- Backend services designed but implementation pending

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.2.0 | 2026-01-13 | Frontend core features, authentication, cart |
| 0.1.0 | 2025-12-29 | Project initialization, structure, PRD |

---

## Migration Guides

### Upgrading to v0.2.0

No breaking changes. Simply pull the latest code and run:

```bash
cd frontend/web
bun install
bun dev
```

---

## Contributors

- Frontend Team - Web Application Development
- Backend Team - Microservices Architecture Design
- DevOps Team - Infrastructure Planning

---

## Links

- [Full Documentation](./docs/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [License](./LICENSE)

---

[Unreleased]: https://github.com/tokobapak/tokobapak/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/tokobapak/tokobapak/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/tokobapak/tokobapak/releases/tag/v0.1.0
