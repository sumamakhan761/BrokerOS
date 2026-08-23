-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT', 'IMPORT', 'APPROVE', 'ASSIGN', 'MANAGE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ASSIGN', 'APPROVE', 'REJECT', 'STATUS_CHANGE', 'EXPORT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_COMPLETED', 'NEGOTIATION', 'BOOKING', 'DOCUMENT', 'LOAN', 'AGREEMENT', 'HANDOVER', 'LOST');

-- CreateEnum
CREATE TYPE "LeadTemperature" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "LeadSourceType" AS ENUM ('FACEBOOK_ADS', 'GOOGLE_ADS', 'INSTAGRAM', 'REFERRAL', 'ORGANIC', 'DIRECT_CALL', 'WALK_IN', 'CHANNEL_PARTNER', 'WHATSAPP', 'OTHER');

-- CreateEnum
CREATE TYPE "DistributionMethod" AS ENUM ('ROUND_ROBIN', 'MANUAL', 'PROJECT_WISE');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED', 'RESCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('CONNECTED', 'NOT_ANSWERED', 'BUSY', 'FAILED', 'VOICEMAIL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LEAD_ASSIGNED', 'FOLLOW_UP_REMINDER', 'MISSED_FOLLOW_UP', 'SITE_VISIT_ASSIGNED', 'SITE_VISIT_REMINDER', 'BOOKING_CONFIRMED', 'BOOKING_REQUEST', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'PAYMENT_DUE', 'PAYMENT_RECEIVED', 'DOCUMENT_REMINDER', 'TARGET_REMINDER', 'ANNOUNCEMENT', 'INVENTORY_CHANGED', 'MEETING_REMINDER', 'RECOGNITION', 'CHAT_MESSAGE', 'SITE_VISIT_ARRIVE', 'ACHIEVEMENT_MILESTONE', 'MONTHLY_ANALYTICS', 'MONTHLY_LEADERBOARD', 'MANAGER_TEAM_ALERT', 'PROJECT_ASSIGNED', 'COMMISSION_REMINDER', 'TASK_COMPLETED', 'INVENTORY_MILESTONE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'WHATSAPP_MESSAGE', 'FOLLOW_UP', 'SITE_VISIT', 'STATUS_CHANGE', 'NOTE_ADDED', 'ASSIGNMENT', 'BOOKING', 'PAYMENT', 'DOCUMENT_UPLOAD', 'NEGOTIATION', 'MEETING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "WhatsAppMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "WhatsAppMessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "WhatsAppMessageType" AS ENUM ('TEXT', 'TEMPLATE', 'IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'LOCATION', 'CONTACT', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPCOMING', 'UNDER_CONSTRUCTION', 'READY_TO_MOVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConstructionStatus" AS ENUM ('NOT_STARTED', 'EXCAVATION', 'FOUNDATION', 'SUPER_STRUCTURE', 'BRICKWORK', 'PLASTERING', 'FINISHING', 'READY_FOR_POSSESSION', 'HANDOVER');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BLOCKED', 'SOLD');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('STUDIO', 'ONE_BHK', 'TWO_BHK', 'THREE_BHK', 'FOUR_BHK', 'PENTHOUSE', 'VILLA', 'SHOP', 'OFFICE');

-- CreateEnum
CREATE TYPE "SiteVisitStatus" AS ENUM ('ASSIGNED', 'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "CustomerInterestLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "NegotiationStatus" AS ENUM ('OPEN', 'COUNTER_OFFERED', 'MANAGER_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'DOCUMENTATION_PENDING', 'PAYMENT_PENDING', 'LOAN_IN_PROGRESS', 'AGREEMENT_PENDING', 'AGREEMENT_COMPLETED', 'POSSESSION_PENDING', 'HANDOVER_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('DIRECT', 'CHANNEL_PARTNER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR', 'PAN', 'PASSPORT_PHOTO', 'ADDRESS_PROOF', 'INCOME_DOCUMENT', 'BOOKING_FORM', 'AGREEMENT_COPY', 'BANK_STATEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI', 'DEMAND_DRAFT', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('NOT_APPLIED', 'APPLIED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DISBURSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('NOT_STARTED', 'DRAFT_PREPARED', 'STAMP_DUTY_PAID', 'REGISTERED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PossessionStatus" AS ENUM ('NOT_READY', 'READY', 'SCHEDULED', 'HANDED_OVER');

-- CreateEnum
CREATE TYPE "BrokerStatus" AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'BLACKLISTED', 'NEW', 'CONTACTED', 'VISIT', 'DEAL');

-- CreateEnum
CREATE TYPE "BrokerageStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'DISPUTED', 'HELD');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('SALARY', 'MARKETING', 'OFFICE', 'TRAVEL', 'COMMISSION', 'LEGAL', 'RENT', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('DISCOUNT', 'SPECIAL_PRICING', 'BROKERAGE_SETTLEMENT', 'EXPENSE', 'REFUND', 'BOOKING_CANCELLATION', 'BOOKING');

-- CreateEnum
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InboundCommissionStatus" AS ENUM ('PENDING', 'RECEIVED');

-- CreateEnum
CREATE TYPE "ChatRoomType" AS ENUM ('DIRECT', 'TEAM', 'DEPARTMENT');

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "username" TEXT,
    "displayUsername" TEXT,
    "phoneNumber" TEXT,
    "employeeCode" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "departmentId" TEXT,
    "roleId" TEXT,
    "managerId" TEXT,
    "lastLatitude" DOUBLE PRECISION,
    "lastLongitude" DOUBLE PRECISION,
    "lastLocationAt" TIMESTAMP(3),
    "expoPushToken" TEXT,
    "isOnCall" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" "PermissionAction" NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_target" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "targetCalls" INTEGER,
    "targetFollowUps" INTEGER,
    "targetSiteVisits" INTEGER,
    "targetBookings" INTEGER,
    "targetRevenue" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_recognition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "awardType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "metric" TEXT,
    "metricValue" DECIMAL(65,30),
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_performance_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "coldCallTarget" INTEGER NOT NULL DEFAULT 100,
    "coldCallsDone" INTEGER NOT NULL DEFAULT 0,
    "coldCallBacklogIn" INTEGER NOT NULL DEFAULT 0,
    "coldCallBacklogCleared" INTEGER NOT NULL DEFAULT 0,
    "followUpTarget" INTEGER NOT NULL DEFAULT 0,
    "followUpsDone" INTEGER NOT NULL DEFAULT 0,
    "missedFollowUpIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_performance_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_task" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "coldCallTarget" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager_task_user" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backlogOverride" INTEGER,
    "targetOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_task_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LeadSourceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "avatar" TEXT,
    "sourceId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "subStatus" TEXT DEFAULT 'PENDING',
    "temperature" "LeadTemperature",
    "score" INTEGER DEFAULT 0,
    "interestedProjectId" TEXT,
    "interestedTowerId" TEXT,
    "interestedUnitId" TEXT,
    "brokerId" TEXT,
    "budget" DECIMAL(65,30),
    "preferredConfig" TEXT,
    "preferredLocation" TEXT,
    "requirements" TEXT,
    "customerSummary" TEXT,
    "aiNextStepSuggestion" TEXT,
    "assignedUserId" TEXT,
    "createdById" TEXT,
    "lastContactDate" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_assignment_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT NOT NULL,
    "reason" TEXT,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_distribution_rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "method" "DistributionMethod" NOT NULL,
    "projectId" TEXT,
    "departmentId" TEXT,
    "maxLeadsPerUser" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roundRobinIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_distribution_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_record" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "brokerId" TEXT,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "direction" "CallDirection" NOT NULL,
    "status" "CallStatus" NOT NULL,
    "duration" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "recordingSize" INTEGER,
    "aiTranscript" TEXT,
    "aiSummary" TEXT,
    "aiSentiment" TEXT,
    "aiExtractedData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_business_account" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phoneNumberId" TEXT NOT NULL,
    "displayPhone" TEXT NOT NULL,
    "wabaId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "webhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_business_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_template" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "headerText" TEXT,
    "bodyText" TEXT NOT NULL,
    "footerText" TEXT,
    "buttons" JSONB,
    "exampleValues" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversation" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactName" TEXT,
    "leadId" TEXT,
    "customerId" TEXT,
    "brokerId" TEXT,
    "agentUserId" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "waMessageId" TEXT,
    "direction" "WhatsAppMessageDirection" NOT NULL,
    "type" "WhatsAppMessageType" NOT NULL,
    "status" "WhatsAppMessageStatus" NOT NULL,
    "body" TEXT,
    "caption" TEXT,
    "templateId" TEXT,
    "templateValues" JSONB,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "mediaSize" INTEGER,
    "fileName" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "brokerId" TEXT,
    "userId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TIMESTAMP(3),
    "status" "FollowUpStatus" NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT,
    "remarks" TEXT,
    "completedAt" TIMESTAMP(3),
    "completedRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_up_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "brokerId" TEXT,
    "bookingId" TEXT,
    "content" TEXT NOT NULL,
    "noteType" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "statusAtTimeOfNote" "LeadStatus",
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "bookingId" TEXT,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "entityType" TEXT,
    "entityId" TEXT,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_timeline" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "brokerId" TEXT,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "reraNumber" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "isCpProject" BOOLEAN NOT NULL DEFAULT false,
    "builderId" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'UPCOMING',
    "constructionStatus" "ConstructionStatus",
    "possessionTimeline" JSONB,
    "reraNumber" TEXT,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsUrl" TEXT,
    "amenities" TEXT[],
    "totalTowers" INTEGER,
    "totalUnits" INTEGER,
    "totalFloors" INTEGER,
    "thumbnailUrl" TEXT,
    "brochureUrl" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tower" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "constructionStatus" "ConstructionStatus",
    "possessionTimeline" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tower_assignment" (
    "id" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tower_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor" (
    "id" TEXT NOT NULL,
    "towerId" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "name" TEXT,
    "totalUnits" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit" (
    "id" TEXT NOT NULL,
    "floorId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "type" "UnitType" NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "carpetArea" DECIMAL(65,30),
    "builtUpArea" DECIMAL(65,30),
    "superBuiltUpArea" DECIMAL(65,30),
    "basePrice" DECIMAL(65,30),
    "pricePerSqFt" DECIMAL(65,30),
    "totalPrice" DECIMAL(65,30),
    "commissionPercentage" DECIMAL(65,30),
    "commissionAmount" DECIMAL(65,30),
    "facing" TEXT,
    "balconies" INTEGER DEFAULT 0,
    "parkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "floorPlanUrl" TEXT,
    "remarks" TEXT,
    "constructionStatus" "ConstructionStatus",
    "possessionTimeline" JSONB,
    "blockedAt" TIMESTAMP(3),
    "blockedById" TEXT,
    "reservedAt" TIMESTAMP(3),
    "reservedForId" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_status_history" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "fromStatus" "UnitStatus" NOT NULL,
    "toStatus" "UnitStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unit_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_sheet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "priceData" JSONB NOT NULL,
    "documentUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floor_plan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "unitType" "UnitType",
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plan_template" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plan_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plan_milestone" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "dueDescription" TEXT,
    "sequenceOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_plan_milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT,
    "discountValue" DECIMAL(65,30),
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_update" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT,
    "progressPercent" INTEGER,
    "imageUrls" TEXT[],
    "updatedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_update_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_document" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "towerId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "project_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_visit" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "salesExecId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "arrivedAt" TIMESTAMP(3),
    "arriveLatitude" DOUBLE PRECISION,
    "arriveLongitude" DOUBLE PRECISION,
    "arriveNotifSentAt" TIMESTAMP(3),
    "destinationUrl" TEXT,
    "status" "SiteVisitStatus" NOT NULL DEFAULT 'ASSIGNED',
    "interestLevel" "CustomerInterestLevel",
    "meetingNotes" TEXT,
    "budgetConfirmed" DECIMAL(65,30),
    "configInterest" TEXT,
    "customerReaction" TEXT,
    "customerObjections" TEXT,
    "closingProbability" TEXT,
    "completedAt" TIMESTAMP(3),
    "nextAction" TEXT,
    "nextFollowUpDate" TIMESTAMP(3),
    "cancelReason" TEXT,
    "rescheduledFrom" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_visit_verification" (
    "id" TEXT NOT NULL,
    "siteVisitId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "locationAccuracy" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "siteVisitSelfieUrl" TEXT NOT NULL,
    "customerSelfieUrl" TEXT,
    "additionalPhotoUrls" TEXT[],
    "gpsTrackingData" JSONB,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visit_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "negotiation" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "unitId" TEXT,
    "salesExecId" TEXT NOT NULL,
    "askingPrice" DECIMAL(65,30),
    "offeredPrice" DECIMAL(65,30),
    "counterPrice" DECIMAL(65,30),
    "finalPrice" DECIMAL(65,30),
    "discountRequested" DECIMAL(65,30),
    "discountType" TEXT,
    "discountApproved" DECIMAL(65,30),
    "customerObjections" TEXT,
    "managerSuggestion" TEXT,
    "negotiationNotes" TEXT,
    "nextActionPlan" TEXT,
    "status" "NegotiationStatus" NOT NULL DEFAULT 'OPEN',
    "approvedById" TEXT,
    "approvalRemarks" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "negotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "aadhaarNumber" TEXT,
    "panNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "currentAddress" TEXT,
    "permanentAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "occupation" TEXT,
    "companyName" TEXT,
    "annualIncome" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "source" "BookingSource" NOT NULL,
    "salesExecId" TEXT,
    "closingManagerId" TEXT,
    "assignedPostSalesId" TEXT,
    "negotiationId" TEXT,
    "agreedPrice" DECIMAL(65,30) NOT NULL,
    "tokenAmount" DECIMAL(65,30),
    "discountAmount" DECIMAL(65,30),
    "gstAmount" DECIMAL(65,30),
    "stampDutyAmount" DECIMAL(65,30),
    "registrationAmount" DECIMAL(65,30),
    "totalPayable" DECIMAL(65,30) NOT NULL,
    "commissionPercentage" DECIMAL(65,30),
    "commissionAmount" DECIMAL(65,30),
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agreementDate" TIMESTAMP(3),
    "possessionDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "refundAmount" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_document" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "verificationStatus" "DocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_schedule" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(65,30) NOT NULL,
    "lastPaymentDate" TIMESTAMP(3),
    "overdueBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "paymentScheduleId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "referenceNumber" TEXT,
    "receiptNumber" TEXT,
    "receiptUrl" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "remarks" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_case" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "loanApplicationNumber" TEXT,
    "dsaName" TEXT,
    "dsaContact" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "bankContactPerson" TEXT,
    "bankContactPhone" TEXT,
    "loanAmount" DECIMAL(65,30),
    "approvedAmount" DECIMAL(65,30),
    "interestRate" DECIMAL(65,30),
    "tenure" INTEGER,
    "emiAmount" DECIMAL(65,30),
    "status" "LoanStatus" NOT NULL DEFAULT 'NOT_APPLIED',
    "applicationDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "disbursementDate" TIMESTAMP(3),
    "rejectionDate" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "loanDocumentUrls" TEXT[],
    "sanctionLetterUrl" TEXT,
    "pendingActions" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "agreementNumber" TEXT,
    "subRegistrarOffice" TEXT,
    "appointmentTime" TIMESTAMP(3),
    "draftDate" TIMESTAMP(3),
    "stampDutyDate" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "stampDutyAmount" DECIMAL(65,30),
    "registrationFee" DECIMAL(65,30),
    "stampDutyPaid" BOOLEAN NOT NULL DEFAULT false,
    "registrationDone" BOOLEAN NOT NULL DEFAULT false,
    "draftDocumentUrl" TEXT,
    "finalDocumentUrl" TEXT,
    "lawyerName" TEXT,
    "lawyerContact" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "possession_handover" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "status" "PossessionStatus" NOT NULL DEFAULT 'NOT_READY',
    "expectedDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),
    "actualDate" TIMESTAMP(3),
    "handoverNotes" TEXT,
    "electricityMeterNumber" TEXT,
    "waterMeterNumber" TEXT,
    "parkingSlotNumber" TEXT,
    "snagList" JSONB,
    "snagResolved" BOOLEAN NOT NULL DEFAULT false,
    "occupancyCertUrl" TEXT,
    "completionCertUrl" TEXT,
    "handoverDocUrl" TEXT,
    "keysHandedOver" BOOLEAN NOT NULL DEFAULT false,
    "keyHandoverDate" TIMESTAMP(3),
    "handoverById" TEXT,
    "customerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "possession_handover_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker" (
    "id" TEXT NOT NULL,
    "brokerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "email" TEXT,
    "reraNumber" TEXT,
    "reraState" TEXT,
    "gstNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "serviceAreas" TEXT[],
    "status" "BrokerStatus" NOT NULL DEFAULT 'NEW',
    "subStatus" TEXT DEFAULT 'PENDING',
    "sourcingManagerId" TEXT,
    "profilePhotoUrl" TEXT,
    "experience" INTEGER,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_document" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_project_assignment" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "towerId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "dealDocuments" TEXT[],
    "brokeragePercent" DECIMAL(65,30),
    "brokerageFlat" DECIMAL(65,30),
    "closingManagerId" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "broker_project_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_meeting" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "meetingNotes" TEXT,
    "brokerInterest" TEXT,
    "projectsDiscussed" TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "arriveLatitude" DOUBLE PRECISION,
    "arriveLongitude" DOUBLE PRECISION,
    "arrivedAt" TIMESTAMP(3),
    "destinationUrl" TEXT,
    "selfieUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "nextMeetingDate" TIMESTAMP(3),
    "nextFollowUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_request" (
    "id" TEXT NOT NULL,
    "salesExecId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "type" "ApprovalType" NOT NULL DEFAULT 'DISCOUNT',
    "redoCount" INTEGER NOT NULL DEFAULT 0,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_message" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fileUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broker_referral" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "leadId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "interestedProject" TEXT,
    "closingManagerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REFERRED',
    "bookingId" TEXT,
    "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactedAt" TIMESTAMP(3),
    "bookedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokerage_record" (
    "id" TEXT NOT NULL,
    "brokerId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingValue" DECIMAL(65,30) NOT NULL,
    "brokeragePercent" DECIMAL(65,30),
    "brokerageAmount" DECIMAL(65,30) NOT NULL,
    "gstOnBrokerage" DECIMAL(65,30),
    "tdsDeducted" DECIMAL(65,30),
    "netPayable" DECIMAL(65,30) NOT NULL,
    "status" "BrokerageStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brokerage_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_record" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "totalPayable" DECIMAL(65,30) NOT NULL,
    "totalCollected" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "outstanding" DECIMAL(65,30) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "lastCollectionDate" TIMESTAMP(3),
    "lastCollectionAmount" DECIMAL(65,30),
    "overdueDays" INTEGER DEFAULT 0,
    "overdueAmount" DECIMAL(65,30) DEFAULT 0,
    "isOverdue" BOOLEAN NOT NULL DEFAULT false,
    "nextFollowUpDate" TIMESTAMP(3),
    "collectionRemarks" TEXT,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brokerage_settlement" (
    "id" TEXT NOT NULL,
    "brokerageRecordId" TEXT NOT NULL,
    "settlementAmount" DECIMAL(65,30) NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "accountHolderName" TEXT,
    "invoiceNumber" TEXT,
    "invoiceUrl" TEXT,
    "tdsAmount" DECIMAL(65,30),
    "otherDeductions" DECIMAL(65,30),
    "deductionRemarks" TEXT,
    "status" "BrokerageStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalRemarks" TEXT,
    "processedById" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brokerage_settlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense" (
    "id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "period" TEXT,
    "vendorName" TEXT,
    "vendorContact" TEXT,
    "paymentMode" "PaymentMode",
    "paymentReference" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "receiptUrl" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bookingId" TEXT,
    "brokerId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "gstAmount" DECIMAL(65,30),
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "lineItems" JSONB,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdById" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_approval" (
    "id" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(65,30),
    "requestedById" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestRemarks" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "level1ApproverById" TEXT,
    "level1Status" "ApprovalStatus",
    "level1Remarks" TEXT,
    "level1At" TIMESTAMP(3),
    "level2ApproverById" TEXT,
    "level2Status" "ApprovalStatus",
    "level2Remarks" TEXT,
    "level2At" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_cache" (
    "id" TEXT NOT NULL,
    "dashboardType" TEXT NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room" (
    "id" TEXT NOT NULL,
    "type" "ChatRoomType" NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "departmentId" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room_member" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "lastReadAt" TIMESTAMP(3),
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "chat_room_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentType" TEXT,
    "attachmentName" TEXT,
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_commission" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "projectId" TEXT,
    "bookingId" TEXT,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "status" "InboundCommissionStatus" NOT NULL DEFAULT 'PENDING',
    "receivedAt" TIMESTAMP(3),
    "receivedById" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_commission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_phoneNumber_key" ON "user"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_employeeCode_key" ON "user"("employeeCode");

-- CreateIndex
CREATE INDEX "user_departmentId_idx" ON "user"("departmentId");

-- CreateIndex
CREATE INDEX "user_roleId_idx" ON "user"("roleId");

-- CreateIndex
CREATE INDEX "user_managerId_idx" ON "user"("managerId");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE INDEX "role_departmentId_idx" ON "role"("departmentId");

-- CreateIndex
CREATE INDEX "role_permission_roleId_idx" ON "role_permission"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_roleId_resource_action_key" ON "role_permission"("roleId", "resource", "action");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_loginAt_idx" ON "login_history"("loginAt");

-- CreateIndex
CREATE INDEX "employee_target_userId_idx" ON "employee_target"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_target_userId_period_key" ON "employee_target"("userId", "period");

-- CreateIndex
CREATE INDEX "employee_recognition_userId_idx" ON "employee_recognition"("userId");

-- CreateIndex
CREATE INDEX "employee_recognition_awardType_idx" ON "employee_recognition"("awardType");

-- CreateIndex
CREATE INDEX "attendance_userId_idx" ON "attendance"("userId");

-- CreateIndex
CREATE INDEX "attendance_date_idx" ON "attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_userId_date_key" ON "attendance"("userId", "date");

-- CreateIndex
CREATE INDEX "daily_performance_log_userId_idx" ON "daily_performance_log"("userId");

-- CreateIndex
CREATE INDEX "daily_performance_log_date_idx" ON "daily_performance_log"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_performance_log_userId_date_key" ON "daily_performance_log"("userId", "date");

-- CreateIndex
CREATE INDEX "manager_task_managerId_idx" ON "manager_task"("managerId");

-- CreateIndex
CREATE INDEX "manager_task_isActive_idx" ON "manager_task"("isActive");

-- CreateIndex
CREATE INDEX "manager_task_user_taskId_idx" ON "manager_task_user"("taskId");

-- CreateIndex
CREATE INDEX "manager_task_user_userId_idx" ON "manager_task_user"("userId");

-- CreateIndex
CREATE INDEX "announcement_managerId_idx" ON "announcement"("managerId");

-- CreateIndex
CREATE INDEX "announcement_isActive_idx" ON "announcement"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "lead_source_name_key" ON "lead_source"("name");

-- CreateIndex
CREATE INDEX "lead_status_idx" ON "lead"("status");

-- CreateIndex
CREATE INDEX "lead_temperature_idx" ON "lead"("temperature");

-- CreateIndex
CREATE INDEX "lead_assignedUserId_idx" ON "lead"("assignedUserId");

-- CreateIndex
CREATE INDEX "lead_sourceId_idx" ON "lead"("sourceId");

-- CreateIndex
CREATE INDEX "lead_interestedProjectId_idx" ON "lead"("interestedProjectId");

-- CreateIndex
CREATE INDEX "lead_interestedTowerId_idx" ON "lead"("interestedTowerId");

-- CreateIndex
CREATE INDEX "lead_interestedUnitId_idx" ON "lead"("interestedUnitId");

-- CreateIndex
CREATE INDEX "lead_brokerId_idx" ON "lead"("brokerId");

-- CreateIndex
CREATE INDEX "lead_nextFollowUpDate_idx" ON "lead"("nextFollowUpDate");

-- CreateIndex
CREATE INDEX "lead_createdAt_idx" ON "lead"("createdAt");

-- CreateIndex
CREATE INDEX "lead_phone_idx" ON "lead"("phone");

-- CreateIndex
CREATE INDEX "lead_assignment_history_leadId_idx" ON "lead_assignment_history"("leadId");

-- CreateIndex
CREATE INDEX "lead_assignment_history_toUserId_idx" ON "lead_assignment_history"("toUserId");

-- CreateIndex
CREATE INDEX "lead_assignment_history_assignedAt_idx" ON "lead_assignment_history"("assignedAt");

-- CreateIndex
CREATE INDEX "call_record_leadId_idx" ON "call_record"("leadId");

-- CreateIndex
CREATE INDEX "call_record_brokerId_idx" ON "call_record"("brokerId");

-- CreateIndex
CREATE INDEX "call_record_userId_idx" ON "call_record"("userId");

-- CreateIndex
CREATE INDEX "call_record_startedAt_idx" ON "call_record"("startedAt");

-- CreateIndex
CREATE INDEX "call_record_direction_idx" ON "call_record"("direction");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_business_account_phoneNumberId_key" ON "whatsapp_business_account"("phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_business_account_wabaId_key" ON "whatsapp_business_account"("wabaId");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_template_accountId_name_language_key" ON "whatsapp_template"("accountId", "name", "language");

-- CreateIndex
CREATE INDEX "whatsapp_conversation_leadId_idx" ON "whatsapp_conversation"("leadId");

-- CreateIndex
CREATE INDEX "whatsapp_conversation_customerId_idx" ON "whatsapp_conversation"("customerId");

-- CreateIndex
CREATE INDEX "whatsapp_conversation_brokerId_idx" ON "whatsapp_conversation"("brokerId");

-- CreateIndex
CREATE INDEX "whatsapp_conversation_contactPhone_idx" ON "whatsapp_conversation"("contactPhone");

-- CreateIndex
CREATE INDEX "whatsapp_conversation_lastMessageAt_idx" ON "whatsapp_conversation"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_message_waMessageId_key" ON "whatsapp_message"("waMessageId");

-- CreateIndex
CREATE INDEX "whatsapp_message_conversationId_idx" ON "whatsapp_message"("conversationId");

-- CreateIndex
CREATE INDEX "whatsapp_message_waMessageId_idx" ON "whatsapp_message"("waMessageId");

-- CreateIndex
CREATE INDEX "whatsapp_message_direction_idx" ON "whatsapp_message"("direction");

-- CreateIndex
CREATE INDEX "whatsapp_message_status_idx" ON "whatsapp_message"("status");

-- CreateIndex
CREATE INDEX "whatsapp_message_createdAt_idx" ON "whatsapp_message"("createdAt");

-- CreateIndex
CREATE INDEX "follow_up_leadId_idx" ON "follow_up"("leadId");

-- CreateIndex
CREATE INDEX "follow_up_customerId_idx" ON "follow_up"("customerId");

-- CreateIndex
CREATE INDEX "follow_up_brokerId_idx" ON "follow_up"("brokerId");

-- CreateIndex
CREATE INDEX "follow_up_userId_idx" ON "follow_up"("userId");

-- CreateIndex
CREATE INDEX "follow_up_scheduledDate_idx" ON "follow_up"("scheduledDate");

-- CreateIndex
CREATE INDEX "follow_up_status_idx" ON "follow_up"("status");

-- CreateIndex
CREATE INDEX "note_leadId_idx" ON "note"("leadId");

-- CreateIndex
CREATE INDEX "note_customerId_idx" ON "note"("customerId");

-- CreateIndex
CREATE INDEX "note_brokerId_idx" ON "note"("brokerId");

-- CreateIndex
CREATE INDEX "note_bookingId_idx" ON "note"("bookingId");

-- CreateIndex
CREATE INDEX "note_userId_idx" ON "note"("userId");

-- CreateIndex
CREATE INDEX "task_assignedToId_idx" ON "task"("assignedToId");

-- CreateIndex
CREATE INDEX "task_status_idx" ON "task"("status");

-- CreateIndex
CREATE INDEX "task_dueDate_idx" ON "task"("dueDate");

-- CreateIndex
CREATE INDEX "task_priority_idx" ON "task"("priority");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE INDEX "activity_timeline_leadId_createdAt_idx" ON "activity_timeline"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_timeline_customerId_createdAt_idx" ON "activity_timeline"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_timeline_brokerId_createdAt_idx" ON "activity_timeline"("brokerId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_timeline_type_idx" ON "activity_timeline"("type");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");

-- CreateIndex
CREATE INDEX "project_builderId_idx" ON "project"("builderId");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "project_type_idx" ON "project"("type");

-- CreateIndex
CREATE INDEX "project_city_idx" ON "project"("city");

-- CreateIndex
CREATE INDEX "tower_projectId_idx" ON "tower"("projectId");

-- CreateIndex
CREATE INDEX "tower_assignment_towerId_idx" ON "tower_assignment"("towerId");

-- CreateIndex
CREATE INDEX "tower_assignment_userId_idx" ON "tower_assignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tower_assignment_towerId_userId_key" ON "tower_assignment"("towerId", "userId");

-- CreateIndex
CREATE INDEX "floor_towerId_idx" ON "floor"("towerId");

-- CreateIndex
CREATE UNIQUE INDEX "floor_towerId_floorNumber_key" ON "floor"("towerId", "floorNumber");

-- CreateIndex
CREATE INDEX "unit_floorId_idx" ON "unit"("floorId");

-- CreateIndex
CREATE INDEX "unit_status_idx" ON "unit"("status");

-- CreateIndex
CREATE INDEX "unit_type_idx" ON "unit"("type");

-- CreateIndex
CREATE UNIQUE INDEX "unit_floorId_unitNumber_key" ON "unit"("floorId", "unitNumber");

-- CreateIndex
CREATE INDEX "unit_status_history_unitId_idx" ON "unit_status_history"("unitId");

-- CreateIndex
CREATE INDEX "unit_status_history_changedAt_idx" ON "unit_status_history"("changedAt");

-- CreateIndex
CREATE INDEX "price_sheet_projectId_idx" ON "price_sheet"("projectId");

-- CreateIndex
CREATE INDEX "price_sheet_isActive_idx" ON "price_sheet"("isActive");

-- CreateIndex
CREATE INDEX "floor_plan_projectId_idx" ON "floor_plan"("projectId");

-- CreateIndex
CREATE INDEX "payment_plan_template_projectId_idx" ON "payment_plan_template"("projectId");

-- CreateIndex
CREATE INDEX "payment_plan_milestone_templateId_idx" ON "payment_plan_milestone"("templateId");

-- CreateIndex
CREATE INDEX "offer_projectId_idx" ON "offer"("projectId");

-- CreateIndex
CREATE INDEX "offer_validFrom_validTo_idx" ON "offer"("validFrom", "validTo");

-- CreateIndex
CREATE INDEX "construction_update_projectId_idx" ON "construction_update"("projectId");

-- CreateIndex
CREATE INDEX "construction_update_publishedAt_idx" ON "construction_update"("publishedAt");

-- CreateIndex
CREATE INDEX "project_document_projectId_idx" ON "project_document"("projectId");

-- CreateIndex
CREATE INDEX "project_document_towerId_idx" ON "project_document"("towerId");

-- CreateIndex
CREATE INDEX "project_document_category_idx" ON "project_document"("category");

-- CreateIndex
CREATE INDEX "project_assignment_projectId_idx" ON "project_assignment"("projectId");

-- CreateIndex
CREATE INDEX "project_assignment_userId_idx" ON "project_assignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_assignment_projectId_userId_key" ON "project_assignment"("projectId", "userId");

-- CreateIndex
CREATE INDEX "site_visit_leadId_idx" ON "site_visit"("leadId");

-- CreateIndex
CREATE INDEX "site_visit_projectId_idx" ON "site_visit"("projectId");

-- CreateIndex
CREATE INDEX "site_visit_salesExecId_idx" ON "site_visit"("salesExecId");

-- CreateIndex
CREATE INDEX "site_visit_scheduledDate_idx" ON "site_visit"("scheduledDate");

-- CreateIndex
CREATE INDEX "site_visit_status_idx" ON "site_visit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "site_visit_verification_siteVisitId_key" ON "site_visit_verification"("siteVisitId");

-- CreateIndex
CREATE INDEX "negotiation_leadId_idx" ON "negotiation"("leadId");

-- CreateIndex
CREATE INDEX "negotiation_unitId_idx" ON "negotiation"("unitId");

-- CreateIndex
CREATE INDEX "negotiation_salesExecId_idx" ON "negotiation"("salesExecId");

-- CreateIndex
CREATE INDEX "negotiation_status_idx" ON "negotiation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_leadId_key" ON "customer"("leadId");

-- CreateIndex
CREATE INDEX "customer_phone_idx" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "customer_leadId_idx" ON "customer"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_bookingNumber_key" ON "booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "booking_customerId_idx" ON "booking"("customerId");

-- CreateIndex
CREATE INDEX "booking_unitId_idx" ON "booking"("unitId");

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");

-- CreateIndex
CREATE INDEX "booking_bookingDate_idx" ON "booking"("bookingDate");

-- CreateIndex
CREATE INDEX "booking_source_idx" ON "booking"("source");

-- CreateIndex
CREATE INDEX "customer_document_customerId_idx" ON "customer_document"("customerId");

-- CreateIndex
CREATE INDEX "customer_document_bookingId_idx" ON "customer_document"("bookingId");

-- CreateIndex
CREATE INDEX "customer_document_type_idx" ON "customer_document"("type");

-- CreateIndex
CREATE INDEX "customer_document_verificationStatus_idx" ON "customer_document"("verificationStatus");

-- CreateIndex
CREATE INDEX "payment_schedule_bookingId_idx" ON "payment_schedule"("bookingId");

-- CreateIndex
CREATE INDEX "payment_schedule_dueDate_idx" ON "payment_schedule"("dueDate");

-- CreateIndex
CREATE INDEX "payment_schedule_status_idx" ON "payment_schedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_receiptNumber_key" ON "payment_transaction"("receiptNumber");

-- CreateIndex
CREATE INDEX "payment_transaction_paymentScheduleId_idx" ON "payment_transaction"("paymentScheduleId");

-- CreateIndex
CREATE INDEX "payment_transaction_paymentDate_idx" ON "payment_transaction"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "loan_case_bookingId_key" ON "loan_case"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "agreement_bookingId_key" ON "agreement"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "possession_handover_bookingId_key" ON "possession_handover"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_brokerCode_key" ON "broker"("brokerCode");

-- CreateIndex
CREATE INDEX "broker_sourcingManagerId_idx" ON "broker"("sourcingManagerId");

-- CreateIndex
CREATE INDEX "broker_status_idx" ON "broker"("status");

-- CreateIndex
CREATE INDEX "broker_city_idx" ON "broker"("city");

-- CreateIndex
CREATE INDEX "broker_document_brokerId_idx" ON "broker_document"("brokerId");

-- CreateIndex
CREATE INDEX "broker_project_assignment_brokerId_idx" ON "broker_project_assignment"("brokerId");

-- CreateIndex
CREATE INDEX "broker_project_assignment_projectId_idx" ON "broker_project_assignment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_project_assignment_brokerId_projectId_key" ON "broker_project_assignment"("brokerId", "projectId");

-- CreateIndex
CREATE INDEX "broker_meeting_brokerId_idx" ON "broker_meeting"("brokerId");

-- CreateIndex
CREATE INDEX "broker_meeting_userId_idx" ON "broker_meeting"("userId");

-- CreateIndex
CREATE INDEX "broker_meeting_scheduledDate_idx" ON "broker_meeting"("scheduledDate");

-- CreateIndex
CREATE INDEX "approval_request_salesExecId_idx" ON "approval_request"("salesExecId");

-- CreateIndex
CREATE INDEX "approval_request_managerId_idx" ON "approval_request"("managerId");

-- CreateIndex
CREATE INDEX "approval_request_status_idx" ON "approval_request"("status");

-- CreateIndex
CREATE INDEX "approval_request_bookingId_idx" ON "approval_request"("bookingId");

-- CreateIndex
CREATE INDEX "approval_message_requestId_idx" ON "approval_message"("requestId");

-- CreateIndex
CREATE INDEX "approval_message_senderId_idx" ON "approval_message"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_referral_leadId_key" ON "broker_referral"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "broker_referral_bookingId_key" ON "broker_referral"("bookingId");

-- CreateIndex
CREATE INDEX "broker_referral_brokerId_idx" ON "broker_referral"("brokerId");

-- CreateIndex
CREATE INDEX "broker_referral_closingManagerId_idx" ON "broker_referral"("closingManagerId");

-- CreateIndex
CREATE INDEX "broker_referral_status_idx" ON "broker_referral"("status");

-- CreateIndex
CREATE INDEX "brokerage_record_brokerId_idx" ON "brokerage_record"("brokerId");

-- CreateIndex
CREATE INDEX "brokerage_record_bookingId_idx" ON "brokerage_record"("bookingId");

-- CreateIndex
CREATE INDEX "brokerage_record_status_idx" ON "brokerage_record"("status");

-- CreateIndex
CREATE INDEX "collection_record_bookingId_idx" ON "collection_record"("bookingId");

-- CreateIndex
CREATE INDEX "collection_record_status_idx" ON "collection_record"("status");

-- CreateIndex
CREATE INDEX "collection_record_isOverdue_idx" ON "collection_record"("isOverdue");

-- CreateIndex
CREATE INDEX "collection_record_assignedToId_idx" ON "collection_record"("assignedToId");

-- CreateIndex
CREATE UNIQUE INDEX "brokerage_settlement_brokerageRecordId_key" ON "brokerage_settlement"("brokerageRecordId");

-- CreateIndex
CREATE INDEX "brokerage_settlement_status_idx" ON "brokerage_settlement"("status");

-- CreateIndex
CREATE INDEX "brokerage_settlement_paymentDate_idx" ON "brokerage_settlement"("paymentDate");

-- CreateIndex
CREATE INDEX "expense_category_idx" ON "expense"("category");

-- CreateIndex
CREATE INDEX "expense_expenseDate_idx" ON "expense"("expenseDate");

-- CreateIndex
CREATE INDEX "expense_approvalStatus_idx" ON "expense"("approvalStatus");

-- CreateIndex
CREATE INDEX "expense_requestedById_idx" ON "expense"("requestedById");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_type_idx" ON "invoice"("type");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_invoiceDate_idx" ON "invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "financial_approval_type_idx" ON "financial_approval"("type");

-- CreateIndex
CREATE INDEX "financial_approval_status_idx" ON "financial_approval"("status");

-- CreateIndex
CREATE INDEX "financial_approval_requestedById_idx" ON "financial_approval"("requestedById");

-- CreateIndex
CREATE INDEX "financial_approval_entityType_entityId_idx" ON "financial_approval"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "dashboard_cache_dashboardType_idx" ON "dashboard_cache"("dashboardType");

-- CreateIndex
CREATE INDEX "dashboard_cache_expiresAt_idx" ON "dashboard_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_cache_dashboardType_widgetKey_period_key" ON "dashboard_cache"("dashboardType", "widgetKey", "period");

-- CreateIndex
CREATE INDEX "chat_room_type_idx" ON "chat_room"("type");

-- CreateIndex
CREATE INDEX "chat_room_departmentId_idx" ON "chat_room"("departmentId");

-- CreateIndex
CREATE INDEX "chat_room_member_chatRoomId_idx" ON "chat_room_member"("chatRoomId");

-- CreateIndex
CREATE INDEX "chat_room_member_userId_idx" ON "chat_room_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_member_chatRoomId_userId_key" ON "chat_room_member"("chatRoomId", "userId");

-- CreateIndex
CREATE INDEX "chat_message_chatRoomId_createdAt_idx" ON "chat_message"("chatRoomId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_message_senderId_idx" ON "chat_message"("senderId");

-- CreateIndex
CREATE INDEX "inbound_commission_unitId_idx" ON "inbound_commission"("unitId");

-- CreateIndex
CREATE INDEX "inbound_commission_projectId_idx" ON "inbound_commission"("projectId");

-- CreateIndex
CREATE INDEX "inbound_commission_bookingId_idx" ON "inbound_commission"("bookingId");

-- CreateIndex
CREATE INDEX "inbound_commission_status_idx" ON "inbound_commission"("status");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_target" ADD CONSTRAINT "employee_target_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_recognition" ADD CONSTRAINT "employee_recognition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_performance_log" ADD CONSTRAINT "daily_performance_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_task" ADD CONSTRAINT "manager_task_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_task_user" ADD CONSTRAINT "manager_task_user_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "manager_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_task_user" ADD CONSTRAINT "manager_task_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "lead_source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_interestedProjectId_fkey" FOREIGN KEY ("interestedProjectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_interestedTowerId_fkey" FOREIGN KEY ("interestedTowerId") REFERENCES "tower"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_interestedUnitId_fkey" FOREIGN KEY ("interestedUnitId") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignment_history" ADD CONSTRAINT "lead_assignment_history_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignment_history" ADD CONSTRAINT "lead_assignment_history_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignment_history" ADD CONSTRAINT "lead_assignment_history_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_assignment_history" ADD CONSTRAINT "lead_assignment_history_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_distribution_rule" ADD CONSTRAINT "lead_distribution_rule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_distribution_rule" ADD CONSTRAINT "lead_distribution_rule_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_record" ADD CONSTRAINT "call_record_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_record" ADD CONSTRAINT "call_record_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_record" ADD CONSTRAINT "call_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_template" ADD CONSTRAINT "whatsapp_template_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "whatsapp_business_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversation" ADD CONSTRAINT "whatsapp_conversation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "whatsapp_business_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversation" ADD CONSTRAINT "whatsapp_conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversation" ADD CONSTRAINT "whatsapp_conversation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversation" ADD CONSTRAINT "whatsapp_conversation_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversation" ADD CONSTRAINT "whatsapp_conversation_agentUserId_fkey" FOREIGN KEY ("agentUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message" ADD CONSTRAINT "whatsapp_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "whatsapp_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_message" ADD CONSTRAINT "whatsapp_message_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "whatsapp_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up" ADD CONSTRAINT "follow_up_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_timeline" ADD CONSTRAINT "activity_timeline_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_timeline" ADD CONSTRAINT "activity_timeline_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_timeline" ADD CONSTRAINT "activity_timeline_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_builderId_fkey" FOREIGN KEY ("builderId") REFERENCES "builder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tower" ADD CONSTRAINT "tower_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tower_assignment" ADD CONSTRAINT "tower_assignment_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "tower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tower_assignment" ADD CONSTRAINT "tower_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor" ADD CONSTRAINT "floor_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "tower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit" ADD CONSTRAINT "unit_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit" ADD CONSTRAINT "unit_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit" ADD CONSTRAINT "unit_reservedForId_fkey" FOREIGN KEY ("reservedForId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_status_history" ADD CONSTRAINT "unit_status_history_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_sheet" ADD CONSTRAINT "price_sheet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_plan" ADD CONSTRAINT "floor_plan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plan_template" ADD CONSTRAINT "payment_plan_template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plan_milestone" ADD CONSTRAINT "payment_plan_milestone_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "payment_plan_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_update" ADD CONSTRAINT "construction_update_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_update" ADD CONSTRAINT "construction_update_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_document" ADD CONSTRAINT "project_document_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "tower"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignment" ADD CONSTRAINT "project_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit" ADD CONSTRAINT "site_visit_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit" ADD CONSTRAINT "site_visit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit" ADD CONSTRAINT "site_visit_salesExecId_fkey" FOREIGN KEY ("salesExecId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit" ADD CONSTRAINT "site_visit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit_verification" ADD CONSTRAINT "site_visit_verification_siteVisitId_fkey" FOREIGN KEY ("siteVisitId") REFERENCES "site_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "negotiation" ADD CONSTRAINT "negotiation_salesExecId_fkey" FOREIGN KEY ("salesExecId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_salesExecId_fkey" FOREIGN KEY ("salesExecId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_closingManagerId_fkey" FOREIGN KEY ("closingManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_assignedPostSalesId_fkey" FOREIGN KEY ("assignedPostSalesId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_negotiationId_fkey" FOREIGN KEY ("negotiationId") REFERENCES "negotiation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_document" ADD CONSTRAINT "customer_document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_document" ADD CONSTRAINT "customer_document_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_document" ADD CONSTRAINT "customer_document_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_schedule" ADD CONSTRAINT "payment_schedule_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_paymentScheduleId_fkey" FOREIGN KEY ("paymentScheduleId") REFERENCES "payment_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_case" ADD CONSTRAINT "loan_case_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agreement" ADD CONSTRAINT "agreement_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "possession_handover" ADD CONSTRAINT "possession_handover_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "possession_handover" ADD CONSTRAINT "possession_handover_handoverById_fkey" FOREIGN KEY ("handoverById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker" ADD CONSTRAINT "broker_sourcingManagerId_fkey" FOREIGN KEY ("sourcingManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_document" ADD CONSTRAINT "broker_document_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_project_assignment" ADD CONSTRAINT "broker_project_assignment_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_project_assignment" ADD CONSTRAINT "broker_project_assignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_meeting" ADD CONSTRAINT "broker_meeting_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_meeting" ADD CONSTRAINT "broker_meeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_salesExecId_fkey" FOREIGN KEY ("salesExecId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_message" ADD CONSTRAINT "approval_message_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "approval_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_message" ADD CONSTRAINT "approval_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_referral" ADD CONSTRAINT "broker_referral_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broker_referral" ADD CONSTRAINT "broker_referral_closingManagerId_fkey" FOREIGN KEY ("closingManagerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_record" ADD CONSTRAINT "brokerage_record_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_record" ADD CONSTRAINT "brokerage_record_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_record" ADD CONSTRAINT "brokerage_record_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_record" ADD CONSTRAINT "collection_record_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_record" ADD CONSTRAINT "collection_record_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_settlement" ADD CONSTRAINT "brokerage_settlement_brokerageRecordId_fkey" FOREIGN KEY ("brokerageRecordId") REFERENCES "brokerage_record"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_settlement" ADD CONSTRAINT "brokerage_settlement_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brokerage_settlement" ADD CONSTRAINT "brokerage_settlement_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense" ADD CONSTRAINT "expense_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_approval" ADD CONSTRAINT "financial_approval_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_approval" ADD CONSTRAINT "financial_approval_level1ApproverById_fkey" FOREIGN KEY ("level1ApproverById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_approval" ADD CONSTRAINT "financial_approval_level2ApproverById_fkey" FOREIGN KEY ("level2ApproverById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_member" ADD CONSTRAINT "chat_room_member_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_member" ADD CONSTRAINT "chat_room_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "chat_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_commission" ADD CONSTRAINT "inbound_commission_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_commission" ADD CONSTRAINT "inbound_commission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_commission" ADD CONSTRAINT "inbound_commission_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_commission" ADD CONSTRAINT "inbound_commission_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
