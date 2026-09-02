import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
} from '@brokeros/types';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import { ConnectIntegrationDto, SendTestEmailDto } from '../dto/email.dto.js';

@Injectable()
export class EmailIntegrationsService {
  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();

  constructor(private readonly prisma: PrismaService) {}

  getAdapter(providerType: string): IEmailMarketingProvider {
    switch (providerType) {
      case 'SENDGRID':
        return this.sendgridAdapter;
      case 'BREVO':
        return this.brevoAdapter;
      case 'MAILCHIMP':
        return this.mailchimpAdapter;
      case 'AWS_SES':
      case 'SYSTEM_DEFAULT':
      default:
        return this.sesAdapter;
    }
  }

  renderMergeTags(
    template: string,
    data: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
      city?: string;
      projectName?: string;
      projectLocation?: string;
      projectStartingPrice?: string;
      projectBrochureUrl?: string;
      agentName?: string;
      agentPhone?: string;
      unsubscribeUrl?: string;
    },
  ): string {
    if (!template) return '';
    return template
      .replace(/{{lead\.firstName}}/gi, data.firstName || 'Valued Prospect')
      .replace(/{{lead\.lastName}}/gi, data.lastName || '')
      .replace(
        /{{lead\.fullName}}/gi,
        data.fullName || data.firstName || 'Valued Prospect',
      )
      .replace(/{{lead\.city}}/gi, data.city || 'your city')
      .replace(/{{project\.name}}/gi, data.projectName || 'Luxury Residence')
      .replace(
        /{{project\.location}}/gi,
        data.projectLocation || 'Prime Location',
      )
      .replace(
        /{{project\.startingPrice}}/gi,
        data.projectStartingPrice || '₹1.50 Cr',
      )
      .replace(/{{project\.brochureUrl}}/gi, data.projectBrochureUrl || '#')
      .replace(/{{agent\.name}}/gi, data.agentName || 'Sales Team')
      .replace(/{{agent\.phone}}/gi, data.agentPhone || '+91 98000 00000')
      .replace(/{{unsubscribeUrl}}/gi, data.unsubscribeUrl || '#unsubscribe');
  }

  async sendTestEmail(dto: SendTestEmailDto) {
    const providerType = dto.providerType || 'SYSTEM_DEFAULT';
    let credentials: ProviderCredentials | undefined;

    if (dto.integrationId) {
      const integration = await this.prisma.marketingIntegration.findUnique({
        where: { id: dto.integrationId },
      });
      if (integration) {
        credentials = {
          apiKey: integration.apiKey || undefined,
          awsAccessKeyId: integration.awsAccessKeyId || undefined,
          awsSecretKey: integration.awsSecretKey || undefined,
          awsRegion: integration.awsRegion || undefined,
          mailchimpServer: integration.mailchimpServer || undefined,
          fromEmail: integration.fromEmail,
          fromName: integration.fromName,
        };
      }
    } else if (providerType !== 'SYSTEM_DEFAULT') {
      const activeIntegration =
        await this.prisma.marketingIntegration.findFirst({
          where: { provider: providerType as any, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      if (activeIntegration) {
        credentials = {
          apiKey: activeIntegration.apiKey || undefined,
          awsAccessKeyId: activeIntegration.awsAccessKeyId || undefined,
          awsSecretKey: activeIntegration.awsSecretKey || undefined,
          awsRegion: activeIntegration.awsRegion || undefined,
          mailchimpServer: activeIntegration.mailchimpServer || undefined,
          fromEmail: activeIntegration.fromEmail,
          fromName: activeIntegration.fromName,
        };
      }
    }

    let project: any = null;
    if (dto.projectId) {
      project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { name: true, city: true, address: true, brochureUrl: true },
      });
    }

    const adapter = this.getAdapter(providerType);

    const resolvedFromEmail =
      dto.fromEmail &&
      dto.fromEmail.includes('@') &&
      dto.fromEmail !== 'marketing@example.com'
        ? dto.fromEmail
        : credentials?.fromEmail || dto.fromEmail || 'marketing@example.com';

    const resolvedFromName =
      dto.fromName || credentials?.fromName || 'Sales Team';

    const recipientEmail = (dto.recipientEmail || dto.toEmail || '').trim();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new BadRequestException(
        'A valid recipient email address is required',
      );
    }

    const testRecipientName = recipientEmail.split('@')[0];
    const previewData = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      fullName: 'Rahul Sharma',
      city: project?.city || 'Mumbai',
      projectName: project?.name || 'Luxury Villas',
      projectLocation:
        project?.address || project?.city || 'Prime Downtown Corridor',
      projectStartingPrice: '₹1.50 Cr',
      projectBrochureUrl:
        project?.brochureUrl || 'https://yourdomain.com/brochure',
      agentName: resolvedFromName,
      agentPhone: '+91 98000 00000',
      unsubscribeUrl: '#unsubscribe',
    };

    const subjectContent = dto.subject || 'Project Launch';
    const bodyContent = dto.htmlContent || '<p>Hello from BrokerOS</p>';

    const renderedSubject = this.renderMergeTags(subjectContent, previewData);
    const renderedHtml = this.renderMergeTags(bodyContent, previewData);

    const options: SendEmailOptions = {
      fromEmail: resolvedFromEmail,
      fromName: resolvedFromName,
      to: [{ email: recipientEmail, name: testRecipientName }],
      subject: `[TEST] ${renderedSubject}`,
      htmlContent: renderedHtml,
    };

    return adapter.sendBatch(options, credentials);
  }

  async listIntegrations() {
    return this.prisma.marketingIntegration.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        isDefault: true,
        fromEmail: true,
        fromName: true,
        replyTo: true,
        awsRegion: true,
        mailchimpServer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async connectIntegration(dto: ConnectIntegrationDto) {
    const adapter = this.getAdapter(dto.provider);
    const isValid = await adapter.validateCredentials({
      apiKey: dto.apiKey,
      awsAccessKeyId: dto.awsAccessKeyId,
      awsSecretKey: dto.awsSecretKey,
      awsRegion: dto.awsRegion,
      mailchimpServer: dto.mailchimpServer,
    });

    if (!isValid) {
      throw new BadRequestException(
        `Failed to validate credentials with provider ${dto.provider}`,
      );
    }

    if (dto.isDefault) {
      await this.prisma.marketingIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.marketingIntegration.create({
      data: {
        provider: dto.provider as any,
        name: dto.name || `${dto.provider} Gateway`,
        isDefault: dto.isDefault || false,
        apiKey: dto.apiKey,
        awsAccessKeyId: dto.awsAccessKeyId,
        awsSecretKey: dto.awsSecretKey,
        awsRegion: dto.awsRegion,
        mailchimpServer: dto.mailchimpServer,
        fromEmail: dto.fromEmail || 'marketing@example.com',
        fromName: dto.fromName || 'Sales Team',
        replyTo: dto.replyTo,
      },
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.marketingIntegration.delete({ where: { id } });
  }
}
