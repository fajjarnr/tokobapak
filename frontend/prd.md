# Product Requirements Document (PRD)

## TokoBapak - Frontend Services

---

## 1. Executive Summary

**Product Name:** TokoBapak Frontend Applications  
**Document Version:** 2.0  
**Created:** December 2025  
**Last Updated:** January 2026  
**Status:** Active  
**Owners:** Frontend Team Lead, Product Manager  

### 1.1 Document Purpose

Dokumen ini mendefinisikan spesifikasi teknis dan fungsional lengkap untuk semua aplikasi frontend TokoBapak. PRD ini berfungsi sebagai single source of truth untuk tim pengembangan frontend.

### 1.2 Scope

Dokumen ini mencakup requirements untuk tiga aplikasi frontend TokoBapak:

1. **Web Application** - Customer-facing e-commerce website (Next.js)
2. **Mobile Application** - Native mobile shopping experience (React Native)
3. **Admin Dashboard** - Internal management interface (Next.js)

### 1.3 Target Audience

- Frontend Engineers
- UI/UX Designers
- QA Engineers
- Product Managers
- DevOps Engineers

### 1.4 Related Documents

| Document | Description |
|----------|-------------|
| `backend/prd.md` | Backend Services PRD |
| `docs/ARCHITECTURE.md` | System Architecture |
| `docs/API_DOCUMENTATION.md` | API Specifications |
| `docs/DATABASE_SCHEMA.md` | Database Design |

---

## 2. Web Application (Customer Portal)

### 2.1 Technology Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| **Runtime** | Bun | 1.2+ | Recommended for performance |
| **Framework** | Next.js | 15.x | App Router only |
| **Language** | TypeScript | 5.x | Strict mode enabled |
| **Package Manager** | Bun | 1.2+ | Strictly enforced |
| **Styling** | Tailwind CSS | 4.x | CSS-first configuration |
| **State Management** | Zustand | 5.x | Lightweight & performant |
| **Server State** | TanStack Query | 5.x | Data fetching & caching |
| **Form Handling** | React Hook Form | 7.x | + Zod validation |
| **UI Components** | shadcn/ui | latest | Radix UI primitives |
| **Icons** | Lucide React | latest | Tree-shakeable |
| **Authentication** | Auth.js | 5.x | (NextAuth.js v5) |
| **Image Optimization** | Next.js Image | built-in | WebP/AVIF auto-conversion |
| **Analytics** | Vercel Analytics | latest | + Google Analytics 4 |
| **Error Tracking** | Sentry | latest | + Source maps |
| **Testing - Unit** | Vitest | latest | + React Testing Library |
| **Testing - E2E** | Playwright | latest | Cross-browser |
| **Testing - Component** | Storybook | 8.x | Visual testing |
| **Build Tool** | Turbopack | built-in | Development only |

```yaml
# package.json engines requirement
engines:
  node: ">=20.0.0"
  bun: ">=1.2.0"
```

### 2.2 Core Features & User Stories

#### **2.2.1 Authentication & Authorization**

**Features:**

- Email/Password registration & login
- Social login (Google, Facebook)
- Phone number login (OTP)
- Password reset via email
- Remember me functionality
- Session management
- Multi-device login tracking

**User Stories:**

```
As a new user
I want to register with my email or social account
So that I can start shopping on TokoBapak

As a registered user
I want to login quickly using saved credentials
So that I can access my account seamlessly

As a user who forgot password
I want to reset my password via email
So that I can regain access to my account
```

**Technical Requirements:**

- JWT token storage in httpOnly cookies
- Refresh token rotation
- Auto-logout on token expiration
- CSRF protection
- Rate limiting on login attempts

#### **2.2.2 Home Page**

**Features:**

- Hero banner carousel (auto-rotating)
- Flash sale section with countdown timer
- Category grid/carousel
- Featured products
- Recommended products (personalized)
- Top sellers section
- Recent product views
- Newsletter subscription
- Promotional banners

**User Stories:**

```
As a visitor
I want to see trending products and deals on homepage
So that I can discover interesting products quickly

As a returning user
I want to see personalized product recommendations
So that I can find products relevant to my interests
```

**Performance Requirements:**

- Initial page load: < 2 seconds (LCP)
- First Contentful Paint: < 1 second
- Time to Interactive: < 3 seconds
- Lighthouse score: > 90

**SEO Requirements:**

- Server-side rendering (SSR)
- Proper meta tags
- Structured data (JSON-LD)
- Sitemap generation
- Open Graph tags

#### **2.2.3 Product Catalog & Search**

**Features:**

- Product listing with grid/list view toggle
- Advanced filtering:
  - Price range slider
  - Categories & subcategories
  - Brand filter
  - Ratings filter
  - Location filter (for sellers)
  - Condition (new/used)
  - Free shipping filter
- Sorting options:
  - Relevance
  - Price (low to high, high to low)
  - Newest
  - Best selling
  - Rating
- Pagination with infinite scroll option
- Quick view modal
- Add to cart from listing
- Add to wishlist
- Real-time search with autocomplete
- Search suggestions
- Recent searches
- Popular searches
- Image search (future)

**User Stories:**

```
As a shopper
I want to filter products by price and category
So that I can find products within my budget and interest

As a shopper
I want to search products with autocomplete suggestions
So that I can quickly find what I'm looking for

As a mobile user
I want to scroll infinitely through products
So that I don't have to click through pages
```

**Technical Requirements:**

- Debounced search (300ms delay)
- Client-side caching of search results
- URL state management for filters
- Skeleton loaders during fetch
- Lazy loading for images
- Virtual scrolling for large lists

#### **2.2.4 Product Detail Page**

**Features:**

- Image gallery with zoom
- Image carousel/slider
- Video support
- Product specifications table
- Variants selection (color, size, etc.)
- Stock availability indicator
- Price display with discount
- Seller information with rating
- Add to cart button
- Buy now button
- Quantity selector
- Product description (rich text)
- Reviews & ratings section:
  - Overall rating
  - Rating distribution chart
  - Review filters (by rating, verified purchase)
  - Review sorting
  - Helpful votes on reviews
  - Image reviews
