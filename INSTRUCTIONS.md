# PERN Stack Multi-Brand Social Ecommerce MVP Restructuring Project

## Project Overview

Restructure the existing PERN (PostgreSQL, Express, React, Node.js) application into a high-end multi-brand social ecommerce platform with unified API integration, manual seller capabilities, and comprehensive video content features including reels, live streaming, and premium content subscriptions. The platform should fetch products from multiple brand APIs while allowing manual sellers to list products, with all data unified in a single database architecture. Build a database-agnostic architecture that can work with any PostgreSQL instance, starting with Supabase for convenience but designed for easy migration to other cloud providers.

## Architecture Philosophy

**Database Agnostic Design**: Create a flexible data layer that works with any PostgreSQL instance:

- Use standard PostgreSQL queries and features (not Supabase-specific)
- Implement custom connection pooling and real-time features
- Build authentication with JWT (not Supabase Auth)
- Create reusable database service layer for easy provider switching
- Use standard file storage patterns (initially Supabase Storage, but easily replaceable)

**Multi-Brand Integration Architecture**:

- Unified product data structure supporting both API brands and manual sellers
- Brand API orchestration layer with rate limiting and caching
- Product normalization engine for consistent data formatting
- Real-time sync mechanisms for API brand data
- Conflict resolution for duplicate products across brands

**Video Content & Social Media Architecture**:

- Scalable video processing and streaming infrastructure
- Real-time live streaming with WebRTC integration
- Premium content gating and subscription management
- AI-powered content moderation and recommendation systems
- Multi-format video delivery (HLS, DASH, progressive download)

## Primary Objectives

### 1. Multi-Brand API Integration & Data Unification

- **Brand API orchestration**: Centralized service to manage multiple brand API integrations
- **Product data normalization**: Transform diverse API responses into unified product schema
- **Real-time synchronization**: Automated syncing of brand catalogs with conflict resolution
- **Manual seller integration**: Seamless blending of API products with manually listed products
- **Brand management system**: Dynamic brand configuration and API credential management
- **Data quality assurance**: Duplicate detection, product matching, and quality scoring

### 2. Database Layer Abstraction & Connection Setup

- **Database service abstraction**: Create a unified database service that works with any PostgreSQL instance
- **Connection management**: Implement proper connection pooling using standard PostgreSQL drivers
- **Environment flexibility**: Support for local PostgreSQL, Supabase, AWS RDS, Google Cloud SQL, etc.
- **Migration system**: Database-agnostic migration scripts using standard SQL
- **Query builder**: Custom query builder or use of libraries like Knex.js for cross-platform compatibility

### 3. Video Content & Live Streaming System

- **Reels platform**: TikTok-style short-form vertical video feed with AI-powered recommendations
- **Live streaming**: Real-time broadcasting with WebRTC, chat integration, and viewer management
- **Premium video content**: Subscription-based exclusive video access with multiple tier options
- **Video processing pipeline**: Automated video encoding, compression, thumbnail generation, and CDN delivery
- **Content moderation**: AI-powered automated content filtering and manual review workflows
- **Interactive features**: Real-time likes, comments, shares, and live chat functionality

### 4. AI-Powered Product Intelligence System

- **Product comparison engine**: AI-driven insights and recommendations for product comparisons
- **Dynamic insight generation**: Leverage existing insight tables for personalized recommendations
- **Smart product matching**: Algorithm-based product similarity and alternatives
- **Price intelligence**: Dynamic pricing insights and trend analysis
- **Review sentiment analysis**: AI processing of reviews for intelligent insights
- **Video content recommendations**: AI-powered content discovery and personalized feeds

### 5. Premium Content & Subscription Management

- **Multi-tier subscriptions**: Flexible premium content access with monthly/yearly billing
- **Content gating**: Dynamic premium content access control based on subscription status
- **Creator monetization**: Revenue sharing and analytics for content creators
- **Premium analytics**: Advanced insights for premium subscribers and creators
- **Subscription lifecycle**: Automated billing, renewals, cancellations, and grace periods

### 6. Step-by-Step Backend Development Approach

**Phase 1: Core Database Connection & Authentication**

1. Set up database abstraction layer based on `database.sql`
2. Implement JWT authentication system
3. Create user management endpoints
4. Test database connectivity for user table

**Phase 2: Multi-Brand Product Management**

1. Brand API integration service (Shopify, WooCommerce, BigCommerce, etc.)
2. Product data normalization and unification
3. Manual seller product management
4. Inventory synchronization across all sources
5. Test each table connection individually

**Phase 3: Video Content Infrastructure**

1. Video upload and processing pipeline
2. Reels creation and management system
3. Live streaming infrastructure setup
4. Premium content gating implementation
5. Video storage and CDN integration

**Phase 4: Enhanced Commerce & Social Features**

1. Order management with multi-brand support
2. Social interactions (follows, likes, comments, posts)
3. Real-time messaging and notifications
4. AI-powered product recommendations
5. Video-based social interactions and engagement

**Phase 5: Advanced Features**

1. **AI recommendations** using existing insight tables
2. **Advanced analytics** with cross-shard aggregation
3. **Loyalty programs** and gamification
4. **Advanced advertising** system
5. **Premium content** subscriptions
6. **Live streaming monetization** features

**Phase 6: Frontend Integration & Performance Optimization**

1. Connect authentication frontend with JWT backend
2. Multi-brand product catalog integration
3. AI-powered product comparison page
4. Video content creation and consumption interfaces
5. Live streaming and premium content components
6. Social features frontend connection
7. Admin dashboard integration
8. Performance optimization to meet target metrics

### 7. JWT Authentication Implementation

- **Custom JWT system**: Implement secure JWT authentication
- **Token management**: Access tokens with refresh token rotation
- **Role-based access**: Admin, seller, user, content-creator, premium-subscriber role management
- **Security features**: Password hashing, rate limiting, account lockout
- **Session management**: Secure token storage and validation middleware

### Password hashing (Argon2) — production recommendations

We use Argon2id for password hashing. For production, choose conservative parameters that balance security and server capacity. Example recommended env variables for production:

- ARGON_MEMORY_COST=131072 # KiB (128 MiB)
- ARGON_TIME_COST=4 # iterations
- ARGON_PARALLELISM=2 # threads

For CI or local test runs you can use smaller settings to keep test times reasonable (these are automatically used when `NODE_ENV=test`):

- ARGON_MEMORY_COST=16384 # KiB (16 MiB)
- ARGON_TIME_COST=2
- ARGON_PARALLELISM=1

Set these in your deployment environment (e.g., as Secrets or environment variables in your host).

### 8. Multi-Brand API Integration Architecture

```javascript
// Brand API orchestration service structure
class BrandAPIOrchestrator {
  constructor() {
    this.adapters = new Map(); // Different brand API adapters
    this.rateLimiters = new Map(); // Per-brand rate limiting
    this.syncScheduler = new CronScheduler(); // Automated sync scheduling
  }

  async fetchProducts(brandId, options = {}) {
    /* implementation */
  }
  async syncBrandCatalog(brandId) {
    /* implementation */
  }
  async normalizeProductData(rawData, brandAdapter) {
    /* implementation */
  }
  async resolveProductConflicts(products) {
    /* implementation */
  }
}

// Product unification service
class ProductUnificationService {
  async mergeApiAndManualProducts() {
    /* implementation */
  }
  async detectDuplicates() {
    /* implementation */
  }
  async scoreProductQuality() {
    /* implementation */
  }
}
```

