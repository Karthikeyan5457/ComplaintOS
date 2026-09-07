-- Enums
CREATE TYPE role_type AS ENUM ('USER', 'STAFF', 'ADMIN');
CREATE TYPE priority_type AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE complaint_status_type AS ENUM ('SUBMITTED', 'AI_ANALYSIS', 'CLASSIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED');
CREATE TYPE sentiment_type AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'VERY_NEGATIVE');

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role role_type DEFAULT 'USER',
  phone TEXT,
  avatar TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "departmentId" UUID,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "headId" UUID REFERENCES users(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to Users
ALTER TABLE users ADD CONSTRAINT fk_department FOREIGN KEY ("departmentId") REFERENCES departments(id);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "parentId" UUID REFERENCES categories(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints Table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "trackingId" TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  "contactInfo" TEXT,
  status complaint_status_type DEFAULT 'SUBMITTED',
  priority priority_type DEFAULT 'MEDIUM',
  "userId" UUID NOT NULL REFERENCES users(id),
  "categoryId" UUID REFERENCES categories(id),
  "departmentId" UUID REFERENCES departments(id),
  "assignedToId" UUID REFERENCES users(id),
  
  -- AI Analysis
  "aiAnalysis" JSONB,
  "aiCategory" TEXT,
  "aiSubcategory" TEXT,
  "aiPriority" TEXT,
  "aiDepartment" TEXT,
  "aiSummary" TEXT,
  "aiSuggestedResolution" TEXT,
  "aiSentiment" sentiment_type,
  "aiConfidence" FLOAT,
  "aiAnalyzedAt" TIMESTAMPTZ,
  "aiError" TEXT,

  -- SLA
  "slaDeadline" TIMESTAMPTZ,
  "slaBreached" BOOLEAN DEFAULT false,

  -- Resolution
  "resolutionNotes" TEXT,
  "resolvedAt" TIMESTAMPTZ,
  "closedAt" TIMESTAMPTZ,

  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Complaint History
CREATE TABLE complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "complaintId" UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  "oldValue" TEXT,
  "newValue" TEXT,
  "userId" UUID REFERENCES users(id),
  note TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  "isInternal" BOOLEAN DEFAULT false,
  "complaintId" UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fileName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  "complaintId" UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- SLA Rules
CREATE TABLE sla_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  priority priority_type UNIQUE NOT NULL,
  "responseHours" INTEGER NOT NULL,
  "resolutionHours" INTEGER NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  "isRead" BOOLEAN DEFAULT false,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "complaintId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
