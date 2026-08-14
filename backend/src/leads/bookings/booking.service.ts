import { Injectable } from '@nestjs/common';
import { BookingQueryService } from './booking-query.service.js';
import { BookingCreationService } from './booking-creation.service.js';
import { BookingStatusService } from './booking-status.service.js';
import { BookingDocumentsService } from './booking-documents.service.js';
import { BookingPostSalesService } from './booking-post-sales.service.js';

@Injectable()
export class BookingService {
  constructor(
    private bookingQuery: BookingQueryService,
    private bookingCreation: BookingCreationService,
    private bookingStatus: BookingStatusService,
    private bookingDocuments: BookingDocumentsService,
    private bookingPostSales: BookingPostSalesService,
  ) { }

  async getBooking(leadId: string) {
    return this.bookingQuery.getBooking(leadId);
  }

  async createBooking(leadId: string, data: any) {
    return this.bookingCreation.createBooking(leadId, data);
  }

  async markBookingDone(bookingId: string) {
    return this.bookingStatus.markBookingDone(bookingId);
  }

  async getAllBookings(userId: string, roleId: number) {
    return this.bookingQuery.getAllBookings(userId, roleId);
  }

  async cancelBooking(bookingId: string, reason?: string) {
    return this.bookingStatus.cancelBooking(bookingId, reason);
  }

  async uploadDocument(bookingId: string, docType: string, file: any, description?: string) {
    return this.bookingDocuments.uploadDocument(bookingId, docType, file, description);
  }

  async getDocumentFile(documentId: string) {
    return this.bookingDocuments.getDocumentFile(documentId);
  }

  async saveLoanCase(bookingId: string, data: any) {
    return this.bookingPostSales.saveLoanCase(bookingId, data);
  }

  async saveAgreement(bookingId: string, data: any) {
    return this.bookingPostSales.saveAgreement(bookingId, data);
  }

  async saveHandover(bookingId: string, data: any) {
    return this.bookingPostSales.saveHandover(bookingId, data);
  }

  async uploadPostSalesFile(bookingId: string, type: 'loan' | 'agreement' | 'handover', fieldName: string, file: any) {
    return this.bookingPostSales.uploadPostSalesFile(bookingId, type, fieldName, file);
  }
}