### 9. Video Content Processing Architecture

```javascript
// Video processing service
class VideoProcessingService {
  constructor() {
    this.encoder = new VideoEncoder();
    this.thumbnailGenerator = new ThumbnailGenerator();
    this.contentModerator = new ContentModerator();
  }

  async processReel(videoFile, userId) {
    const processedVideo = await this.encoder.encodeVideo(videoFile);
    const thumbnail = await this.thumbnailGenerator.generate(processedVideo);
    const moderationResult = await this.contentModerator.analyze(
      processedVideo
    );

    return {
      videoUrl: processedVideo.url,
      thumbnailUrl: thumbnail.url,
      moderationStatus: moderationResult.status,
      duration: processedVideo.duration,
    };
  }
}

// Live streaming service
class LiveStreamingService {
  async startStream(streamerId, streamConfig) {
    /* WebRTC stream initialization */
  }

  async manageViewers(streamId) {
    /* Real-time viewer management */
  }

  async handleLiveChat(streamId, message) {
    /* Live chat processing */
  }
}

// Premium content service
class PremiumContentService {
  async validateAccess(userId, contentId) {
    /* Check subscription status and content tier */
  }

  async gateContent(contentId, userSubscription) {
    /* Dynamic content gating logic */
  }
}
```

## Technical Requirements

### Backend Structure (JavaScript)

```
server/
├── config/
│   ├── database.js          # Database provider abstraction
│   ├── auth.js              # JWT configuration
│   ├── storage.js           # File storage abstraction
│   ├── brands.js            # Brand API configurations
│   ├── streaming.js         # Video streaming configuration
│   ├── premium.js           # Premium content configuration
│   └── environment.js       # Environment management
├── services/
│   ├── database/            # Database abstraction layer
│   │   ├── providers/       # Different DB providers (supabase, aws-rds, etc.)
│   │   ├── migrations/      # Database-agnostic migrations from database.sql
│   │   └── queries/         # Reusable query builders
│   ├── brands/              # Multi-brand API integration
│   │   ├── adapters/        # Individual brand API adapters
│   │   ├── orchestrator.js  # Central brand management
│   │   ├── normalizer.js    # Product data normalization
│   │   └── sync.js          # Real-time synchronization
│   ├── media/               # Video & multimedia processing
│   │   ├── videoProcessor.js # Video encoding, compression, thumbnails
│   │   ├── streamingService.js # Live streaming management
│   │   ├── reelsService.js  # Short-form video management
│   │   ├── contentModerator.js # AI-powered content moderation
│   │   └── transcoding.js   # Video format conversion
│   ├── live/                # Live streaming features
│   │   ├── liveSessionManager.js # Live session orchestration
│   │   ├── viewerManager.js # Live viewer tracking
│   │   ├── chatService.js   # Live chat integration
│   │   └── recordingService.js # Live stream recording
│   ├── premium/             # Premium content management
│   │   ├── subscriptionService.js # Premium subscription logic
│   │   ├── contentGating.js # Premium content access control
│   │   ├── tierManager.js   # Content tier management
│   │   └── analyticsService.js # Premium content analytics
│   ├── ai/                  # AI-powered features
│   │   ├── recommendations.js # Product recommendation engine
│   │   ├── insights.js      # Product insight generation
│   │   ├── comparison.js    # Product comparison algorithms
│   │   ├── sentiment.js     # Review sentiment analysis
│   │   └── contentRecommendations.js # Video content recommendations
│   ├── auth/                # JWT authentication service
│   ├── storage/             # File storage abstraction
│   ├── notifications/       # Real-time notifications
│   │   ├── pushNotifications.js # Push notifications for lives/reels
│   │   └── liveNotifications.js # Real-time live stream alerts
│   └── realtime/            # Custom WebSocket implementation
├── controllers/
│   ├── auth.js              # Authentication endpoints
│   ├── users.js             # User management
│   ├── products.js          # Unified product management (API + Manual)
│   ├── brands.js            # Brand API management
│   ├── orders.js            # Multi-brand order management
│   ├── social.js            # Social features
│   ├── insights.js          # AI insights and recommendations
│   ├── comparison.js        # Product comparison endpoints
│   ├── reels.js             # Reels CRUD operations
│   ├── live.js              # Live streaming endpoints
│   ├── premium.js           # Premium content management
│   ├── media.js             # Media upload/processing
│   └── admin.js             # Admin operations
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   ├── validation.js        # Request validation
│   ├── rateLimit.js         # Rate limiting (including brand APIs)
│   ├── brandApi.js          # Brand API request middleware
│   ├── videoUpload.js       # Video upload handling
│   ├── streamAuth.js        # Live streaming authentication
│   ├── premiumAccess.js     # Premium content access validation
│   ├── contentModeration.js # Automated content moderation
│   └── errorHandler.js      # Error handling
├── models/                  # Data models based on database.sql
│   ├── User.js
│   ├── Product.js           # Unified product model
│   ├── Brand.js             # Brand and API configuration
│   ├── Order.js             # Multi-brand order model
│   ├── Insight.js           # AI insights model
│   ├── SocialInteraction.js
│   ├── Reel.js              # Reels data model
│   ├── LiveStream.js        # Live stream sessions
│   ├── PremiumContent.js    # Premium content model
│   ├── MediaAsset.js        # Media files management
│   ├── Subscription.js      # Premium subscriptions
│   └── ContentTier.js       # Content access tiers
├── adapters/                # Brand API specific adapters
│   ├── shopify.js
│   ├── woocommerce.js
│   ├── bigcommerce.js
│   ├── magento.js
│   └── custom.js            # For custom brand APIs
├── routes/                  # API route definitions
├── websocket/               # Real-time features
│   ├── liveStreamHandler.js # Live streaming WebSocket logic
│   ├── reelsInteraction.js  # Real-time reels interactions
│   └── premiumNotifications.js # Premium content notifications
├── utils/
│   ├── jwt.js               # JWT utilities
│   ├── encryption.js        # Password hashing utilities
│   ├── validation.js        # Input validation
│   ├── productMatcher.js    # Product matching algorithms
│   ├── priceAnalyzer.js     # Price intelligence utilities
│   ├── videoUtils.js        # Video processing utilities
│   └── database.js          # Database utilities
└── tests/                   # Test suites for each component
```

### Frontend Structure (JavaScript)