- Product Q&A section
- Related products
- Recently viewed products
- Share buttons (WhatsApp, Facebook, Twitter, Copy link)
- Report product button

**User Stories:**

```
As a shopper
I want to see detailed product images with zoom
So that I can examine product quality

As a shopper
I want to read customer reviews with images
So that I can make informed purchase decisions

As a shopper
I want to select product variants (size, color)
So that I can get exactly what I want
```

**Technical Requirements:**

- Image lazy loading
- Image optimization (WebP, AVIF)
- Responsive image sizes
- ISR (Incremental Static Regeneration) for SEO
- Client-side routing for variants
- Real-time stock updates via WebSocket

**SEO Requirements:**

- Dynamic meta tags per product
- Structured data for products
- Breadcrumb navigation
- Canonical URLs
- Rich snippets support

#### **2.2.5 Shopping Cart**

**Features:**

- Add/remove products
- Update quantity
- Select/deselect items
- Select all items
- Remove selected items
- Save for later
- Move to wishlist
- Price calculation:
  - Subtotal per item
  - Total price
  - Discount calculation
  - Estimated shipping
- Stock validation
- Applied vouchers display
- Checkout button
- Continue shopping link
- Empty cart state
- Cart item limit warning

**User Stories:**

```
As a shopper
I want to see all items in my cart with prices
So that I can review my purchase before checkout

As a shopper
I want to adjust quantities in my cart
So that I can buy the right amount

As a shopper
I want my cart to persist across sessions
So that I don't lose my selections
```

**Technical Requirements:**

- Cart persistence in Redis (backend)
- Optimistic UI updates
- Real-time stock validation
- Debounced quantity updates
- Cart sync across devices
- Auto-remove unavailable items

#### **2.2.6 Checkout Flow**

**Features:**

- Multi-step checkout process:
  1. **Shipping Address**
     - Address list
     - Add new address
     - Edit address
     - Set default address
     - Address validation
  
  2. **Shipping Method**
     - Available courier options
     - Shipping cost calculation
     - Estimated delivery time
     - Insurance option
  
  3. **Payment Method**
     - Credit/debit card
     - Bank transfer
     - E-wallets (GoPay, OVO, DANA, ShopeePay)
     - Installment options
     - COD (Cash on Delivery)
     - Saved payment methods
  
  4. **Order Review**
     - Order summary
     - Shipping address confirmation
     - Payment method confirmation
     - Voucher/promo code input
     - Points redemption
     - Order notes
     - Terms & conditions checkbox

- Order confirmation page
- Payment instructions page
- Order tracking link

**User Stories:**

```
As a shopper
I want to complete checkout in few simple steps
So that I can finish my purchase quickly

As a shopper
I want to choose my preferred payment method
So that I can pay conveniently

As a shopper
I want to see order summary before payment
So that I can verify everything is correct
```

**Technical Requirements:**

- Form validation at each step
- Progress indicator
- Auto-save draft order
- Payment gateway integration
- Order reservation during checkout
- Timeout mechanism (15 minutes)
- 3D Secure support for cards

#### **2.2.7 User Account & Profile**

**Features:**

- **Profile Management**
  - Edit personal information
  - Change profile picture
  - Change password
  - Email verification
  - Phone verification
  - Delete account

- **Address Book**
  - Add/edit/delete addresses
  - Set primary address
  - Label addresses (Home, Office)

- **Order History**
  - Order list with status
  - Order details
  - Track order
  - Download invoice
  - Reorder functionality
  - Cancel order (if applicable)
  - Return/refund request

- **Wishlist**
  - View all wishlist items
  - Add to cart from wishlist
  - Remove items
  - Share wishlist

- **Reviews**
  - Products pending review
  - My reviews
  - Edit review

- **Notifications**
  - Notification list
  - Mark as read
  - Notification settings
  - Push notification preferences

- **Payment Methods**
  - Saved cards
  - Add/remove payment methods

- **TokoBapak Wallet**
  - Balance display
  - Top-up wallet
  - Transaction history
  - Withdrawal

- **Vouchers & Rewards**
  - Available vouchers
  - Used vouchers
  - Points balance
  - Referral code

**User Stories:**

```
As a registered user
I want to manage my profile and preferences
So that my shopping experience is personalized

As a shopper
I want to track all my orders in one place
So that I can monitor delivery status

As a loyal customer
I want to view and use my rewards points
So that I can get discounts on purchases
```

#### **2.2.8 Seller Store Page**

**Features:**

- Seller profile banner
- Seller information:
  - Store name
  - Rating & reviews
  - Response rate
  - Join date
  - Location
  - Product count
- Follow seller button
- Chat with seller button
- Product catalog
- Store categories
- Store search
- Seller reviews
- Store vouchers
- Store policies

**User Stories:**

```
As a shopper
I want to view all products from a seller
So that I can browse their complete catalog

As a shopper
I want to see seller ratings and reviews
So that I can trust the seller
```

#### **2.2.9 Chat/Messaging**

**Features:**

- Chat list with sellers
- Real-time messaging
- Message status (sent, delivered, read)
- Send product link in chat
- Send images
- Quick replies
- Chat history
- Unread message counter
- Online status indicator
- Typing indicator
- Search conversations

**User Stories:**

```
As a shopper
I want to chat with sellers about products
So that I can ask questions before buying

As a shopper
I want to receive real-time replies
So that I can get quick answers
```

**Technical Requirements:**

- WebSocket connection
- Message persistence
- Push notifications for new messages
- Offline message queue
- Message encryption

#### **2.2.10 Search & Discovery**

**Features:**

- Global search bar (always visible)
- Search by voice (mobile)
- Category browsing
- Brand directory
- Deal of the day
- Flash sales page
- New arrivals
- Trending products
- Recently viewed
- Recommended for you

