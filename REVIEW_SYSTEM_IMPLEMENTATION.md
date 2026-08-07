# Alifat Connect Review System Implementation

This document describes the complete review system implementation for Alifat Connect.

## Overview

The review system allows registered users to submit reviews, which are then moderated by admins before appearing publicly on the homepage and customer reviews page.

## Features

### 1. Homepage Testimonials
- **Location**: Immediately after "How It Works" section
- **Display**: Exactly 3 approved customer reviews
- **Priority**: Featured reviews first, then newest approved reviews
- **Component**: `src/components/testimonials/testimonials-grid.tsx`
- **Data Source**: MongoDB (no hardcoded testimonials)

### 2. Customer Reviews Page
- **Route**: `/customer-reviews`
- **Features**:
  - All approved reviews with server-side pagination (12 per page)
  - Rating filter (5 stars, 4 stars, etc.)
  - Average rating summary (calculated from database)
  - Rating distribution breakdown
  - Responsive grid layout (3/2/1 cards per row)
  - "Write a Review" CTA for authenticated users

### 3. User Review Submission
- **Route**: `/dashboard/reviews`
- **Authentication**: Required (redirects to login if not authenticated)
- **Features**:
  - Star rating selection (1-5)
  - Text review (10-1000 characters)
  - Auto-linked to authenticated user account
  - Reviews start as "pending" status

### 4. Admin Review Management
- **API Routes**:
  - `GET /api/admin/reviews` - List all reviews with pagination
  - `POST /api/admin/reviews` - Create review (admin only)
  - `GET /api/admin/reviews/[id]` - Get single review
  - `PATCH /api/admin/reviews/[id]` - Update status or toggle featured
  - `DELETE /api/admin/reviews/[id]` - Delete review
- **Actions**: Approve, Reject, Feature, Unfeature, Delete

## Database Schema

### Review Model (`src/models/Review.ts`)
```typescript
{
  userId: string;           // Linked to authenticated user
  rating: number;           // 1-5 stars
  content: string;          // Review text (10-1000 chars)
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;      // Admin can feature reviews
  displayName: string;      // Public display name (e.g., "Olamilekan O.")
  avatar?: string;          // Optional user avatar
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes
- Compound index on `{ status: 1, isFeatured: -1, createdAt: -1 }`
- Compound index on `{ status: 1, rating: 1, createdAt: -1 }`

## API Endpoints

### Public Endpoints
- `GET /api/public/reviews?type=homepage` - Get 3 approved reviews for homepage
- `GET /api/public/reviews?type=paginated&page=1&limit=12&rating=5` - Get paginated reviews
- `GET /api/public/reviews?type=stats` - Get review statistics

### User Endpoints
- `POST /api/reviews` - Submit a new review (authenticated)

### Admin Endpoints
- `GET /api/admin/reviews` - List all reviews
- `POST /api/admin/reviews` - Create review (testing)
- `GET /api/admin/reviews/[id]` - Get single review
- `PATCH /api/admin/reviews/[id]` - Update review
- `DELETE /api/admin/reviews/[id]` - Delete review

## Privacy & Security

### Public Data Exposure
Only safe public information is exposed:
- ✅ rating, content, displayName, avatar, isFeatured, createdAt
- ❌ email, phone, wallet balance, NIN, BVN, address, password

### Display Name Format
User names are formatted to protect privacy:
- "Olamilekan O." instead of full name
- Auto-generated from User model (name, firstname, lastname)

### Authentication
- Reviews are linked to authenticated session userId
- Client-provided userId is not trusted
- Admin endpoints require admin role

## Setup Instructions

### 1. Seed Sample Reviews (Optional)
```bash
npm run seed-reviews
```
This will create 12 sample reviews linked to an existing user account.

### 2. Admin Review Management
Use the admin API endpoints to:
- Approve pending reviews
- Feature high-quality reviews
- Reject inappropriate content
- Delete spam or invalid reviews

### 3. User Review Submission
Authenticated users can submit reviews at `/dashboard/reviews`

## File Structure

```
src/
├── models/
│   └── Review.ts                          # MongoDB schema
├── lib/
│   └── reviews.ts                         # Reusable service functions
├── components/
│   └── testimonials/
│       └── testimonials-grid.tsx          # Homepage component (refactored)
├── app/
│   ├── page.tsx                           # Homepage (updated)
│   ├── customer-reviews/
│   │   ├── page.tsx                       # Customer reviews page
│   │   ├── CustomerReviewsPage.tsx        # Page component
│   │   ├── loading.tsx                    # Loading state
│   │   └── error.tsx                      # Error state
│   ├── dashboard/
│   │   └── reviews/
│   │       ├── page.tsx                   # Review submission page
│   │       └── ReviewSubmissionPage.tsx   # Submission component
│   └── api/
│       ├── public/
│       │   └── reviews/
│       │       └── route.ts               # Public reviews API
│       ├── reviews/
│       │   └── route.ts                   # User review submission API
│       └── admin/
│           └── reviews/
│               ├── route.ts               # Admin list/create
│               └── [id]/
│                   └── route.ts           # Admin single/update/delete
script/
    └── seed-reviews.ts                    # Seed script
```

## Review Moderation Workflow

1. **User submits review** → Status: `pending`
2. **Admin reviews** → Can approve, reject, or feature
3. **Approved reviews** → Visible on homepage and customer-reviews page
4. **Featured reviews** → Prioritized on homepage (shown first)

## Empty State Handling

- **Homepage**: If no approved reviews exist, the section is hidden
- **Customer Reviews Page**: Shows "No customer reviews yet" with CTA to write one

## Performance Considerations

- Homepage fetches only 3 reviews (limit=3)
- Customer reviews page uses server-side pagination (12 per page)
- Database indexes on status, isFeatured, createdAt, rating
- No unnecessary data fetched from MongoDB

## SEO

Customer reviews page includes:
- Title: "Customer Reviews | Alifat Connect"
- Description: "Read real customer reviews and experiences from Alifat Connect users"

## Next Steps

1. Run `npm run seed-reviews` to populate sample data
2. Test the review submission flow as a user
3. Use admin endpoints to approve/review reviews
4. Verify homepage displays exactly 3 approved reviews
5. Test customer reviews page pagination and filtering

## Notes

- The system uses the existing MongoDB connection (`src/lib/mongodb.ts`)
- UI components (Textarea, Skeleton, Button, Card) already exist in the project
- The review system integrates with existing authentication (NextAuth)
- Admin review management UI can be built using the provided API endpoints