```
src/
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   ├── Avatar.jsx
│   │   ├── Spinner.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Toast.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Tabs.jsx
│   │   ├── Accordion.jsx
│   │   ├── Slider.jsx
│   │   ├── Rating.jsx
│   │   ├── Progress.jsx
│   │   ├── Tooltip.jsx
│   │   ├── Popover.jsx
│   │   ├── DatePicker.jsx
│   │   ├── ColorPicker.jsx
│   │   └── FileUpload.jsx
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── EmailVerification.jsx
│   │   ├── TwoFactorAuth.jsx
│   │   ├── SocialLogin.jsx
│   │   └── AuthGuard.jsx
│   ├── layout/                  # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navigation.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Breadcrumb.jsx
│   │   ├── SearchBar.jsx
│   │   └── UserMenu.jsx
│   ├── product/                 # Product-related components
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── ProductImages.jsx
│   │   ├── ProductVariants.jsx
│   │   ├── ProductReviews.jsx
│   │   ├── ProductComparison.jsx
│   │   ├── QuickView.jsx
│   │   ├── AddToCart.jsx
│   │   ├── AddToWishlist.jsx
│   │   ├── PriceDisplay.jsx
│   │   ├── StockIndicator.jsx
│   │   ├── ProductFilters.jsx
│   │   ├── ProductSort.jsx
│   │   ├── RecentlyViewed.jsx
│   │   └── RecommendedProducts.jsx
│   ├── cart/                    # Shopping cart components
│   │   ├── Cart.jsx
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── MiniCart.jsx
│   │   ├── SaveForLater.jsx
│   │   ├── CartRecommendations.jsx
│   │   └── EmptyCart.jsx
│   ├── checkout/                # Checkout components
│   │   ├── CheckoutProcess.jsx
│   │   ├── ShippingForm.jsx
│   │   ├── BillingForm.jsx
│   │   ├── PaymentForm.jsx
│   │   ├── OrderSummary.jsx
│   │   ├── ShippingOptions.jsx
│   │   ├── PromoCode.jsx
│   │   ├── PaymentMethods.jsx
│   │   ├── AddressBook.jsx
│   │   ├── GuestCheckout.jsx
│   │   └── OrderConfirmation.jsx
│   ├── order/                   # Order management components
│   │   ├── OrderHistory.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── OrderTracking.jsx
│   │   ├── OrderStatus.jsx
│   │   ├── OrderActions.jsx
│   │   ├── OrderTimeline.jsx
│   │   ├── ReturnRequest.jsx
│   │   └── OrderReview.jsx
│   ├── user/                    # User profile components
│   │   ├── Profile.jsx
│   │   ├── ProfileEdit.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Settings.jsx
│   │   ├── AddressBook.jsx
│   │   ├── PaymentMethods.jsx
│   │   ├── NotificationSettings.jsx
│   │   ├── SecuritySettings.jsx
│   │   ├── PreferenceSettings.jsx
│   │   └── AccountDeletion.jsx
│   ├── social/                  # Social features components
│   │   ├── Feed.jsx
│   │   ├── Post.jsx
│   │   ├── PostCreator.jsx
│   │   ├── PostActions.jsx
│   │   ├── Comments.jsx
│   │   ├── UserCard.jsx
│   │   ├── FollowButton.jsx
│   │   ├── SocialStats.jsx
│   │   ├── ShareModal.jsx
│   │   └── SocialSearch.jsx
│   ├── messaging/               # Messaging components
│   │   ├── MessagesList.jsx
│   │   ├── Conversation.jsx
│   │   ├── MessageInput.jsx
│   │   ├── MessageBubble.jsx
│   │   ├── VoiceMessage.jsx
│   │   ├── MediaMessage.jsx
│   │   ├── ContactList.jsx
│   │   ├── VideoCall.jsx
│   │   ├── AudioCall.jsx
│   │   ├── CallControls.jsx
│   │   └── GroupChat.jsx
│   ├── notifications/           # Notification components
│   │   ├── NotificationCenter.jsx
│   │   ├── NotificationItem.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── InAppNotification.jsx
│   │   ├── PushNotification.jsx
│   │   └── NotificationSettings.jsx
│   ├── search/                  # Search components
│   │   ├── SearchResults.jsx
│   │   ├── SearchFilters.jsx
│   │   ├── SearchSuggestions.jsx
│   │   ├── SearchHistory.jsx
│   │   ├── AdvancedSearch.jsx
│   │   ├── SearchBar.jsx
│   │   └── NoResults.jsx
│   ├── video/                   # Video components
│   │   ├── ReelsPlayer.jsx
│   │   ├── ReelsFeed.jsx
│   │   ├── ReelsCreator.jsx
│   │   ├── VideoUploader.jsx
│   │   ├── VideoEditor.jsx
│   │   ├── LiveStream.jsx
│   │   ├── LiveViewer.jsx
│   │   ├── StreamControls.jsx
│   │   ├── VideoCallUI.jsx
│   │   ├── PremiumPlayer.jsx
│   │   └── VideoFilters.jsx
│   ├── ai/                      # AI components
│   │   ├── AIAssistant.jsx
│   │   ├── ChatInterface.jsx
│   │   ├── ProductRecommendations.jsx
│   │   ├── SmartSearch.jsx
│   │   ├── PersonalShopper.jsx
│   │   ├── StyleMatcher.jsx
│   │   └── AIInsights.jsx
│   ├── group/                   # Group shopping components
│   │   ├── GroupPurchase.jsx
│   │   ├── GroupCreator.jsx
│   │   ├── GroupMembers.jsx
│   │   ├── GroupProgress.jsx
│   │   ├── GroupInvite.jsx
│   │   └── GroupChat.jsx
│   ├── designer/                # Designer components
│   │   ├── DesignerProfile.jsx
│   │   ├── DesignerPortfolio.jsx
│   │   ├── ProjectRequest.jsx
│   │   ├── CollaborationBoard.jsx
│   │   ├── DesignTools.jsx
│   │   └── ClientManagement.jsx
│   ├── seller/                  # Seller dashboard components
│   │   ├── SellerDashboard.jsx
│   │   ├── ProductManager.jsx
│   │   ├── OrderManager.jsx
│   │   ├── InventoryManager.jsx
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── ReviewsManager.jsx
│   │   ├── PromotionManager.jsx
│   │   └── SellerProfile.jsx
│   └── common/                  # Common components
│       ├── ErrorBoundary.jsx
│       ├── LoadingStates.jsx
│       ├── EmptyStates.jsx
│       ├── PageLoader.jsx
│       ├── InfiniteScroll.jsx
│       ├── VirtualList.jsx
│       ├── LazyImage.jsx
│       ├── SEOHead.jsx
│       ├── PWAInstall.jsx
│       └── Analytics.jsx
├── pages/                       # Page components
│   ├── Home.jsx                 # Homepage
│   ├── ProductCatalog.jsx       # Product listing page
│   ├── ProductDetail.jsx        # Individual product page
│   ├── CategoryPage.jsx         # Category browsing
│   ├── BrandPage.jsx            # Brand pages
│   ├── SearchResults.jsx        # Search results
│   ├── Cart.jsx                 # Shopping cart page
│   ├── Checkout.jsx             # Checkout page
│   ├── Account.jsx              # User account page
│   ├── Orders.jsx               # Order history
│   ├── Wishlist.jsx            # Wishlist page
│   ├── Profile.jsx             # User profile
│   ├── Messages.jsx            # Messages page
│   ├── Feed.jsx                # Social feed
│   ├── LiveStreams.jsx         # Live streams
│   ├── Reels.jsx               # Reels page
│   ├── GroupShopping.jsx       # Group shopping
│   ├── Designers.jsx           # Designer directory
│   ├── SellerDashboard.jsx     # Seller dashboard
│   ├── Compare.jsx             # Product comparison
│   ├── About.jsx               # About page
│   ├── Contact.jsx             # Contact page
│   ├── Help.jsx                # Help/FAQ page
│   ├── Privacy.jsx             # Privacy policy
│   ├── Terms.jsx               # Terms of service
│   ├── Login.jsx               # Login page
│   ├── Signup.jsx              # Signup page
│   ├── ForgotPassword.jsx      # Password reset
│   ├── NotFound.jsx            # 404 page
│   └── Offline.jsx             # Offline page
├── hooks/                       # Custom React hooks
│   ├── auth/
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useLogin.js         # Login functionality
│   │   ├── useSignup.js        # Signup functionality
│   │   └── useLogout.js        # Logout functionality
│   ├── data/
│   │   ├── useProducts.js      # Product data fetching
│   │   ├── useCategories.js    # Category data
│   │   ├── useBrands.js        # Brand data
│   │   ├── useOrders.js        # Order data
│   │   ├── useCart.js          # Cart management
│   │   ├── useWishlist.js      # Wishlist management
│   │   ├── useSearch.js        # Search functionality
│   │   └── useRecommendations.js # Product recommendations
│   ├── social/
│   │   ├── useFeed.js          # Social feed
│   │   ├── useMessages.js      # Messaging
│   │   ├── useNotifications.js # Notifications
│   │   ├── useFollowers.js     # Follow system
│   │   └── usePosts.js         # Post management
│   ├── media/
│   │   ├── useVideoUpload.js   # Video upload
│   │   ├── useImageUpload.js   # Image upload
│   │   ├── useMediaPlayer.js   # Media playback
│   │   └── useWebRTC.js        # WebRTC functionality
│   ├── ui/
│   │   ├── useModal.js         # Modal management
│   │   ├── useToast.js         # Toast notifications
│   │   ├── useTheme.js         # Theme management
│   │   ├── useLocalStorage.js  # Local storage
│   │   ├── useSessionStorage.js # Session storage
│   │   ├── useDebounce.js      # Debounced values
│   │   ├── useIntersection.js  # Intersection observer
│   │   ├── useClickOutside.js  # Click outside detection
│   │   └── useKeyboard.js      # Keyboard shortcuts
│   ├── performance/
│   │   ├── useInfiniteScroll.js # Infinite scrolling
│   │   ├── useVirtualList.js   # Virtual list
│   │   ├── useLazyLoading.js   # Lazy loading
│   │   └── useOptimistic.js    # Optimistic updates
│   └── utils/
│       ├── useGeolocation.js   # Geolocation
│       ├── useNetwork.js       # Network status
│       ├── useOnlineStatus.js  # Online/offline status
│       ├── useWindowSize.js    # Window size
│       ├── useDeviceType.js    # Device detection
│       └── usePWA.js           # PWA functionality
├── services/                    # API and external services
│   ├── api/
│   │   ├── auth.js             # Authentication API
│   │   ├── users.js            # User API
│   │   ├── products.js         # Products API
│   │   ├── categories.js       # Categories API
│   │   ├── brands.js           # Brands API
│   │   ├── cart.js             # Cart API
│   │   ├── orders.js           # Orders API
│   │   ├── payments.js         # Payments API
│   │   ├── social.js           # Social API
│   │   ├── messages.js         # Messages API
│   │   ├── notifications.js    # Notifications API
│   │   ├── search.js           # Search API
│   │   ├── media.js            # Media API
│   │   ├── ai.js               # AI API
│   │   └── analytics.js        # Analytics API
│   ├── rtk-query/              # RTK Query API definitions
│   │   ├── authApi.js
│   │   ├── productsApi.js
│   │   ├── cartApi.js
│   │   ├── ordersApi.js
│   │   ├── socialApi.js
│   │   ├── messagesApi.js
│   │   ├── notificationsApi.js
│   │   └── mediaApi.js
│   ├── websocket/              # WebSocket services
│   │   ├── connection.js       # WebSocket connection
│   │   ├── events.js           # Event handlers
│   │   ├── chat.js             # Chat functionality
│   │   ├── live.js             # Live streaming
│   │   └── notifications.js    # Real-time notifications
│   ├── storage/                # Storage services
│   │   ├── localStorage.js
│   │   ├── sessionStorage.js
│   │   ├── indexedDB.js
│   │   └── cloudStorage.js
│   ├── push/                   # Push notification services
│   │   ├── serviceWorker.js
│   │   ├── pushManager.js
│   │   └── notificationHandler.js
│   └── analytics/              # Analytics services
│       ├── googleAnalytics.js
│       ├── mixpanel.js
│       ├── customEvents.js
│       └── performance.js
├── store/                       # Redux store and state management
│   ├── slices/                 # Redux Toolkit slices
│   │   ├── authSlice.js        # Authentication state
│   │   ├── userSlice.js        # User data state
│   │   ├── cartSlice.js        # Shopping cart state
│   │   ├── wishlistSlice.js    # Wishlist state
│   │   ├── productSlice.js     # Product state
│   │   ├── searchSlice.js      # Search state
│   │   ├── socialSlice.js      # Social features state
│   │   ├── notificationSlice.js # Notifications state
│   │   ├── themeSlice.js       # Theme state
│   │   ├── settingsSlice.js    # User settings state
│   │   └── uiSlice.js          # UI state (modals, etc.)
│   ├── middleware/             # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── analyticsMiddleware.js
│   │   └── websocketMiddleware.js
│   ├── selectors/              # Reselect selectors
│   │   ├── authSelectors.js
│   │   ├── cartSelectors.js
│   │   ├── productSelectors.js
│   │   └── socialSelectors.js
│   ├── store.js                # Store configuration
│   ├── rootReducer.js          # Root reducer
│   └── persistConfig.js        # Redux persist configuration
├── contexts/                   # React contexts
│   ├── AuthContext.jsx         # Authentication context
│   ├── ThemeContext.jsx        # Theme context
│   ├── CartContext.jsx         # Shopping cart context
│   ├── NotificationContext.jsx # Notifications context
│   ├── WebSocketContext.jsx    # WebSocket context
│   └── PWAContext.jsx          # PWA context
├── utils/                      # Utility functions
│   ├── auth.js                 # Authentication utilities
│   ├── validation.js           # Form validation
│   ├── formatting.js           # Data formatting
│   ├── constants.js            # Application constants
│   ├── helpers.js              # General helpers
│   ├── dateUtils.js           # Date utilities
│   ├── priceUtils.js          # Price calculations
│   ├── imageUtils.js          # Image processing
│   ├── urlUtils.js            # URL utilities
│   ├── deviceUtils.js         # Device detection
│   ├── performanceUtils.js    # Performance utilities
│   └── seoUtils.js            # SEO utilities
├── styles/                     # Styling
│   ├── globals.css            # Global styles
│   ├── variables.css          # CSS variables
│   ├── components/            # Component styles
│   ├── pages/                 # Page-specific styles
│   ├── themes/                # Theme definitions
│   │   ├── light.css
│   │   ├── dark.css
│   │   └── custom.css
│   └── responsive/            # Responsive styles
│       ├── mobile.css
│       ├── tablet.css
│       └── desktop.css
├── assets/                     # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   ├── videos/
│   └── sounds/
├── public/                     # Public assets
│   ├── favicon.ico
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── robots.txt
│   └── sitemap.xml
├── tests/                      # Test files
│   ├── components/            # Component tests
│   ├── pages/                 # Page tests
│   ├── hooks/                 # Hook tests
│   ├── utils/                 # Utility tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # End-to-end tests
│   └── __mocks__/             # Mock files
└── docs/                       # Documentation
    ├── components.md          # Component documentation
    ├── hooks.md               # Hook documentation
    ├── state-management.md    # State management guide
    └── deployment.md          # Deployment guide
```