### 2.3 Page Structure & Routes

```typescript
// Next.js 15 App Router Structure

app/
├── (auth)/                         // Auth route group (no layout inheritance)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   └── layout.tsx                  // Minimal auth layout
│
├── (shop)/                         // Main shop route group
│   ├── layout.tsx                  // Shop layout with header/footer
│   ├── page.tsx                    // Home page (SSR)
│   ├── products/
│   │   ├── page.tsx                // Product listing (ISR)
│   │   ├── [slug]/
│   │   │   └── page.tsx            // Product detail (ISR)
│   │   └── search/
│   │       └── page.tsx            // Search results (dynamic)
│   ├── categories/
│   │   ├── page.tsx                // All categories (static)
│   │   └── [slug]/
│   │       └── page.tsx            // Category page (ISR)
│   ├── brands/
│   │   ├── page.tsx                // Brand directory (static)
│   │   └── [slug]/
│   │       └── page.tsx            // Brand page (ISR)
│   ├── cart/
│   │   └── page.tsx                // Shopping cart (client)
│   ├── checkout/
│   │   ├── page.tsx                // Checkout overview
│   │   ├── shipping/
│   │   │   └── page.tsx
│   │   ├── payment/
│   │   │   └── page.tsx
│   │   └── confirmation/
│   │       └── page.tsx
│   ├── seller/
│   │   └── [slug]/
│   │       └── page.tsx            // Seller store (ISR)
│   └── deals/
│       ├── flash-sale/
│       │   └── page.tsx            // Flash sale (SSR for freshness)
│       └── daily-deals/
│           └── page.tsx
│
├── (account)/                      // Protected account routes
│   ├── layout.tsx                  // Account layout with sidebar
│   ├── profile/
│   │   └── page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx            // Order detail
│   ├── addresses/
│   │   └── page.tsx
│   ├── wishlist/
│   │   └── page.tsx
│   ├── reviews/
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── wallet/
│   │   └── page.tsx
│   ├── vouchers/
│   │   └── page.tsx
│   └── messages/
│       ├── page.tsx                // Message list
│       └── [id]/
│           └── page.tsx            // Conversation
│
├── (static)/                       // Static pages (fully cached)
│   ├── about/
│   │   └── page.tsx
│   ├── help/
│   │   └── [...slug]/
│   │       └── page.tsx            // Help articles
│   ├── terms/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
│
├── api/                            // API routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── webhook/
│   │   ├── payment/
│   │   │   └── route.ts
│   │   └── shipping/
│   │       └── route.ts
│   └── revalidate/
│       └── route.ts                // On-demand ISR
│
├── layout.tsx                      // Root layout
├── not-found.tsx                   // 404 page
├── error.tsx                       // Error boundary
├── loading.tsx                     // Root loading
└── sitemap.ts                      // Dynamic sitemap
```

### 2.4 Component Architecture

```typescript
// Component Structure

components/
├── ui/                         // shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── toast.tsx
│   └── ...
│
├── layout/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── NavMenu.tsx
│   │   ├── CartIcon.tsx
│   │   └── UserMenu.tsx
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   ├── FooterLinks.tsx
│   │   └── Newsletter.tsx
│   ├── Sidebar/
│   │   └── Sidebar.tsx
│   └── MobileNav/
│       └── MobileNav.tsx
│
├── product/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   ├── ProductImage.tsx
│   │   ├── ProductPrice.tsx
│   │   └── QuickActions.tsx
│   ├── ProductGrid/
│   │   └── ProductGrid.tsx
│   ├── ProductDetail/
│   │   ├── ImageGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── VariantSelector.tsx
│   │   ├── AddToCart.tsx
│   │   └── SellerInfo.tsx
│   ├── ProductReviews/
│   │   ├── ReviewList.tsx
│   │   ├── ReviewItem.tsx
│   │   ├── ReviewForm.tsx
│   │   └── RatingDistribution.tsx
│   └── ProductFilters/
│       ├── FilterSidebar.tsx
│       ├── PriceFilter.tsx
│       ├── CategoryFilter.tsx
│       └── RatingFilter.tsx
│
├── cart/
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   ├── CartDrawer.tsx
│   └── EmptyCart.tsx
│
├── checkout/
│   ├── CheckoutStepper.tsx
│   ├── AddressSelector.tsx
│   ├── ShippingOptions.tsx
│   ├── PaymentMethods.tsx
│   ├── OrderSummary.tsx
│   └── VoucherInput.tsx
│
├── account/
│   ├── ProfileForm.tsx
│   ├── AddressForm.tsx
│   ├── OrderCard.tsx
│   ├── OrderTimeline.tsx
│   └── WishlistGrid.tsx
│
├── search/
│   ├── SearchBar.tsx
│   ├── SearchAutocomplete.tsx
│   ├── SearchResults.tsx
│   └── SearchFilters.tsx
│
├── seller/
│   ├── SellerCard.tsx
│   ├── SellerHeader.tsx
│   └── SellerStats.tsx
│
├── chat/
│   ├── ChatWindow.tsx
│   ├── ChatList.tsx
│   ├── ChatMessage.tsx
│   └── ChatInput.tsx
│
├── common/
│   ├── Breadcrumb.tsx
│   ├── Pagination.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── ImageWithFallback.tsx
│   ├── LazyImage.tsx
│   ├── CountdownTimer.tsx
│   ├── Rating.tsx
│   └── ShareButtons.tsx
│
└── forms/
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    ├── AddressForm.tsx
    └── ReviewForm.tsx
```

### 2.5 State Management Strategy

