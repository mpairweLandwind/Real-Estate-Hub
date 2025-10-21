# Real Estate Management System

## Project Overview

A comprehensive full-stack real estate management platform that enables property owners, tenants, and administrators to efficiently manage properties, maintenance requests, payments, and property listings. The system provides a seamless experience for browsing properties, submitting maintenance requests, and handling property-related transactions.

##  Project Proposal

### Problem Statement

The real estate industry faces challenges in managing properties, maintenance requests, and tenant communications efficiently. Property owners struggle with:
- Tracking multiple properties and their maintenance status
- Managing tenant requests and communications
- Organizing property listings with accurate location data
- Handling payments and transaction records
- Providing multilingual support for diverse user bases

### Proposed Solution

Our Real Estate Management System is a modern web application that addresses these challenges by providing:

1. **Centralized Property Management** - Single dashboard for managing all properties
2. **Automated Maintenance Tracking** - Submit, track, and resolve maintenance requests efficiently
3. **Interactive Property Browsing** - Google Maps integration for location-based property search
4. **Secure Payment Processing** - Integrated payment system for transactions
5. **Multilingual Support** - Available in English, German, and French
6. **Cloud Storage** - Firebase integration for image uploads and storage

##  Key Features

### 1. Property Management
- **Add Properties**: Multi-step form with image uploads, location picker, and detailed specifications
- **Edit Properties**: Full CRUD operations with image management
- **Property Types**: Support for apartments, houses, commercial spaces, offices, and land
- **Listing Types**: Rent, sale, or both
- **Status Tracking**: Available, sold, rented status management

### 2. Maintenance Request System
- **Dual-Mode Property Selection**:
  - Select from existing properties
  - Register new property for maintenance-only purposes
- **Request Categories**: Plumbing, electrical, HVAC, carpentry, painting, cleaning, landscaping
- **Priority Levels**: Low, medium, high, urgent
- **Status Tracking**: Pending, in progress, completed, cancelled
- **Cost Estimation**: Track estimated and actual costs

### 3. Property Search & Browse
- **Interactive Map View**: Google Maps integration showing all available properties
- **Advanced Filters**:
  - City/location search with autocomplete
  - Property type filtering
  - Listing type filtering (rent/sale)
- **Property Cards**: Visual display with key details
- **Detailed Property Pages**: Full property information with images and location

### 4. User Management
- **Authentication**: Secure sign-up and login via Supabase
- **User Profiles**: Manage personal information and account settings
- **Role-Based Access**: Owner, tenant, and admin roles
- **Profile Pictures**: Upload and manage profile images

### 5. Payment System
- **Transaction Records**: Track all payments and transactions
- **Payment History**: Complete transaction history with status tracking
- **Revenue Tracking**: Dashboard statistics for completed transactions

### 6. Internationalization (i18n)
- **Multi-Language Support**: English, German, French
- **Dynamic Translation**: Real-time language switching
- **Localized Content**: All UI elements and messages translated

##  Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Internationalization**: next-intl
- **Notifications**: Sonner (toast notifications)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Firebase Storage (images)
- **API**: Next.js API Routes

### Maps & Geolocation
- **Maps Provider**: Google Maps JavaScript API
- **Features**: 
  - Interactive map with markers
  - Address autocomplete
  - Location picker with drag-and-drop markers
  - Reverse geocoding

### Development Tools
- **Package Manager**: Yarn (v3+ with Plug'n'Play)
- **Validation**: Zod
- **Date Handling**: date-fns
- **Code Quality**: ESLint, TypeScript

##  Database Schema

### Core Tables

#### 1. profiles
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- full_name (text)
- phone (text)
- user_type (text) - owner, tenant, admin
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. properties
```sql
- id (uuid, PK)
- owner_id (uuid, FK to profiles)
- title (text)
- description (text)
- property_type (text) - apartment, house, commercial, land, office
- listing_type (text) - rent, sale, both
- price (numeric)
- bedrooms (integer)
- bathrooms (numeric)
- area_sqft (numeric)
- address (text)
- city (text)
- state (text)
- country (text)
- postal_code (text)
- latitude (numeric)
- longitude (numeric)
- status (text) - available, sold, rented
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. property_images
```sql
- id (uuid, PK)
- property_id (uuid, FK to properties)
- image_url (text)
- is_primary (boolean)
- display_order (integer)
- created_at (timestamp)
```

#### 4. maintenance_requests
```sql
- id (uuid, PK)
- property_id (uuid, FK to properties)
- requester_id (uuid, FK to profiles)
- title (text)
- description (text)
- category (text) - plumbing, electrical, hvac, etc.
- priority (text) - low, medium, high, urgent
- status (text) - pending, in-progress, completed, cancelled
- estimated_cost (numeric)
- actual_cost (numeric)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. transactions
```sql
- id (uuid, PK)
- property_id (uuid, FK to properties)
- payer_id (uuid, FK to profiles)
- receiver_id (uuid, FK to profiles)
- amount (numeric)
- transaction_type (text)
- status (text)
- payment_method (text)
- created_at (timestamp)
```