## Additional Database Schema for Video Content Features

Since the backend should be implemented based on `database.sql`, these additional tables should be added if not already present:

```sql
-- Video content tables
CREATE TABLE reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT,
    description TEXT,
    duration INTEGER, -- in seconds
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_tier_id UUID REFERENCES premium_tiers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Live streaming tables
CREATE TABLE live_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    streamer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    stream_key TEXT UNIQUE NOT NULL,
    rtmp_url TEXT,
    hls_url TEXT,
    status stream_status DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    max_viewers INTEGER DEFAULT 0,
    current_viewers INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_tier_id UUID REFERENCES premium_tiers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Premium content tiers
CREATE TABLE premium_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_interval tier_interval NOT NULL, -- monthly, yearly
    features JSONB, -- Premium features as JSON
    max_concurrent_streams INTEGER DEFAULT 1,
    max_video_quality VARCHAR(10) DEFAULT '720p', -- 480p, 720p, 1080p, 4k
    ad_free BOOLEAN DEFAULT FALSE,
    early_access BOOLEAN DEFAULT FALSE,
    exclusive_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User premium subscriptions
CREATE TABLE premium_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES premium_tiers(id) ON DELETE CASCADE,
    status subscription_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renewal BOOLEAN DEFAULT TRUE,
    payment_method_id TEXT,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    total_amount_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video interactions (likes, views, shares)
CREATE TABLE video_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID, -- Can reference reels or other video content
    video_type video_content_type NOT NULL, -- 'reel', 'premium_video', etc.
    interaction_type interaction_type NOT NULL, -- 'like', 'view', 'share', 'comment'
    metadata JSONB, -- Additional interaction data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Live stream viewers tracking
CREATE TABLE live_stream_viewers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    watch_duration INTEGER DEFAULT 0, -- in seconds
    interactions_count INTEGER DEFAULT 0, -- chat messages, likes, etc.
    UNIQUE(stream_id, viewer_id)
);

-- Live stream chat messages
CREATE TABLE live_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type chat_message_type DEFAULT 'text',
    metadata JSONB, -- For emojis, mentions, etc.
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content creator earnings tracking
CREATE TABLE creator_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID, -- References to reels, live_streams, or premium content
    content_type video_content_type NOT NULL,
    revenue_type revenue_type NOT NULL, -- 'subscription', 'tip', 'ad_share', 'sponsor'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payout_status payout_status DEFAULT 'pending',
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Video processing jobs
CREATE TABLE video_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID, -- References source video
    video_type video_content_type NOT NULL,
    job_type processing_job_type NOT NULL, -- 'encoding', 'thumbnail', 'moderation'
    status job_status DEFAULT 'pending',
    input_url TEXT NOT NULL,
    output_url TEXT,
    processing_options JSONB, -- Encoding settings, quality options, etc.
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content moderation results
CREATE TABLE content_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type moderation_content_type NOT NULL, -- 'reel', 'live_stream', 'comment', 'chat_message'
    moderation_type moderation_type NOT NULL, -- 'automated', 'manual', 'user_report'
    status moderation_status DEFAULT 'pending',
    flags JSONB, -- Array of detected issues
    confidence_score DECIMAL(3,2), -- For AI moderation confidence
    moderator_id UUID REFERENCES users(id), -- For manual moderation
    action_taken moderation_action, -- 'approved', 'rejected', 'flagged', 'restricted'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enums for video content features
CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled', 'paused');
CREATE TYPE tier_interval AS ENUM ('monthly', 'yearly', 'weekly');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'paused', 'trial');
CREATE TYPE video_content_type AS ENUM ('reel', 'live_stream', 'premium_video', 'story', 'tutorial');
CREATE TYPE interaction_type AS ENUM ('like', 'view', 'share', 'comment', 'bookmark', 'report');
CREATE TYPE chat_message_type AS ENUM ('text', 'emoji', 'system', 'gift', 'tip');
CREATE TYPE revenue_type AS ENUM ('subscription', 'tip', 'ad_share', 'sponsor', 'merchandise', 'donation');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE processing_job_type AS ENUM ('encoding', 'thumbnail', 'moderation', 'transcription', 'compression');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE moderation_content_type AS ENUM ('reel', 'live_stream', 'comment', 'chat_message', 'profile', 'product');
CREATE TYPE moderation_type AS ENUM ('automated', 'manual', 'user_report', 'system_flag');
CREATE TYPE moderation_status AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'escalated');
CREATE TYPE moderation_action AS ENUM ('approved', 'rejected', 'flagged', 'restricted', 'banned', 'shadow_banned');

-- Indexes for performance optimization
CREATE INDEX idx_reels_user_created ON reels(user_id, created_at DESC);
CREATE INDEX idx_reels_premium_tier ON reels(is_premium, premium_tier_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_streamer ON live_streams(streamer_id, status);
CREATE INDEX idx_video_interactions_user_type ON video_interactions(user_id, video_type, interaction_type);
CREATE INDEX idx_live_chat_stream_created ON live_chat_messages(stream_id, created_at);
CREATE INDEX idx_creator_earnings_creator_type ON creator_earnings(creator_id, content_type, created_at DESC);
CREATE INDEX idx_content_moderation_status ON content_moderation(content_type, status);
CREATE INDEX idx_video_processing_status ON video_processing_jobs(status, created_at);

-- Views for analytics and reporting
CREATE VIEW creator_performance AS
SELECT
    u.id as creator_id,
    u.username,
    COUNT(DISTINCT r.id) as total_reels,
    COUNT(DISTINCT ls.id) as total_streams,
    COALESCE(SUM(r.views_count), 0) as total_views,
    COALESCE(SUM(r.likes_count), 0) as total_likes,
    COALESCE(SUM(ce.amount), 0) as total_earnings
FROM users u
LEFT JOIN reels r ON u.id = r.user_id
LEFT JOIN live_streams ls ON u.id = ls.streamer_id
LEFT JOIN creator_earnings ce ON u.id = ce.creator_id
WHERE u.role IN ('content-creator', 'premium-creator')
GROUP BY u.id, u.username;

CREATE VIEW premium_subscription_analytics AS
SELECT
    pt.id as tier_id,
    pt.name as tier_name,
    pt.price,
    pt.billing_interval,
    COUNT(ps.id) as active_subscriptions,
    SUM(ps.total_amount_paid) as total_revenue,
    AVG(EXTRACT(days FROM (ps.expires_at - ps.started_at))) as avg_subscription_days
FROM premium_tiers pt
LEFT JOIN premium_subscriptions ps ON pt.id = ps.tier_id AND ps.status = 'active'
GROUP BY pt.id, pt.name, pt.price, pt.billing_interval;
```