```typescript
// Zustand Store Structure

stores/
├── authStore.ts                // User authentication state
│   ├── user
│   ├── isAuthenticated
│   ├── token
│   ├── login()
│   ├── logout()
│   └── refreshToken()
│
├── cartStore.ts                // Shopping cart state
│   ├── items
│   ├── totalItems
│   ├── totalPrice
│   ├── addItem()
│   ├── removeItem()
│   ├── updateQuantity()
│   ├── clearCart()
│   └── syncWithBackend()
│
├── uiStore.ts                  // UI state
│   ├── isSidebarOpen
│   ├── isCartDrawerOpen
│   ├── isMobileMenuOpen
│   ├── theme
│   └── modals
│
├── searchStore.ts              // Search state
│   ├── query
│   ├── filters
│   ├── results
│   ├── suggestions
│   └── recentSearches
│
├── wishlistStore.ts            // Wishlist state
│   ├── items
│   ├── addItem()
│   ├── removeItem()
│   └── syncWithBackend()
│
└── notificationStore.ts        // Notifications
    ├── notifications
    ├── unreadCount
    ├── addNotification()
    └── markAsRead()
```

### 2.6 API Integration

```typescript
// API Client Structure using TanStack Query

lib/api/
├── client.ts                   // Axios instance with interceptors
├── queryClient.ts              // TanStack Query client config
│
├── auth.ts
│   ├── useLogin()
│   ├── useRegister()
│   ├── useLogout()
│   └── useRefreshToken()
│
├── products.ts
│   ├── useProducts()           // List products
│   ├── useProduct()            // Get product detail
│   ├── useProductReviews()
│   └── useRelatedProducts()
│
├── cart.ts
│   ├── useCart()
│   ├── useAddToCart()
│   ├── useUpdateCart()
│   └── useRemoveFromCart()
│
├── orders.ts
│   ├── useOrders()
│   ├── useOrder()
│   ├── useCreateOrder()
│   ├── useCancelOrder()
│   └── useTrackOrder()
│
├── user.ts
│   ├── useProfile()
│   ├── useUpdateProfile()
│   ├── useAddresses()
│   └── useWishlist()
│
├── search.ts
│   ├── useSearch()
│   ├── useSearchSuggestions()
│   └── useAutocomplete()
│
├── payment.ts
│   ├── usePaymentMethods()
│   ├── useCreatePayment()
│   └── usePaymentStatus()
│
└── chat.ts
    ├── useConversations()
    ├── useMessages()
    └── useSendMessage()
```

### 2.7 Performance Optimization

**Code Splitting:**

```typescript
// Dynamic imports for heavy components
const ProductReviews = dynamic(() => import('@/components/product/ProductReviews'))
const ChatWindow = dynamic(() => import('@/components/chat/ChatWindow'))
const ImageGallery = dynamic(() => import('@/components/product/ImageGallery'))
```

**Image Optimization:**

```typescript
// Next.js Image component with proper sizing
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={false}
  loading="lazy"
  placeholder="blur"
/>
```

**Caching Strategy:**

```typescript
// TanStack Query cache configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})
```

**Bundle Size Optimization:**

- Tree-shaking unused code
- Use named imports
- Lazy load routes
- Code splitting by route
- Minimize dependencies
- Use production builds

### 2.8 SEO Strategy

**Meta Tags:**

```typescript
// Dynamic meta tags
export const metadata: Metadata = {
  title: 'Product Name - TokoBapak',
  description: 'Product description...',
  keywords: ['keyword1', 'keyword2'],
  openGraph: {
    title: 'Product Name',
    description: 'Product description...',
    images: [product.image],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product Name',
    description: 'Product description...',
    images: [product.image],
  },
}
```

**Structured Data:**

```typescript
// JSON-LD for products
const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "image": product.images,
  "description": product.description,
  "brand": {
    "@type": "Brand",
    "name": product.brand
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "IDR",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.rating,
    "reviewCount": product.reviewCount
  }
}
```

### 2.9 Accessibility (a11y)

**Requirements:**

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Proper ARIA labels
- Color contrast ratios (4.5:1)
- Focus indicators
- Alt text for all images
- Form validation messages
- Skip to content link

**Implementation:**

```typescript
// Accessible button example
<button
  aria-label="Add to cart"
  aria-describedby="cart-status"
  disabled={isLoading}
  className="focus:ring-2 focus:ring-blue-500"
>
  Add to Cart
</button>
```

### 2.10 Internationalization (i18n)

**Supported Languages (Phase 1):**

- Indonesian (default)
- English

**Implementation:**

```typescript
// next-intl configuration
import { createIntl } from 'next-intl'

const messages = {
  id: {
    'product.addToCart': 'Tambah ke Keranjang',
    'product.buyNow': 'Beli Sekarang',
  },
  en: {
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
  },
}
```

**Currency & Format:**

- Currency: IDR (Rupiah)
- Date format: DD/MM/YYYY
- Number format: 1.234.567,89

### 2.11 Responsive Design

**Breakpoints:**

```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
}
```

**Mobile-First Approach:**

- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Simplified navigation on mobile
- Bottom navigation bar on mobile
- Pull-to-refresh support

### 2.12 Error Handling

**Error Boundaries:**

```typescript
// Global error boundary
export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**API Error Handling:**

```typescript
// Centralized error handling
const handleApiError = (error: AxiosError) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        // Redirect to login
        router.push('/login')
        break
      case 403:
        // Show forbidden message
        toast.error('Access denied')
        break
      case 404:
        // Show not found
        toast.error('Resource not found')
        break
      case 500:
        // Show server error
        toast.error('Server error. Please try again')
        break
      default:
        toast.error('An error occurred')
    }
  }
}
```

### 2.13 Security Requirements

**Client-Side Security:**

- XSS prevention (sanitize user input)
- CSRF protection
- Secure cookie handling
- Content Security Policy (CSP)
- HTTPS only
- No sensitive data in localStorage
- Input validation
- Rate limiting on forms

**Authentication Security:**

```typescript
// Secure token storage
// Store JWT in httpOnly cookies (handled by backend)
// Never store tokens in localStorage

