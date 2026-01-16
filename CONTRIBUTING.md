# Contributing to TokoBapak

Thank you for your interest in contributing to TokoBapak! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Documentation](#documentation)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read and follow our principles:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive criticism
- Accept responsibility for mistakes

---

## Getting Started

### Prerequisites

- **Node.js** 22+ and npm
- **Go** 1.22+
- **Docker** and Docker Compose
- **Git**

### Setting Up the Development Environment

1. **Clone the repository**
```bash
git clone https://github.com/fajjarnr/tokobapak.git
cd tokobapak
```

2. **Start infrastructure**
```bash
cd infrastructure/docker
docker compose up -d
```

3. **Set up each service**

**Product Service:**
```bash
cd backend/services/product-service
cp .env.example .env
npm install
npm run start:dev
```

**Catalog Service:**
```bash
cd backend/services/catalog-service
cp .env.example .env
go mod download
go run cmd/server/main.go
```

**Cart Service:**
```bash
cd backend/services/cart-service
cp .env.example .env
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend/web
bun install
bun dev
```

---

## Development Workflow

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/product-search` |
| Bug Fix | `fix/<description>` | `fix/cart-quantity-bug` |
| Hotfix | `hotfix/<description>` | `hotfix/payment-crash` |
| Release | `release/<version>` | `release/v1.0.0` |
| Documentation | `docs/<description>` | `docs/api-reference` |

### Workflow Steps

1. Create a branch from `main`
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature
```

2. Make your changes
3. Commit with proper message (see Commit Guidelines)
4. Push to remote
```bash
git push origin feature/my-feature
```

5. Create a Pull Request

---

## Coding Standards

### TypeScript/NestJS

- Use **ESLint** with project configuration
- Use **Prettier** for formatting
- Follow NestJS best practices
- Use strict TypeScript

```bash
# Lint
npm run lint

# Format
npm run format
```

**File Naming:**
- Files: `kebab-case.ts` (e.g., `product-card.tsx`)
- Classes: `PascalCase` (e.g., `ProductService`)
- Functions/Variables: `camelCase` (e.g., `getProduct`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_ITEMS`)

**Example:**
```typescript
// products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductsService {
  async findOne(id: string): Promise<Product> {
    const product = await this.repository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }
}
```

### Go

- Use `gofmt` for formatting
- Use `golint` for linting
- Follow [Effective Go](https://go.dev/doc/effective_go)
- Follow Clean Architecture pattern

```bash
# Format
gofmt -w .

# Lint
golint ./...

# Vet
go vet ./...
```

**Example:**
```go
// usecase/category_uc.go
package usecase

import (
    "context"
    "github.com/tokobapak/catalog-service/internal/domain"
)

type categoryUsecase struct {
    repo domain.CategoryRepository
}

func (uc *categoryUsecase) GetByID(ctx context.Context, id string) (domain.Category, error) {
    return uc.repo.GetByID(ctx, id)
}
```

### CSS/Styling (Frontend)

- Use **Tailwind CSS**
- Use **shadcn/ui** components
- Follow mobile-first approach
- Use CSS variables for theming

---

## Testing Guidelines

### Unit Tests

**NestJS:**
```bash
npm run test
npm run test:cov  # with coverage
```

**Go:**
```bash
go test ./...
go test -cover ./...
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Naming

```typescript
describe('ProductsService', () => {
  describe('findOne', () => {
    it('should return a product when found', async () => {
      // ...
    });

    it('should throw NotFoundException when not found', async () => {
      // ...
    });
  });
});
```

### Coverage Requirements

| Type | Minimum |
|------|---------|
| Unit Tests | 80% |
| E2E Tests | Key flows covered |

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

### Scopes

| Scope | Description |
|-------|-------------|
| `backend` | Backend services |
| `frontend` | Frontend applications |
| `product` | Product service |
| `catalog` | Catalog service |
| `cart` | Cart service |
| `infra` | Infrastructure |
| `docs` | Documentation |

### Examples

```bash
# Feature
git commit -m "feat(product): add search endpoint with filters"

# Bug fix
git commit -m "fix(cart): resolve quantity update issue"

# Documentation
git commit -m "docs(api): update product API reference"

# Refactoring
git commit -m "refactor(catalog): improve repository error handling"
```

---

## Pull Request Process

### Before Creating PR

1. ✅ Code compiles without errors
2. ✅ All tests pass
3. ✅ Linting passes
4. ✅ Documentation updated (if needed)
5. ✅ CHANGELOG.md updated

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe testing approach

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
```

### Review Process

1. At least 1 approval required
2. All CI checks must pass
3. No unresolved comments
4. Reviewer will be auto-assigned

---

## Documentation

### Where to Document

| Type | Location |
|------|----------|
| API Reference | `docs/api/` |
| Architecture | `docs/architecture/` |
| Getting Started | Project README |
| Code Comments | In-code JSDoc/GoDoc |
| Decisions | `docs/architecture/ADR/` |

### Documentation Style

- Use clear, concise language
- Include code examples
- Keep up-to-date with code changes
- Use Markdown formatting

### API Documentation

- Use Swagger decorators in NestJS
- Use Swag comments in Go
- Include request/response examples

**NestJS Example:**
```typescript
@ApiOperation({ summary: 'Get product by ID' })
@ApiResponse({ status: 200, description: 'Product found', type: Product })
@ApiResponse({ status: 404, description: 'Product not found' })
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.productsService.findOne(id);
}
```

**Go Example:**
```go
// GetByID godoc
// @Summary Get category by ID
// @Description Get a category by its unique identifier
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} domain.Category
// @Failure 404 {object} map[string]string
// @Router /categories/{id} [get]
func (h *CategoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    // ...
}
```

---

## Need Help?

- **Documentation**: Check `/docs` folder
- **Issues**: Open a GitHub issue
- **Email**: backend-team@tokobapak.id

---

*Thank you for contributing to TokoBapak! 🚀*