## Step-by-Step Development Plan

### Phase 1: Database Connection & User Authentication (Week 1-2)

1. **Database Service Setup Based on database.sql**

   ```javascript
   // Implement all tables from database.sql
   // Test database connection for each table
   // Create comprehensive CRUD operations
   // Implement JWT authentication
   // Test user registration/login with proper role management
   ```

2. **Authentication Endpoints**

   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/refresh
   - POST /api/auth/logout
   - GET /api/auth/profile

3. **Testing Checklist**
   - [ ] Database connection successful for all tables
   - [ ] User registration works with role assignment (including content-creator roles)
   - [ ] JWT token generation/validation
   - [ ] Password hashing secure
   - [ ] Login/logout functionality

### Phase 2: Multi-Brand Product Management (Week 3-5)

1. **Brand API Integration Service**

   ```javascript
   // Brand API adapters for major platforms
   // Product data normalization engine
   // Real-time synchronization scheduler
   // Conflict resolution algorithms
   ```

2. **Unified Product Management**

   - Brand configuration and API credential management
   - Product data unification (API + Manual)
   - Inventory synchronization across all sources
   - Duplicate detection and quality scoring

3. **API Endpoints**

   - GET /api/brands - Brand management
   - POST /api/brands/sync/{brandId} - Trigger brand sync
   - GET /api/products - Unified product catalog
   - POST /api/products - Manual product creation
   - PUT /api/products/merge - Product conflict resolution