// CSRF token handling
const csrfToken = getCsrfToken()
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
```

### 2.14 Analytics & Tracking

**Events to Track:**

- Page views
- Product views
- Add to cart
- Remove from cart
- Begin checkout
- Purchase complete
- Search queries
- Product clicks
- Category navigation
- Seller page views
- Review submissions
- Wishlist actions

**Implementation:**

```typescript
// Google Analytics 4
import { event } from '@/lib/analytics'

// Track product view
event({
  action: 'view_item',
  category: 'ecommerce',
  label: product.id,
  value: product.price,
})

// Track add to cart
event({
  action: 'add_to_cart',
  category: 'ecommerce',
  label: product.id,
  value: product.price,
})
```

### 2.15 Testing Strategy

**Unit Tests:**

- Components (React Testing Library)
- Utility functions
- Custom hooks
- Store logic
- Coverage target: > 80%

**Integration Tests:**

- User flows
- API integration
- Form submissions
- Navigation

**E2E Tests (Playwright):**

```typescript
// Example E2E test
test('complete checkout flow', async ({ page }) => {
  await page.goto('/products/product-1')
  await page.click('button:has-text("Add to Cart")')
  await page.click('a:has-text("Cart")')
  await page.click('button:has-text("Checkout")')
  await page.fill('input[name="address"]', 'Test Address')
  await page.click('button:has-text("Continue")')
  // ... complete flow
})
```

**Visual Regression Tests:**

- Chromatic or Percy
- Test on multiple viewports
- Test dark/light themes

### 2.16 Performance Metrics & Monitoring

**Core Web Vitals:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTI (Time to Interactive): < 3.8s

**Monitoring Tools:**

- Sentry for error tracking
- Google Analytics for user behavior
- Vercel Analytics for performance
- Lighthouse CI in pipeline

**Bundle Size:**

- Initial JS bundle: < 200KB (gzipped)
- Total page weight: < 1MB
- Images: optimized WebP/AVIF

---

## 3. Mobile Application (React Native)

### 3.1 Technology Stack

```yaml
Framework: React Native 0.73+
Language: TypeScript
Navigation: React Navigation 6+
State Management: Zustand (Shared logic with Web)
UI Components: React Native Paper + Custom
Icons: React Native Vector Icons
API Client: TanStack Query (Shared logic with Web) + Axios
Forms: React Hook Form
Storage: zustand-persist (AsyncStorage + MMKV)
Push Notifications: React Native Firebase
Deep Linking: React Navigation Deep Linking
Maps: React Native Maps
Camera: React Native Vision Camera
Image Picker: React Native Image Picker
Payment: Midtrans Mobile SDK
Analytics: Firebase Analytics + Mixpanel
Crash Reporting: Firebase Crashlytics
Testing:
  - Unit: Jest
  - Component: React Native Testing Library
  - E2E: Detox
Code Push: CodePush (for OTA updates)
Build: EAS Build (Expo Application Services)
```

### 3.2 Core Features

**All features from web application, plus:**

**Mobile-Specific Features:**

- Biometric authentication (fingerprint, face ID)
- Camera for barcode scanning
- Push notifications
- Offline mode with sync
- Location-based features
- Native payment integrations
- Share to social media
- Image upload from camera/gallery
- Pull-to-refresh
- Swipe gestures
- Bottom sheet modals
- Native splash screen
- App shortcuts (iOS/Android)

**Screen Structure:**

```
screens/
├── auth/
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── OnboardingScreen.tsx
├── home/
│   └── HomeScreen.tsx
├── products/
│   ├── ProductListScreen.tsx
│   ├── ProductDetailScreen.tsx
│   └── ProductSearchScreen.tsx
├── cart/
│   └── CartScreen.tsx
├── checkout/
│   ├── CheckoutScreen.tsx
│   ├── AddressScreen.tsx
│   └── PaymentScreen.tsx
├── account/
│   ├── ProfileScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── OrderDetailScreen.tsx
│   ├── WishlistScreen.tsx
│   └── SettingsScreen.tsx
├── seller/
│   └── SellerStoreScreen.tsx
├── chat/
│   ├── ChatListScreen.tsx
│   └── ChatScreen.tsx
└── notifications/
    └── NotificationsScreen.tsx
```

**Navigation Structure:**

```typescript
// Tab Navigator (Bottom)
const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Categories" component={CategoriesScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Messages" component={ChatListScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
)

// Stack Navigator
const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    {/* ... */}
  </Stack.Navigator>
)
```

### 3.3 Mobile Performance Requirements

- App launch time: < 3 seconds
- Screen transition: < 300ms
- API response handling: Show loading states
- Image loading: Progressive with placeholders
- Memory usage: < 200MB on average
- Battery impact: Minimal (optimize background tasks)
- Offline capability: Basic browsing and cart

### 3.4 Push Notifications

**Notification Types:**

- Order status updates
- Payment confirmation
- Shipping updates
- Promotional offers
- Price drop alerts
- Wishlist item discounts
- Chat messages
- Seller responses

**Implementation:**

```typescript
// Firebase Cloud Messaging
import messaging from '@react-native-firebase/messaging'

// Request permission
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission()
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL

  if (enabled) {
    const token = await messaging().getToken()
    // Send token to backend
  }
}

// Handle foreground notifications
messaging().onMessage(async remoteMessage => {
  // Show local notification
})

