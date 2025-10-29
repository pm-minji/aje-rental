# Design Document

## Overview

아저씨 렌탈 서비스는 Next.js 14 기반의 풀스택 웹 애플리케이션으로 구현됩니다. App Router를 활용한 서버 사이드 렌더링과 클라이언트 사이드 상호작용을 조합하여 빠른 로딩과 SEO 최적화를 제공합니다. 반응형 디자인으로 모바일과 데스크톱 모두에서 최적의 사용자 경험을 제공합니다.

## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui 컴포넌트
- **State Management**: Zustand (전역 상태) + React Query (서버 상태)
- **Form Handling**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth (SNS 로그인 지원)

### Backend Architecture
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google, Kakao OAuth)
- **File Storage**: Supabase Storage (프로필 이미지)
- **Real-time**: Supabase Realtime Channels (요청 상태 업데이트)
- **API**: Next.js API Routes + Supabase Client SDK

### Deployment
- **Platform**: Vercel (Frontend + API)
- **Backend Services**: Supabase (Database, Auth, Storage, Realtime)
- **CDN**: Vercel Edge Network + Supabase CDN

## Components and Interfaces

### Core Components

#### 1. Layout Components
```typescript
// app/layout.tsx - 전역 레이아웃
interface RootLayoutProps {
  children: React.ReactNode;
}

// components/layout/Header.tsx - 네비게이션
interface HeaderProps {
  user?: User | null;
  isAuthenticated: boolean;
}

// components/layout/Footer.tsx - 푸터
interface FooterProps {
  showFullFooter?: boolean;
}
```

#### 2. 아저씨 관련 Components
```typescript
// components/ajussi/AjussiCard.tsx - 아저씨 카드
interface AjussiCardProps {
  ajussi: {
    id: string;
    name: string;
    title: string;
    profileImage: string;
    hourlyRate: number;
    location: string;
    tags: string[];
    description: string;
    rating: number;
    reviewCount: number;
  };
  onFavorite?: (id: string) => void;
}

// components/ajussi/AjussiDetail.tsx - 상세 페이지
interface AjussiDetailProps {
  ajussi: AjussiDetailType;
  reviews: Review[];
  currentUser?: User;
}

// components/ajussi/SearchFilter.tsx - 검색/필터
interface SearchFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}
```

#### 3. 요청 관련 Components
```typescript
// components/request/RequestModal.tsx - 요청 모달
interface RequestModalProps {
  ajussiId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateRequestData) => void;
}

// components/request/RequestCard.tsx - 요청 카드
interface RequestCardProps {
  request: RequestWithDetails;
  userType: 'client' | 'ajussi';
  onStatusChange: (requestId: string, status: RequestStatus) => void;
}
```

#### 4. 프로필 관련 Components
```typescript
// components/profile/ProfileForm.tsx - 프로필 수정
interface ProfileFormProps {
  user: User;
  isAjussi: boolean;
  onSubmit: (data: UpdateProfileData) => void;
}

// components/profile/AjussiStats.tsx - 아저씨 통계
interface AjussiStatsProps {
  stats: {
    monthlyRequests: number;
    acceptanceRate: number;
    completedCount: number;
    isActive: boolean;
  };
}
```

### API Interfaces

#### 1. Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication with Supabase Auth
interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}
```

#### 2. 아저씨 관련 APIs
```typescript
// app/api/ajussi/route.ts
interface GetAjussiListRequest {
  location?: string;
  tags?: string[];
  minRate?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
}

// app/api/ajussi/[id]/route.ts
interface AjussiDetailResponse {
  ajussi: AjussiDetail;
  reviews: Review[];
  averageRating: number;
}
```

#### 3. 요청 관리 APIs
```typescript
// app/api/requests/route.ts
interface CreateRequestData {
  ajussiId: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  description: string;
}