##  Getting Started

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- Supabase account
- Firebase account
- Google Maps API key

### Environment Variables
Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd real-estate-app
```

2. **Install dependencies**
```bash
yarn install
```

3. **Set up Supabase database**
```bash
# Run the SQL scripts in the scripts folder
# In order: 001_create_profiles.sql through 006_create_indexes.sql
```

4. **Run development server**
```bash
yarn dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 📱 Application Structure

```
real-estate-app/
├── app/                          # Next.js app router
│   ├── api/                     # API routes
│   │   └── payments/            # Payment endpoints
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── sign-up-success/
│   ├── browse/                  # Property browsing
│   ├── dashboard/               # User dashboard
│   ├── maintenance/             # Maintenance requests
│   │   ├── create/
│   │   └── [id]/
│   ├── payments/                # Payment management
│   ├── profile/                 # User profile
│   │   └── edit/
│   └── properties/              # Property management
│       ├── add/
│       └── [id]/
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── address-autocomplete.tsx
│   ├── image-upload.tsx
│   ├── map-picker.tsx
│   ├── navigation.tsx
│   └── property-search-map.tsx
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
│   ├── firebase/
│   ├── supabase/
│   ├── i18n-config.ts
│   ├── utils.ts
│   └── validations.ts
├── locales/                     # Translation files
│   ├── en.json
│   ├── de.json
│   └── fr.json
├── scripts/                     # Database scripts
│   ├── 001_create_profiles.sql
│   ├── 002_create_properties.sql
│   ├── 003_create_property_images.sql
│   ├── 004_create_maintenance_requests.sql
│   ├── 005_create_transactions.sql
│   └── 006_create_indexes.sql
└── public/                      # Static assets
```

##  User Interface

### Key Pages

1. **Landing Page** - Overview and call-to-action
2. **Dashboard** - Statistics and quick actions
3. **Browse Properties** - Map view and list view with filters
4. **Property Details** - Full property information with image gallery
5. **Add Property** - 5-step wizard (Basic Info → Specifications → Location → Images → Review)
6. **Maintenance Requests** - Create and track maintenance
7. **Profile Management** - Edit user information

### Design Features
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Theme provider included
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeletons and spinners for better UX
- **Error Handling**: User-friendly error messages

##  Security Features

- **Row Level Security (RLS)**: Supabase RLS policies protect data
- **Authentication**: Secure user authentication via Supabase Auth
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: Zod schemas validate all form inputs
- **HTTPS**: Secure communication (production)

##  Internationalization

The application supports three languages:
- **English (en)**: Default language
- **German (de)**: Deutsche Übersetzung
- **French (fr)**: Traduction française

Users can switch languages using the language switcher in the navigation.

##  Future Enhancements

### Phase 2
- [ ] Real-time chat between owners and tenants
- [ ] Email notifications for maintenance updates
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered property recommendations
- [ ] Virtual property tours (360° images)

### Phase 3
- [ ] Contract management system
- [ ] Automated rent collection
- [ ] Tenant screening and background checks
- [ ] Integration with property management APIs
- [ ] Reporting and export functionality
- [ ] Bulk property import

##  User Roles & Permissions

### Property Owner
- Add, edit, delete properties
- View and manage maintenance requests
- Access payment history
- View analytics and reports

### Tenant
- Browse available properties
- Submit maintenance requests
- View payment history
- Manage profile

### Administrator
- Full system access
- User management
- Content moderation
- System configuration

##  Testing

```bash
# Run tests (when implemented)
yarn test

# Run E2E tests
yarn test:e2e

# Check types
yarn type-check

# Lint code
yarn lint
```

##  Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Other Platforms
- Compatible with any Node.js hosting
- Requires environment variables configuration
- Supports serverless and traditional deployments


##  Acknowledgments

- **Next.js Team** - Amazing React framework
- **Supabase Team** - Excellent backend-as-a-service
- **shadcn/ui** - Beautiful component library
- **Google Maps Platform** - Powerful mapping capabilities
- **Firebase** - Reliable cloud storage
- **Vercel** - Seamless deployment platform

---

**Built with  using Next.js, TypeScript, and Supabase**

**Version**: 1.0.0  
**Last Updated**: October 2025