4. **Testing Each Integration**
   - [ ] Brand API adapters working
   - [ ] Product normalization accurate
   - [ ] Manual and API products unified
   - [ ] Sync mechanisms functional
   - [ ] Duplicate detection working

### Phase 3: Video Content Infrastructure (Week 6-8)

1. **Video Upload and Processing Pipeline**

   ```javascript
   // Video encoding and compression service
   // Thumbnail generation automation
   // Multiple format output (HLS, MP4, WebM)
   // CDN integration for video delivery
   // Content moderation integration
   ```

2. **Reels Management System**

   - Short-form vertical video creation
   - AI-powered content recommendations
   - Real-time engagement tracking
   - Video effects and filters integration

3. **Live Streaming Infrastructure**

   - WebRTC implementation for real-time streaming
   - RTMP server integration
   - Live chat system with real-time messaging
   - Viewer management and analytics
   - Stream recording and VOD conversion

4. **Premium Content Gating**

   - Subscription tier management
   - Dynamic content access control
   - Payment processing integration
   - Creator monetization tracking

5. **API Endpoints**

   - POST /api/reels - Create new reel
   - GET /api/reels/feed - Get personalized reels feed
   - POST /api/live/start - Start live stream
   - GET /api/live/viewers/:streamId - Get live viewer count
   - POST /api/premium/subscribe - Subscribe to premium tier
   - GET /api/premium/content - Get premium content library

6. **Testing Video Features**
   - [ ] Video upload and processing working
   - [ ] Reels creation and playback functional
   - [ ] Live streaming start/stop operations
   - [ ] Premium content gating effective
   - [ ] Real-time interactions working

### Phase 4: Enhanced Commerce & Social Features (Week 9-11)

1. **Multi-Brand Order Management**

   - Orders spanning multiple brands
   - Split payment processing
   - Brand-specific fulfillment tracking
   - Video-based product showcases

2. **Social Features with Video Integration**

   - User profiles with video content
   - Posts, comments, likes system for videos
   - Real-time messaging with media sharing
   - Product sharing through video content
   - Social commerce integration

3. **AI-Powered Insights for Video Content**

   - Video content recommendation engine using insight tables
   - Dynamic price intelligence in video descriptions
   - Review sentiment analysis for video reviews
   - Personalized video shopping experiences

4. **API Endpoints**

   - GET /api/social/feed - Unified social media feed
   - POST /api/social/share - Share products via video
   - GET /api/insights/video-recommendations - AI video recommendations
   - POST /api/orders/video-driven - Create orders from video content

### Phase 5: Advanced Features (Week 12-14)

1. **AI Recommendations** using existing insight tables

   ```javascript
   // Video content recommendation algorithms
   // Collaborative filtering for video preferences
   // Content-based video recommendations
   // Hybrid recommendation systems
   // Real-time personalization for video feeds
   ```

2. **Advanced Analytics** with cross-shard aggregation

   - Multi-dimensional analytics for video content
   - Creator performance metrics
   - Video engagement analysis
   - Revenue attribution from video content
   - Premium subscription analytics

3. **Monetization Features**

   - Creator revenue sharing programs
   - Tip and donation systems for live streams
   - Sponsored content integration
   - Affiliate marketing through video content
   - Premium subscription tiers with exclusive content

4. **Advanced Video Features**

   - Live shopping integration
   - Interactive video elements
   - Video-based product comparisons
   - AR/VR integration for product visualization
   - Multi-language video content support

5. **Content Creator Tools**

   - Advanced video editing capabilities
   - Analytics dashboard for creators
   - Monetization tracking and payouts
   - Audience insights and engagement metrics
   - Content scheduling and automation

### Phase 6: Frontend Integration & Performance Optimization (Week 15-17)

1. **Authentication Integration**

   - JWT token management in React
   - Role-based UI rendering
   - Protected routes for premium content

2. **Multi-Brand Product Catalog Connection**

   - Unified product display components
   - Brand-specific filtering and sorting
   - Real-time inventory updates

3. **Video Content Creation and Consumption Interfaces**

   - Reels creation interface with effects
   - Live streaming dashboard for creators
   - Premium content player with access control
   - Video-based product showcase components

4. **AI-Powered Product Comparison Page**

   - Side-by-side product comparison
   - AI-generated insights and recommendations
   - Price history and trend analysis
   - User review sentiment summary
   - Video review integration

5. **Social Features Integration**

   - Real-time social interactions
   - Video-based social commerce
   - Live chat integration
   - Social sharing capabilities

6. **Admin Dashboard Connection**

   - Content moderation tools
   - Creator management system
   - Analytics and reporting dashboards
   - Premium subscription management

7. **Performance Optimization**
   - Video streaming optimization
   - Lazy loading for video content
   - CDN integration for global delivery
   - Progressive video loading
   - Caching strategies for video metadata

## New API Endpoints for Video Features