// Handle background/quit notifications
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Process notification
})
```

### 3.5 Offline Mode

**Offline Capabilities:**

- Browse cached products
- View order history
- Access wishlist
- View saved addresses
- Queue cart updates for sync
- Read cached messages

**Implementation:**

```typescript
// Redux Persist for offline data
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['cart', 'wishlist', 'auth', 'recentlyViewed']
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
```

### 3.6 App Store Requirements

**iOS App Store:**

- App Privacy details
- App Store screenshots (6.5", 5.5")
- App icons (1024x1024)
- App preview video (optional)
- Age rating
- Content descriptions

**Google Play Store:**

- Feature graphic (1024x500)
- Screenshots (multiple devices)
- App icon (512x512)
- Privacy policy URL
- Content rating
- App category

**Required Metadata:**

- App name: TokoBapak
- Short description (80 chars)
- Full description (4000 chars)
- Keywords
- Support URL
- Marketing URL

---

## 4. Admin Dashboard

### 4.1 Technology Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| **Framework** | Next.js | 15.x | App Router, same as Web |
| **Language** | TypeScript | 5.x | Strict mode enabled |
| **UI Library** | shadcn/ui | latest | + Radix UI primitives |
| **Styling** | Tailwind CSS | 4.x | Consistent with Web |
| **Charts** | Recharts | latest | Data visualization |
| **Tables** | TanStack Table | 8.x | Advanced data tables |
| **Forms** | React Hook Form | 7.x | + Zod validation |
| **State Management** | Zustand | 5.x | Consistent with Web |
| **Server State** | TanStack Query | 5.x | Consistent with Web |
| **Date Picker** | date-fns + React Day Picker | latest | |
| **Rich Text Editor** | Tiptap | latest | Lexical as alternative |
| **File Upload** | React Dropzone | latest | + S3/R2 integration |
| **Authentication** | Auth.js | 5.x | Role-based access |
| **Real-time** | Socket.io Client | latest | Live updates |

### 4.2 User Roles & Permissions

**Admin Roles:**

- **Super Admin** - Full access
- **Operations Manager** - Orders, shipping, customer support
- **Content Manager** - Products, categories, content moderation
- **Marketing Manager** - Promotions, vouchers, analytics
- **Support Agent** - Customer support, chat moderation
- **Finance Manager** - Payments, settlements, reports

**Permission Matrix:**

```typescript
type Permission =
  | 'users.view'
  | 'users.edit'
  | 'users.delete'
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.view'
  | 'orders.manage'
  | 'analytics.view'
  | 'settings.manage'
  // ... more permissions
```

### 4.3 Core Features

#### **4.3.1 Dashboard Overview**

**Widgets:**

- Today's revenue
- Total orders (today/week/month)
- New users (today/week/month)
- Active sellers
- Pending reviews
- Low stock alerts
- Customer support tickets
- Revenue chart (line/bar)
- Top selling products
- Recent orders
- Recent registrations

#### **4.3.2 User Management**

**Features:**

- User list with filters
- User detail view
- Edit user information
- Suspend/activate users
- View user orders
- View user activity log
- Export user data
- Bulk actions
- Advanced search

**Filters:**

- User type (customer/seller)
- Registration date
- Status (active/suspended/banned)
- Verification status
- Location

#### **4.3.3 Product Management**

**Features:**

- Product list with pagination
- Add new product
- Edit product
- Delete product
- Bulk edit
- Bulk delete
- Product approval workflow
- Stock management
- Price management
- Product variants management
- Import products (CSV/Excel)
- Export products
- Product categories management
- Product attributes management

**Product Form Fields:**

- Product name
- Description (rich text)
- Category & subcategory
- Brand
- SKU
- Price
- Discount
- Stock quantity
- Images (multiple)
- Variants (size, color, etc.)
- Weight & dimensions
- Condition (new/used)
- Status (active/draft/archived)

#### **4.3.4 Order Management**

**Features:**

- Order list with filters
- Order detail view
- Update order status
- Print invoice
- Print shipping label
- Cancel order
- Process refund
- Export orders
- Bulk status update
- Order timeline
- Order notes
- Dispute management

**Order Statuses:**

- Pending payment
- Payment confirmed
- Processing
- Shipped
- Delivered
- Cancelled
- Refunded
- Disputed

**Filters:**

- Order status
- Date range
- Payment method
- Shipping method
- Amount range
- Customer name

#### **4.3.5 Seller Management**

**Features:**

- Seller list
- Seller registration approval
- Seller detail view
- Edit seller information
- Suspend/activate seller
- View seller products
- View seller orders
- Seller performance metrics
- Commission settings
- Settlement management

**Seller Metrics:**

- Total sales
- Total products
- Average rating
- Response rate
- Fulfillment rate
- Cancellation rate

#### **4.3.6 Content Moderation**

**Features:**

- Product review moderation
- Seller review moderation
- Report management
- Flagged content review
- Approve/reject content
- User content management
- Comment moderation

#### **4.3.7 Promotion & Marketing**

**Features:**

- Create promotions
- Manage discount codes
- Voucher management
- Flash sale setup
- Banner management
- Email campaigns
- Push notification campaigns
- SMS campaigns

**Promotion Types:**

- Percentage discount
- Fixed amount discount
- Buy X get Y
- Free shipping
- Bundle deals
- Minimum purchase discount

#### **4.3.8 Analytics & Reports**

**Dashboards:**

- Sales analytics
- Product performance
- Customer analytics
- Seller analytics
- Traffic analytics
- Conversion funnel
- Revenue reports

**Reports:**

- Daily sales report
- Weekly sales report
- Monthly sales report
- Product sales report
- Category performance
- Seller performance
- Customer lifetime value
- Inventory report
- Payment reconciliation
- Tax report

**Visualizations:**

- Line charts
- Bar charts
- Pie charts
- Area charts
- Heatmaps
- Tables with sorting/filtering

#### **4.3.9 Settings**

**Configuration:**

- General settings
- Payment gateway configuration
- Shipping method configuration
- Email templates
- SMS templates
- Tax settings
- Commission rates
- Platform fees
- Currency settings
- Notification settings
- SEO settings
- Security settings

#### **4.3.10 Customer Support**

**Features:**

- Support ticket system
- Chat with customers
- Ticket assignment
- Priority management
- Canned responses
- Knowledge base management
- FAQ management

### 4.4 Admin Dashboard UI/UX

**Layout:**

- Sidebar navigation (collapsible)
- Top header with:
  - Breadcrumb
  - Search bar
  - Notifications
  - User menu
- Main content area
- Footer

**Design Principles:**

- Clean and minimal
- Data-dense tables
- Clear CTAs
- Consistent spacing
- Proper loading states
- Error handling
- Success feedback

**Color Scheme:**

- Primary: Blue (#0066CC)
- Success: Green (#22C55E)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray (#64748B)

### 4.5 Admin Dashboard Routes

```typescript
// Next.js 15 App Router Structure

