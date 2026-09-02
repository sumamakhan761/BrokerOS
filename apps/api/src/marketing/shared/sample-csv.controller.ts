import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SAMPLE_CSV_CONTENT } from '@brokeros/constants';

@Controller('api/marketing')
export class SampleCsvController {
  @Get('sample-csv')
  downloadSampleCsv(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="sample_marketing_leads.csv"',
    );
    res.send(SAMPLE_CSV_CONTENT);
  }
}
