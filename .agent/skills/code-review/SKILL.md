---
name: Code Review
description: Skills for conducting thorough code reviews, ensuring quality, and maintaining best practices
---

# Code Review Skills

> Panduan lengkap skill untuk Code Review di TokoBapak E-commerce Platform

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Review Process](#review-process)
3. [Code Quality Checklist](#code-quality-checklist)
4. [Frontend Review Guidelines](#frontend-review-guidelines)
5. [Backend Review Guidelines](#backend-review-guidelines)
6. [Security Review](#security-review)
7. [Performance Review](#performance-review)
8. [Documentation Review](#documentation-review)
9. [Common Scenarios](#common-scenarios)

---

## Overview

AI Assistant harus mampu melakukan code review mencakup:

- 🔍 Static code analysis
- 🛡️ Security vulnerability detection
- ⚡ Performance bottleneck identification
- 📝 Documentation completeness check
- ✅ Best practices enforcement
- 🧪 Test coverage verification

---

## Review Process

### Development Workflow

1. **Understand Requirements**
   - Parse user story
   - Identify affected services
   - List required endpoints

2. **Design Phase**
   - Generate API contract (OpenAPI)
   - Design database schema
   - Plan event flows

3. **Implementation**
   - Generate boilerplate code
   - Implement business logic
   - Add validation & error handling

4. **Testing**
   - Generate unit tests
   - Generate integration tests
   - Generate E2E tests

5. **Documentation**
   - Update API docs
   - Update README
   - Update CHANGELOG.md

6. **Deployment**
   - Update Docker configs
   - Update Kubernetes manifests
   - Generate migration scripts

### Debugging Workflow

1. **Analyze Error**
   - Parse error messages
   - Identify root cause
   - Check related files

2. **Suggest Fixes**
   - Provide code fix
   - Explain why it happened
   - Suggest prevention strategies

3. **Verify Fix**
   - Generate test cases
   - Run tests
   - Check for regressions

---

## Code Quality Checklist

**AI harus verify sebelum commit**:

### General

- ✅ **TypeScript**: No `any` types
- ✅ **ESLint**: No warnings
- ✅ **Prettier**: Formatted code
- ✅ **Tests**: Coverage > 80%
- ✅ **Security**: No hardcoded secrets
- ✅ **Performance**: No obvious bottlenecks
- ✅ **Error handling**: Proper try-catch blocks
- ✅ **Logging**: Structured logs with context
- ✅ **Documentation**: Public APIs documented

### Naming Conventions

- **Variables/Functions**: camelCase
- **Components/Classes**: PascalCase
- **Files**: kebab-case
- **Imports**: Absolute imports menggunakan `@/` alias

---

## Frontend Review Guidelines

### React/Next.js Specific

- ✅ **Server vs Client Components**: Correct usage
- ✅ **Server Actions**: Proper mutations
- ✅ **Suspense**: Streaming implemented correctly
- ✅ **Metadata API**: SEO configured
- ✅ **Image optimization**: Using Next.js Image
- ✅ **Accessibility**: ARIA labels present

### Component Review

```typescript
// ❌ BAD: No TypeScript, missing accessibility
function ProductCard({ product }) {
  return (
    <div onClick={handleClick}>
      <img src={product.image} />
      <span>{product.name}</span>
    </div>
  )
}

// ✅ GOOD: Typed, accessible, optimized
interface ProductCardProps {
  product: Product
  onClick?: (id: string) => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onClick={() => onClick?.(product.id)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(product.id)}
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={200}
        height={200}
        className="object-cover"
      />
      <CardContent>
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-primary font-bold">
          {formatCurrency(product.price)}
        </p>
      </CardContent>
    </Card>
  )
}
```

### State Management Review

```typescript
// ❌ BAD: No persistence, no type safety
const useStore = create((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
}));

// ✅ GOOD: Typed, persistent, with computed values
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },
    }),
    { name: "cart-storage" },
  ),
);
```

---

## Backend Review Guidelines

### API Design Review

- ✅ **Versioning**: `/v1/`, `/v2/` paths
- ✅ **HTTP Methods**: Correct usage (GET, POST, PUT, DELETE)
- ✅ **Status Codes**: Proper response codes
- ✅ **Error Responses**: Structured error format
- ✅ **Pagination**: Implemented for list endpoints
- ✅ **Validation**: Request body validation

### NestJS Review

```typescript
// ❌ BAD: No validation, no documentation, no error handling
@Controller("products")
export class ProductsController {
  @Post()
  create(@Body() body) {
    return this.service.create(body);
  }
}

// ✅ GOOD: Validated, documented, proper error handling
@ApiTags("products")
@Controller("v1/products")
export class ProductsController {
  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  @ApiResponse({ status: 400, description: "Validation error" })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    try {
      return await this.productsService.create(dto);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
```

### Go Review

```go
// ❌ BAD: No error handling, no logging
func (h *Handler) GetProduct(c *gin.Context) {
    id := c.Param("id")
    product := h.repo.Find(id)
    c.JSON(200, product)
}

// ✅ GOOD: Proper error handling, logging, structured response
func (h *Handler) GetProduct(c *gin.Context) {
    ctx := c.Request.Context()
    id := c.Param("id")

    h.logger.Info("fetching product",
        zap.String("productId", id),
        zap.String("traceId", ctx.Value("traceId").(string)),
    )

    product, err := h.repo.FindByID(ctx, id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            c.JSON(http.StatusNotFound, ErrorResponse{
                Code:    "PRODUCT_NOT_FOUND",
                Message: "Product not found",
            })
            return
        }
        h.logger.Error("failed to fetch product", zap.Error(err))
        c.JSON(http.StatusInternalServerError, ErrorResponse{
            Code:    "INTERNAL_ERROR",
            Message: "An unexpected error occurred",
        })
        return
    }

    c.JSON(http.StatusOK, SuccessResponse{Data: product})
}
```

---

## Security Review

### Must Check

- ✅ **Never log sensitive data** (passwords, tokens, PII)
- ✅ **Input validation** on all user inputs
- ✅ **Parameterized queries** (prevent SQL injection)
- ✅ **Rate limiting** on public endpoints
- ✅ **CORS configuration** properly set
- ✅ **HTTPS only** in production
- ✅ **JWT token expiry** configured
- ✅ **Input sanitization** for XSS prevention

### Security Anti-patterns

```typescript
// ❌ BAD: SQL Injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD: Parameterized query
const user = await userRepo.findOne({ where: { email } });
```

```typescript
// ❌ BAD: Logging sensitive data
logger.info("User login", { email, password, token });

// ✅ GOOD: Redacting sensitive data
logger.info("User login", { email, userId: user.id });
```

```typescript
// ❌ BAD: Hardcoded secrets
const JWT_SECRET = "my-super-secret-key";

// ✅ GOOD: Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
```

---

## Performance Review

### Frontend Performance

- ✅ **Images**: Using Next.js Image with optimization
- ✅ **Lazy loading**: Components loaded on demand
- ✅ **Bundle size**: No unnecessary dependencies
- ✅ **Caching**: TanStack Query caching configured
- ✅ **Memoization**: useMemo/useCallback where needed

### Backend Performance

- ✅ **Database queries**: N+1 queries prevented
- ✅ **Indexes**: Proper database indexes
- ✅ **Caching**: Redis caching for hot data
- ✅ **Pagination**: Large result sets paginated
- ✅ **Async operations**: Non-blocking I/O

```typescript
// ❌ BAD: N+1 query problem
for (const order of orders) {
  const customer = await customerRepo.findById(order.customerId);
}

// ✅ GOOD: Eager loading
const orders = await orderRepo.find({
  relations: ["customer"],
  where: { status: "pending" },
});
```

---

## Documentation Review

### API Documentation

**AI harus verify**:

- ✅ OpenAPI/Swagger annotations complete
- ✅ Request/response examples provided
- ✅ Error responses documented
- ✅ Authentication requirements specified

### CHANGELOG.md

**Format yang benar**:

```markdown
## [Unreleased]

### Added

- Product review system with rating calculation
- Cart synchronization between guest and logged-in users

### Changed

- Improved search performance with Elasticsearch pagination

### Fixed

- Cart items not persisting after login (frontend/web/hooks/use-hybrid-cart.ts:45)
```

### Code Documentation

```typescript
// ❌ BAD: No documentation
function calculatePrice(items, discount) {
  return items.reduce((sum, i) => sum + i.price, 0) * (1 - discount);
}

// ✅ GOOD: JSDoc with types
/**
 * Calculates the total price of items after applying discount
 * @param items - Array of cart items with price property
 * @param discount - Discount percentage as decimal (0-1)
 * @returns Total price after discount
 * @example
 * calculatePrice([{ price: 100 }], 0.1) // Returns 90
 */
function calculatePrice(items: CartItem[], discount: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - discount);
}
```

---

## Common Scenarios

### Scenario 1: Feature Review (Wishlist)

**Checklist**:

- [ ] Zustand store typed dan persistent
- [ ] API endpoints validated dan documented
- [ ] WishlistButton accessible dengan ARIA
- [ ] Tests coverage > 80%
- [ ] CHANGELOG.md updated
- [ ] No security vulnerabilities

### Scenario 2: Bug Fix Review (Cart Persistence)

**Root Cause Analysis**:

```typescript
// Problem: Cart items tidak persist setelah page refresh
// Root cause: Zustand store tidak menggunakan persist middleware

// Before (Bug):
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
    })),
}));

// After (Fix):
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

**Verification**:

- [ ] Test case added for persistence
- [ ] Manual test passed
- [ ] No regressions in cart functionality
- [ ] CHANGELOG.md updated with fix reference

---

## Summary

AI Assistant harus review berdasarkan:

1. **Code Quality**: TypeScript, ESLint, formatting
2. **Security**: Input validation, no secrets, proper auth
3. **Performance**: No N+1, caching, optimization
4. **Accessibility**: ARIA, keyboard navigation
5. **Documentation**: API docs, CHANGELOG, comments
6. **Tests**: Coverage > 80%, edge cases covered

**Key Principles**:

- Ask for clarification when requirements are unclear
- Generate production-ready code with proper error handling
- Write tests alongside implementation
- Update documentation automatically
- Follow project conventions and style guide

---

_Last Updated: January 2026_