app/
├── (dashboard)/                    // Protected dashboard routes
│   ├── layout.tsx                  // Dashboard layout with sidebar
│   ├── page.tsx                    // Overview dashboard
│   │
│   ├── users/                      // User management
│   │   ├── page.tsx                // User list
│   │   ├── [id]/
│   │   │   └── page.tsx            // User detail
│   │   └── export/
│   │       └── route.ts            // Export API
│   │
│   ├── products/                   // Product management
│   │   ├── page.tsx                // Product list
│   │   ├── new/
│   │   │   └── page.tsx            // Create product
│   │   ├── [id]/
│   │   │   └── edit/
│   │   │       └── page.tsx        // Edit product
│   │   ├── categories/
│   │   │   └── page.tsx            // Category management
│   │   └── attributes/
│   │       └── page.tsx            // Product attributes
│   │
│   ├── orders/                     // Order management
│   │   ├── page.tsx                // Order list
│   │   ├── [id]/
│   │   │   └── page.tsx            // Order detail
│   │   └── disputes/
│   │       └── page.tsx            // Dispute handling
│   │
│   ├── sellers/                    // Seller management
│   │   ├── page.tsx                // Seller list
│   │   ├── [id]/
│   │   │   └── page.tsx            // Seller detail
│   │   ├── applications/
│   │   │   └── page.tsx            // Pending applications
│   │   └── settlements/
│   │       └── page.tsx            // Payment settlements
│   │
│   ├── promotions/                 // Marketing
│   │   ├── page.tsx                // Promotion list
│   │   ├── new/
│   │   │   └── page.tsx            // Create promotion
│   │   ├── vouchers/
│   │   │   └── page.tsx            // Voucher management
│   │   ├── banners/
│   │   │   └── page.tsx            // Banner management
│   │   └── flash-sales/
│   │       └── page.tsx            // Flash sale setup
│   │
│   ├── reviews/                    // Content moderation
│   │   ├── page.tsx                // Review list
│   │   └── reports/
│   │       └── page.tsx            // Reported content
│   │
│   ├── analytics/                  // Analytics
│   │   ├── page.tsx                // Overview
│   │   ├── sales/
│   │   │   └── page.tsx            // Sales analytics
│   │   ├── products/
│   │   │   └── page.tsx            // Product performance
│   │   ├── customers/
│   │   │   └── page.tsx            // Customer analytics
│   │   └── traffic/
│   │       └── page.tsx            // Traffic analytics
│   │
│   ├── reports/                    // Reports
│   │   ├── page.tsx                // Report hub
│   │   ├── sales/
│   │   │   └── page.tsx            // Sales reports
│   │   ├── inventory/
│   │   │   └── page.tsx            // Inventory reports
│   │   └── finance/
│   │       └── page.tsx            // Financial reports
│   │
│   ├── support/                    // Customer support
│   │   ├── tickets/
│   │   │   ├── page.tsx            // Ticket list
│   │   │   └── [id]/
│   │   │       └── page.tsx        // Ticket detail
│   │   └── chat/
│   │       └── page.tsx            // Live chat support
│   │
│   └── settings/                   // System settings
│       ├── general/
│       │   └── page.tsx            // General settings
│       ├── payments/
│       │   └── page.tsx            // Payment configuration
│       ├── shipping/
│       │   └── page.tsx            // Shipping configuration
│       ├── notifications/
│       │   └── page.tsx            // Notification templates
│       ├── team/
│       │   └── page.tsx            // Team management
│       └── security/
│           └── page.tsx            // Security settings
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx                // Admin login
│   └── forgot-password/
│       └── page.tsx
│
├── api/                            // API routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── export/
│   │   └── route.ts                // Data export
│   └── upload/
│       └── route.ts                // File upload handler
│
└── layout.tsx                      // Root layout
```

---

## 5. Shared Frontend Requirements

### 5.1 Design System

**Typography:**

```typescript
// Font families
const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
  mono: 'JetBrains Mono, monospace',
}

// Font sizes
const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
}
```

**Spacing:**

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
}
```

**Colors:**

```typescript
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... to 900
    500: '#0066CC', // Main brand color
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: {
    // Gray scale
  }
}
```

### 5.2 Common Components Library

**Shareable components across all frontend apps:**

- Button variations
- Input fields
- Select dropdowns
- Checkboxes & radios
- Modals & dialogs
- Toast notifications
- Loading spinners
- Skeleton loaders
- Cards
- Badges
- Avatars
- Tooltips
- Accordions
- Tabs
- Breadcrumbs
- Pagination

### 5.3 Environment Configuration