```javascript
// Reels endpoints
GET    /api/reels                    // Get personalized reels feed
POST   /api/reels                    // Create new reel
GET    /api/reels/:id                // Get specific reel
PUT    /api/reels/:id                // Update reel details
DELETE /api/reels/:id                // Delete reel
POST   /api/reels/:id/like           // Like/unlike reel
POST   /api/reels/:id/comment        // Comment on reel
POST   /api/reels/:id/share          // Share reel
GET    /api/reels/:id/analytics      // Get reel analytics

// Live streaming endpoints
GET    /api/live/streams             // Get live streams
POST   /api/live/start               // Start live stream
POST   /api/live/end/:id             // End live stream
GET    /api/live/stream/:id          // Get stream details
PUT    /api/live/stream/:id          // Update stream info
DELETE /api/live/stream/:id          // Delete stream
GET    /api/live/viewers/:id         // Get current viewers
POST   /api/live/chat/:id            // Send chat message
GET    /api/live/chat/:id            // Get chat history
POST   /api/live/tip/:id             // Send tip to streamer

// Premium content endpoints
GET    /api/premium/tiers            // Get premium tiers
POST   /api/premium/subscribe        // Subscribe to premium
PUT    /api/premium/subscription     // Update subscription
DELETE /api/premium/subscription     // Cancel subscription
GET    /api/premium/content          // Get premium content
POST   /api/premium/validate         // Validate premium access
GET    /api/premium/analytics        // Get premium analytics

// Video processing endpoints
POST   /api/video/upload             // Upload video file
GET    /api/video/processing/:id     // Check processing status
POST   /api/video/thumbnail          // Generate thumbnail
POST   /api/video/transcode          // Request video transcoding

// Creator management endpoints
GET    /api/creator/dashboard        // Get creator analytics
GET    /api/creator/earnings         // Get earnings summary
POST   /api/creator/payout           // Request payout
GET    /api/creator/audience         // Get audience insights
POST   /api/creator/schedule         // Schedule content

// Content moderation endpoints
POST   /api/moderation/report        // Report content
GET    /api/moderation/queue         // Get moderation queue (admin)
POST   /api/moderation/review        // Review content (admin)
PUT    /api/moderation/action        // Take moderation action (admin)

// Social video endpoints
GET    /api/social/video-feed        // Get video-centric social feed
POST   /api/social/video-post        // Create video post
GET    /api/social/trending-videos   // Get trending video content
POST   /api/social/video-challenge   // Create video challenge
GET    /api/social/challenges        // Get active challenges
```

## Environment Configuration

```env
# Database Configuration (works with any PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname
# OR for Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Brand API Configurations
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_SECRET=your_shopify_secret
WOOCOMMERCE_API_KEY=your_woocommerce_key
WOOCOMMERCE_SECRET=your_woocommerce_secret
BIGCOMMERCE_API_KEY=your_bigcommerce_key
MAGENTO_API_KEY=your_magento_key

# Video & Streaming Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
AWS_S3_BUCKET=your_video_bucket
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# Live Streaming Configuration
RTMP_SERVER_URL=rtmp://your-streaming-server.com/live
HLS_BASE_URL=https://your-cdn.com/hls
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=turn:your-turn-server.com:3478
WEBRTC_TURN_USERNAME=your_turn_username
WEBRTC_TURN_CREDENTIAL=your_turn_credential
STREAMING_SECRET_KEY=your_streaming_secret

# AI and Analytics
OPENAI_API_KEY=your_openai_key  # For AI insights and content moderation
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token
CONTENT_MODERATION_API_KEY=your_moderation_api_key

# Storage Configuration (initially Supabase, easily changeable)
STORAGE_PROVIDER=supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Premium Content
PREMIUM_WEBHOOK_SECRET=your_premium_webhook_secret
CONTENT_ENCRYPTION_KEY=your_content_encryption_key

# Video Processing
FFMPEG_PATH=/usr/local/bin/ffmpeg
VIDEO_PROCESSING_QUEUE=video_processing
MAX_VIDEO_SIZE_MB=500
SUPPORTED_VIDEO_FORMATS=mp4,mov,avi,mkv,webm

# Performance and Monitoring
REDIS_URL=your_redis_url  # For caching and rate limiting
SENTRY_DSN=your_sentry_dsn
NEW_RELIC_LICENSE_KEY=your_newrelic_key

# Application Configuration
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000

# CDN Configuration
CDN_BASE_URL=https://your-cdn.com
VIDEO_CDN_URL=https://video-cdn.com
THUMBNAIL_CDN_URL=https://thumbnails-cdn.com

# Social Features
WEBSOCKET_PORT=8080
MAX_CONCURRENT_CONNECTIONS=10000
CHAT_MESSAGE_RATE_LIMIT=5 # messages per second per user

# Content Limits
MAX_REEL_DURATION=60 # seconds
MAX_LIVE_STREAM_DURATION=14400 # 4 hours in seconds
MAX_PREMIUM_VIDEO_SIZE=2048 # MB
THUMBNAIL_SIZES=150x150,300x300,600x600
```

## Key Dependencies (JavaScript)

```json
{
  "backend": {
    "express": "^4.18.0",
    "pg": "^8.8.0",
    "pg-pool": "^3.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^6.1.0",
    "express-rate-limit": "^6.7.0",
    "joi": "^17.9.0",
    "ws": "^8.13.0",
    "socket.io": "^4.7.0",
    "axios": "^1.4.0",
    "node-cron": "^3.0.2",
    "redis": "^4.6.0",
    "bull": "^4.10.0",
    "openai": "^4.0.0",
    "sentiment": "^5.0.2",
    "@supabase/supabase-js": "^2.26.0",
    "compression": "^1.7.4",
    "express-slow-down": "^1.6.0",
    "multer": "^1.4.5-lts.1",
    "fluent-ffmpeg": "^2.1.2",
    "sharp": "^0.32.0",
    "node-media-server": "^2.4.9",
    "simple-peer": "^9.11.1",
    "aws-sdk": "^2.1400.0",
    "cloudinary": "^1.37.0",
    "stripe": "^12.0.0",
    "@google-cloud/storage": "^6.10.0",
    "node-schedule": "^2.1.1",
    "nodemailer": "^6.9.0",
    "express-validator": "^7.0.0",
    "ioredis": "^5.3.0"
  },
  "frontend": {
    "react": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "axios": "^1.4.0",
    "react-query": "^3.39.0",
    "react-hook-form": "^7.44.0",
    "socket.io-client": "^4.7.0",
    "react-intersection-observer": "^9.4.0",
    "react-virtual": "^2.10.4",
    "web-vitals": "^3.3.0",
    "workbox-webpack-plugin": "^6.6.0",
    "react-player": "^2.12.0",
    "simple-peer": "^9.11.1",
    "react-webcam": "^7.1.1",
    "video.js": "^8.0.4",
    "videojs-contrib-hls": "^5.15.0",
    "hls.js": "^1.4.0",
    "@stripe/stripe-js": "^1.54.0",
    "@stripe/react-stripe-js": "^2.1.0",
    "framer-motion": "^10.12.0",
    "react-spring": "^9.7.0",
    "three": "^0.153.0",
    "@react-three/fiber": "^8.13.0",
    "react-dropzone": "^14.2.0",
    "react-infinite-scroll-component": "^6.1.0"
  }
}
```

## Performance Metrics to Achieve

### Video Content Performance Targets

- **Video First Frame**: < 1 second
- **Video Seek Time**: < 500ms
- **Live Stream Latency**: < 3 seconds
- **Reel Feed Load Time**: < 2 seconds
- **Video Upload Processing**: < 30 seconds for 1-minute video

### General Performance Targets

- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 3 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle size**: < 500KB (main chunk)
- **Video streaming bitrate adaptation**: < 5 seconds

### Optimization Strategies

- **Video-specific optimizations**:

  - Adaptive bitrate streaming (ABR)
  - Progressive video loading
  - Thumbnail preloading
  - Video CDN integration
  - Client-side video caching
  - Lazy loading for video feeds

- **General optimizations**:
  - Code splitting by brand and feature
  - Lazy loading of non-critical components
  - Image optimization and progressive loading
  - API response caching and compression
  - Database query optimization with video-specific indexes
  - WebSocket connection pooling for live features

