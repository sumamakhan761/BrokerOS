-- CreateEnum
CREATE TYPE "MarketingChannel" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'VOICE_CALL');

-- CreateEnum
CREATE TYPE "EmailProviderType" AS ENUM ('SYSTEM_DEFAULT', 'AWS_SES', 'SENDGRID', 'BREVO', 'MAILCHIMP');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'PAUSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecipientDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'SPAM_COMPLAINT', 'UNSUBSCRIBED', 'FAILED');

-- CreateEnum
CREATE TYPE "AudienceSourceType" AS ENUM ('CRM_DATABASE', 'CSV_UPLOAD', 'HYBRID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadSourceType" ADD VALUE 'MARKETING_CAMPAIGN';
ALTER TYPE "LeadSourceType" ADD VALUE 'MARKETING_CSV_IMPORT';

-- CreateTable
CREATE TABLE "marketing_integration" (
    "id" TEXT NOT NULL,
    "provider" "EmailProviderType" NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "awsAccessKeyId" TEXT,
    "awsSecretKey" TEXT,
    "awsRegion" TEXT,
    "mailchimpServer" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "replyTo" TEXT,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "plainText" TEXT,
    "previewImageUrl" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channel" "MarketingChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "providerType" "EmailProviderType" NOT NULL DEFAULT 'SYSTEM_DEFAULT',
    "audienceSource" "AudienceSourceType" NOT NULL DEFAULT 'CRM_DATABASE',
    "isCpCampaign" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT,
    "integrationId" TEXT,
    "templateId" TEXT,
    "subject" TEXT NOT NULL,
    "fromName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "replyTo" TEXT,
    "htmlContent" TEXT NOT NULL,
    "audienceFilters" JSONB,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "openedCount" INTEGER NOT NULL DEFAULT 0,
    "clickedCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedCount" INTEGER NOT NULL DEFAULT 0,
    "complaintCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribedCount" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_recipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "leadId" TEXT,
    "brokerId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "status" "RecipientDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "source" "AudienceSourceType" NOT NULL DEFAULT 'CRM_DATABASE',
    "providerMsgId" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "firstOpenedAt" TIMESTAMP(3),
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "firstClickedAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedAt" TIMESTAMP(3),
    "bounceReason" TEXT,
    "mergeData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_tracking_event" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "urlClicked" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_tracking_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_unsubscribe" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "campaignId" TEXT,
    "channel" "MarketingChannel" NOT NULL DEFAULT 'EMAIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_unsubscribe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_integration_provider_idx" ON "marketing_integration"("provider");

-- CreateIndex
CREATE INDEX "marketing_integration_isActive_idx" ON "marketing_integration"("isActive");

-- CreateIndex
CREATE INDEX "email_template_category_idx" ON "email_template"("category");

-- CreateIndex
CREATE INDEX "marketing_campaign_status_idx" ON "marketing_campaign"("status");

-- CreateIndex
CREATE INDEX "marketing_campaign_channel_idx" ON "marketing_campaign"("channel");

-- CreateIndex
CREATE INDEX "marketing_campaign_projectId_idx" ON "marketing_campaign"("projectId");

-- CreateIndex
CREATE INDEX "marketing_campaign_integrationId_idx" ON "marketing_campaign"("integrationId");

-- CreateIndex
CREATE INDEX "marketing_campaign_createdAt_idx" ON "marketing_campaign"("createdAt");

-- CreateIndex
CREATE INDEX "campaign_recipient_campaignId_status_idx" ON "campaign_recipient"("campaignId", "status");

-- CreateIndex
CREATE INDEX "campaign_recipient_email_idx" ON "campaign_recipient"("email");

-- CreateIndex
CREATE INDEX "campaign_recipient_leadId_idx" ON "campaign_recipient"("leadId");

-- CreateIndex
CREATE INDEX "email_tracking_event_campaignId_eventType_idx" ON "email_tracking_event"("campaignId", "eventType");

-- CreateIndex
CREATE INDEX "email_tracking_event_recipientId_idx" ON "email_tracking_event"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "marketing_unsubscribe_email_key" ON "marketing_unsubscribe"("email");

-- AddForeignKey
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "marketing_integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "email_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_campaign" ADD CONSTRAINT "marketing_campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_recipient" ADD CONSTRAINT "campaign_recipient_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_tracking_event" ADD CONSTRAINT "email_tracking_event_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "marketing_campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