```bash
# ═══════════════════════════════════════════════════════════════
# DEVELOPMENT ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_CDN_URL=http://localhost:9000

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=true
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
NEXT_PUBLIC_ENABLE_DEBUG=true

# ═══════════════════════════════════════════════════════════════
# STAGING ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

# API Configuration
NEXT_PUBLIC_API_URL=https://api-staging.tokobapak.com/api/v1
NEXT_PUBLIC_API_GATEWAY_URL=https://gateway-staging.tokobapak.com
NEXT_PUBLIC_WS_URL=wss://ws-staging.tokobapak.com
NEXT_PUBLIC_CDN_URL=https://cdn-staging.tokobapak.com

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# ═══════════════════════════════════════════════════════════════
# PRODUCTION ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

# API Configuration
NEXT_PUBLIC_API_URL=https://api.tokobapak.com/api/v1
NEXT_PUBLIC_API_GATEWAY_URL=https://gateway.tokobapak.com
NEXT_PUBLIC_WS_URL=wss://ws.tokobapak.com
NEXT_PUBLIC_CDN_URL=https://cdn.tokobapak.com

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_API=false
NEXT_PUBLIC_ENABLE_DEV_TOOLS=false
NEXT_PUBLIC_ENABLE_DEBUG=false

# ═══════════════════════════════════════════════════════════════
# SHARED CONFIGURATION (All Environments)
# ═══════════════════════════════════════════════════════════════

# Authentication
NEXTAUTH_URL=${APP_URL}
NEXTAUTH_SECRET=<secure-random-string-min-32-chars>

# OAuth Providers
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=

# Third-party Services
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=                              # Server-side only

# Payment Gateway
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
MIDTRANS_SERVER_KEY=                            # Server-side only
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=
XENDIT_SECRET_KEY=                              # Server-side only

# Firebase (Mobile Push)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 5.4 API Client Configuration

```typescript
// lib/api/client.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    'X-Client-Platform': 'web',
  },
  withCredentials: true, // For httpOnly cookies
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID()
    
    // Add CSRF token if available
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig
    
    // Handle token refresh
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true
      try {
        await refreshToken()
        return apiClient(config)
      } catch (refreshError) {
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }
    
    // Retry logic for network errors
    if (shouldRetry(error) && (config._retryCount || 0) < MAX_RETRY_ATTEMPTS) {
      config._retryCount = (config._retryCount || 0) + 1
      await delay(RETRY_DELAY_MS * config._retryCount)
      return apiClient(config)
    }
    
    return Promise.reject(error)
  }
)
```

### 5.5 Build & Deployment

**Web Application:**

```bash
# Development
bun run dev                        # Start dev server with Turbopack

# Build & Test
bun run build                      # Production build
bun run start                      # Start production server
bun run lint                       # ESLint check
bun run lint:fix                   # ESLint auto-fix
bun run type-check                 # TypeScript check
bun run test                       # Run unit tests
bun run test:e2e                   # Run E2E tests

# Deployment
vercel --prod                      # Deploy to Vercel
```

**Mobile Application:**

```bash
# Development
bun run android                    # Start Android
bun run ios                        # Start iOS

# Build with EAS
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform all --profile production

# Submit to Stores
eas submit --platform android
eas submit --platform ios

# OTA Updates
eas update --branch production --message "Bug fixes"
```

**Docker Deployment:**

```dockerfile
# Dockerfile.web
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 6. Success Metrics (KPIs)

### 6.1 Web Application

- Page load time: < 2s
- Time to Interactive: < 3s
- Conversion rate: > 3%
- Cart abandonment: < 70%
- Bounce rate: < 50%
- Average session duration: > 5 minutes
- Pages per session: > 3

### 6.2 Mobile Application

- App store rating: > 4.5 stars
- Crash-free rate: > 99.9%
- Daily active users (DAU)
- Monthly active users (MAU)
- App load time: < 3s
- Session length: > 6 minutes
- Retention rate D1/D7/D30

### 6.3 Admin Dashboard

- Task completion time
- User satisfaction
- System response time: < 500ms
- Uptime: > 99.9%

---

## 7. Development Timeline

**Phase 1: MVP (3 months)**

- Week 1-2: Setup & Architecture
- Week 3-6: Core pages (Home, Product, Cart)
- Week 7-8: Checkout flow
- Week 9-10: User account
- Week 11-12: Testing & bug fixes

**Phase 2: Enhancement (2 months)**

- Week 13-14: Search & filters
- Week 15-16: Reviews & ratings
- Week 17-18: Chat system
- Week 19-20: Mobile app (80% feature parity)

**Phase 3: Advanced (2 months)**

- Week 21-22: Admin dashboard
- Week 23-24: Analytics integration
- Week 25-26: Performance optimization
- Week 27-28: Security audit & polish

---

## 8. Team Structure

**Frontend Team (6-8 developers):**

- 1 Frontend Lead
- 2-3 Web developers (Next.js)
- 2 Mobile developers (React Native)
- 1-2 Admin dashboard developers
- UI/UX Designer (1-2)
- QA Engineer (1-2)

---

## 9. Dependencies & Third-party Services

**Essential Services:**

- Payment: Midtrans, Xendit
- Maps: Google Maps API
- Analytics: Google Analytics, Mixpanel
- Error tracking: Sentry
- Email: SendGrid
- SMS: Twilio
- Push: Firebase Cloud Messaging
- CDN: CloudFlare
- Hosting: Vercel (web), EAS (mobile)

---

## 10. Risks & Mitigation

**Technical Risks:**

- Performance issues → Load testing, optimization
- Security vulnerabilities → Regular audits, pen testing
- Third-party API downtime → Fallback mechanisms
- Browser compatibility → Cross-browser testing

**Business Risks:**

- Poor user adoption → User research, A/B testing
- High bounce rate → UX improvements, page speed
- Low conversion → Optimize checkout flow

---

## 11. Conclusion

PRD ini mencakup semua aspek frontend development untuk TokoBapak dengan detail lengkap untuk Web, Mobile, dan Admin Dashboard. Setiap section dirancang untuk memberikan pengalaman pengguna terbaik dengan teknologi modern dan best practices.

### 11.1 Quick Reference

| Application | Framework | Status | Priority |
|-------------|-----------|--------|----------|
| Web Customer Portal | Next.js 15 | Active | High |
| Mobile App (iOS/Android) | React Native 0.76 | Active | High |
| Admin Dashboard | Next.js 15 | Active | High |

### 11.2 Next Steps

1. Review dan approval PRD oleh stakeholders
2. Finalisasi design mockups di Figma
3. Setup development environment
4. Sprint planning untuk Phase 1
5. Kick-off development

### 11.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2025 | Frontend Team | Initial draft |
| 2.0 | Jan 2026 | Frontend Team | Updated tech stack, added API configuration details |

---

**Related Documents:**
- [Backend PRD](../backend/prd.md)
- [Architecture Documentation](../docs/ARCHITECTURE.md)
- [API Documentation](../docs/API_DOCUMENTATION.md)