// app/api/requests/[id]/route.ts
interface UpdateRequestStatusData {
  status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
}
```

## Data Models

### Supabase Database Schema

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for request status
CREATE TYPE request_status AS ENUM (
  'PENDING',
  'CONFIRMED', 
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT,
  profile_image TEXT,
  introduction TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'ajussi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajussi profiles table
CREATE TABLE ajussi_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL,
  available_areas TEXT[] DEFAULT '{}',
  open_chat_url TEXT,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  availability_mask JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  ajussi_id UUID REFERENCES profiles(id) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status request_status DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) UNIQUE,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ajussi_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ajussi_id)
);

-- Indexes for performance
CREATE INDEX idx_ajussi_profiles_active ON ajussi_profiles(is_active);
CREATE INDEX idx_ajussi_profiles_rate ON ajussi_profiles(hourly_rate);
CREATE INDEX idx_ajussi_profiles_tags ON ajussi_profiles USING GIN(tags);
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_ajussi ON requests(ajussi_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_date ON requests(date);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajussi_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Ajussi profiles: Public read, owner write
CREATE POLICY "Anyone can view active ajussi profiles" ON ajussi_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own ajussi profile" ON ajussi_profiles FOR ALL USING (auth.uid() = user_id);

-- Requests: Only involved parties can access
CREATE POLICY "Users can view own requests" ON requests FOR SELECT USING (auth.uid() = client_id OR auth.uid() = ajussi_id);
CREATE POLICY "Clients can create requests" ON requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Involved parties can update requests" ON requests FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = ajussi_id);

-- Reviews: Public read, reviewer write
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Favorites: Owner only
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Functions for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ajussi_profiles_updated_at BEFORE UPDATE ON ajussi_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### TypeScript Types
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          nickname: string | null;
          profile_image: string | null;
          introduction: string | null;
          role: 'user' | 'ajussi';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      ajussi_profiles: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          hourly_rate: number;
          available_areas: string[];
          open_chat_url: string | null;
          is_active: boolean;
          tags: string[];
          availability_mask: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ajussi_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['ajussi_profiles']['Insert']>;
      };
      requests: {
        Row: {
          id: string;
          client_id: string;
          ajussi_id: string;
          date: string;
          duration: number;
          location: string;
          description: string;
          status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['requests']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          request_id: string;
          reviewer_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          ajussi_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>;
      };
    };
  };
}
```

## Error Handling

### Frontend Error Handling
```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
```

### API Error Responses
```typescript
// lib/api-response.ts
interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### Error Scenarios
1. **Authentication Errors**: 401 Unauthorized, 403 Forbidden
2. **Validation Errors**: 400 Bad Request with field-specific messages
3. **Not Found Errors**: 404 with user-friendly messages
4. **Server Errors**: 500 with generic error message
5. **Network Errors**: Offline detection and retry mechanisms

## Testing Strategy

### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, utilities, API handlers
- **Mock Strategy**: MSW for API mocking

### Integration Testing
- **Database**: Test database with Supabase
- **API Testing**: Supertest for API routes
- **Authentication**: Mock Supabase Auth sessions

### E2E Testing
- **Framework**: Playwright
- **Scenarios**: 
  - User registration and login flow
  - 아저씨 검색 and filtering
  - Request creation and management
  - Profile management

### Testing Structure
```
tests/
├── __mocks__/          # Mock configurations
├── unit/               # Unit tests
│   ├── components/     # Component tests
│   ├── lib/           # Utility function tests
│   └── api/           # API handler tests
├── integration/        # Integration tests
│   ├── api/           # API integration tests
│   └── database/      # Database tests
└── e2e/               # End-to-end tests
    ├── auth.spec.ts
    ├── ajussi-search.spec.ts
    └── request-flow.spec.ts
```

### Performance Testing
- **Lighthouse CI**: Performance, accessibility, SEO scores
- **Load Testing**: API endpoint stress testing
- **Bundle Analysis**: Bundle size monitoring

## Security Considerations

### Authentication & Authorization
- Supabase Auth with secure JWT tokens
- Row Level Security (RLS) policies for data access control
- Role-based access control (일반 사용자 vs 아저씨)
- OAuth integration with Google and Kakao

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention with Supabase client
- XSS protection with Content Security Policy
- Rate limiting with Supabase built-in protection
- Row Level Security for multi-tenant data isolation

### Privacy
- Personal data encryption at rest (Supabase managed)
- GDPR compliance with Supabase data deletion
- Secure file upload with Supabase Storage policies
- Location data anonymization

## Performance Optimization

### Frontend Optimization
- Next.js Image optimization for profile pictures
- Code splitting with dynamic imports
- Service Worker for offline functionality
- Lazy loading for 아저씨 cards

### Backend Optimization
- Database indexing on frequently queried fields (already configured in schema)
- Connection pooling with Supabase (managed automatically)
- Caching with Supabase Edge Functions for frequently accessed data
- Image optimization and CDN delivery with Supabase Storage

### SEO Optimization
- Server-side rendering for 아저씨 profiles
- Dynamic meta tags for social sharing
- Structured data for search engines
- Sitemap generation for 아저씨 profiles