## Testing Strategy

### Video Content Testing

1. **Video Processing Tests**: Upload, encoding, thumbnail generation, and format conversion
2. **Live Streaming Tests**: Stream start/stop, viewer management, chat functionality, and latency measurement
3. **Premium Content Tests**: Access control, subscription validation, and content gating
4. **Content Moderation Tests**: Automated flagging, manual review workflows, and action enforcement

### General Testing Strategy

1. **Unit Tests**: Each database operation, API endpoint, brand adapter, and video processing function
2. **Integration Tests**: Full authentication flow, brand sync, data unification, and video pipeline
3. **API Tests**: Complete CRUD operations for each entity, brand integration, and video endpoints
4. **Performance Tests**: Database query optimization, API response times, video streaming performance, and frontend metrics
5. **Load Tests**: Concurrent live streams, simultaneous video uploads, and peak user traffic simulation
6. **Security Tests**: Premium content access control, payment processing security, and video content protection

## Migration Strategy

**Current State → Target State**:

1. **Foundation Setup**

   - Start with Supabase for convenience
   - Build database-agnostic service layer based on database.sql
   - Add video content tables to existing schema

2. **Progressive Integration**

   - Implement brand API integrations progressively
   - Deploy video processing pipeline in stages
   - Test with local PostgreSQL and multiple brand APIs
   - Validate live streaming with limited concurrent users

3. **Scalability Preparation**
   - Easy migration to AWS RDS, Google Cloud SQL, or any PostgreSQL provider
   - CDN integration for global video delivery
   - Auto-scaling for video processing workloads
   - Database sharding strategy for high-volume video content

## Success Metrics

### Database and Core Features

- [ ] All tables from database.sql properly connected and tested
- [ ] JWT authentication fully functional with role management (including content-creator roles)
- [ ] Multi-brand API integration working (minimum 3 brand adapters)
- [ ] Product data unification system operational

### Video Content Features

- [ ] Video upload and processing pipeline functional
- [ ] Reels creation and feed system working
- [ ] Live streaming infrastructure operational
- [ ] Premium content gating and subscription system active
- [ ] Real-time video interactions working
- [ ] Content moderation system effective

### AI and Social Features

- [ ] AI-powered product comparison page functional
- [ ] Video content recommendation system working
- [ ] Social commerce integration complete
- [ ] Creator monetization tracking operational

### Technical Performance

- [ ] Each API endpoint tested individually
- [ ] Frontend successfully integrates with backend
- [ ] Real-time features working with custom WebSocket
- [ ] Video streaming performance metrics achieved
- [ ] General performance metrics achieved (< 2s FCP, < 3s LCP, < 0.1 CLS, < 100ms FID)

### Infrastructure and Deployment

- [ ] Easy database provider switching capability
- [ ] Video CDN integration successful
- [ ] Auto-scaling video processing pipeline
- [ ] Complete documentation for setup and deployment
- [ ] Production-ready deployment configuration

## AI-Powered Product Comparison Page Features

### Core Functionality Enhanced with Video

1. **Side-by-side comparison**: Visual comparison of up to 4 products with embedded video reviews
2. **AI-generated insights**: Intelligent analysis of product differences including video content analysis
3. **Price intelligence**: Historical pricing, trend analysis, and best deal identification
4. **Feature mapping**: Automatic categorization and comparison of product features from video descriptions
5. **Review sentiment analysis**: AI-processed review summaries with sentiment scores from video reviews
6. **Video-based recommendations**: "Better alternatives" and "Similar products" suggestions with video content
7. **Interactive video comparisons**: Side-by-side video reviews and demonstrations
8. **AI-powered video highlights**: Automatically generated key moments from product videos

### Technical Implementation

```javascript
// AI Comparison Service Enhanced
class ProductComparisonService {
  async generateComparison(productIds) {
    const products = await this.getProducts(productIds);
    const videoContent = await this.getProductVideos(productIds);
    const insights = await this.generateInsights(products, videoContent);
    const priceAnalysis = await this.analyzePricing(products);
    const reviewSentiment = await this.analyzeSentiment(products);
    const videoHighlights = await this.generateVideoHighlights(videoContent);

    return {
      products,
      videoContent,
      insights,
      priceAnalysis,
      reviewSentiment,
      videoHighlights,
      recommendations: await this.getRecommendations(productIds),
    };
  }

  async generateVideoHighlights(videoContent) {
    // AI analysis of video content to extract key product features
    // Timestamp-based highlights for quick navigation
    // Automated transcription and keyword extraction
  }
}

// Video-Enhanced Product Intelligence
class VideoProductIntelligence {
  async analyzeProductVideos(productId) {
    const videos = await this.getProductVideos(productId);
    const transcriptions = await this.transcribeVideos(videos);
    const keyFeatures = await this.extractFeaturesFromVideo(transcriptions);
    const sentimentAnalysis = await this.analyzePresentationSentiment(videos);

    return {
      keyFeatures,
      sentimentAnalysis,
      videoMetrics: {
        totalViews: videos.reduce((sum, v) => sum + v.views, 0),
        avgEngagement: this.calculateEngagement(videos),
        trustScore: this.calculateTrustScore(videos, sentimentAnalysis),
      },
    };
  }
}
```

## Content Creator Economy Features

### Creator Tools and Analytics

1. **Advanced Creator Dashboard**

   - Real-time performance metrics
   - Revenue tracking and forecasting
   - Audience demographics and behavior
   - Content performance optimization suggestions

2. **Monetization Features**

   - Multiple revenue streams (subscriptions, tips, sponsored content)
   - Automated payout system with tax reporting
   - Brand collaboration marketplace
   - Merchandise integration

3. **Content Management Tools**
   - Bulk content scheduling
   - Cross-platform publishing
   - Content series and playlist management
   - Collaborative content creation tools

### Brand Partnership Integration

1. **Sponsored Content System**

   - Brand campaign management
   - Performance tracking and ROI measurement
   - Automated disclosure compliance
   - Payment processing and dispute resolution

2. **Product Placement Analytics**
   - Video-based product placement tracking
   - Click-through and conversion measurement
   - Attribution modeling for influencer sales
   - Real-time campaign optimization

## Next Steps

1. **Phase 1**: Set up the database abstraction layer based on database.sql with video content extensions
2. **Phase 2**: Implement JWT authentication system with role management for creators
3. **Phase 3**: Create brand API integration service starting with major platforms
4. **Phase 4**: Build video processing pipeline and reels infrastructure
5. **Phase 5**: Implement live streaming capabilities with real-time features
6. **Phase 6**: Develop premium content gating and subscription management
7. **Phase 7**: Build product data unification and conflict resolution systems
8. **Phase 8**: Develop AI-powered insights, comparison features, and video recommendations
9. **Phase 9**: Test each functionality systematically without frontend
10. **Phase 10**: Integrate with existing frontend and develop video-centric components
11. **Phase 11**: Performance optimization to meet all target metrics including video streaming
12. **Phase 12**: Creator economy features and monetization systems

This comprehensive approach ensures a robust, scalable, and high-performance multi-brand social ecommerce platform with advanced video content capabilities, AI-powered features, and a thriving creator economy while maintaining flexibility for future enhancements and provider migrations.
