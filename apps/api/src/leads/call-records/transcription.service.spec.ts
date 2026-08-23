import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionService } from './transcription.service.js';
import { AvailableProjectDto } from './dto/call-record.dto.js';

// Mock dependencies
jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue('mocked-stream'),
}));

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn().mockResolvedValue({ text: 'mocked transcription text' }),
      },
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  summary: 'Test summary',
                  nextStepSuggestion: 'Do this',
                  scheduleFollowUp: true,
                  score: 85,
                  category: 'HOT',
                  suggestedStatus: 'CONTACTED',
                  transitionNote: 'Called',
                }),
              },
            },
          ],
        }),
      },
    },
  }));
});

describe('TranscriptionService', () => {
  let service: TranscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranscriptionService],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
    process.env.GROQ_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transcribeAudio', () => {
    it('should throw error if API key is missing', async () => {
      process.env.GROQ_API_KEY = '';
      await expect(service.transcribeAudio('dummy.mp3')).rejects.toThrow('Groq API Key is missing');
    });

    it('should transcribe audio successfully', async () => {
      const text = await service.transcribeAudio('dummy.mp3');
      expect(text).toBe('mocked transcription text');
    });
  });

  describe('summarizeCall', () => {
    it('should handle missing API key', async () => {
      process.env.GROQ_API_KEY = 'your_api_key_here';
      const result = await service.summarizeCall('test transcript');
      expect(result).toContain('Groq API Key not configured');
    });

    it('should summarize successfully', async () => {
      const result = await service.summarizeCall('test transcript', 'NEW', [{ id: 'p1', name: 'Project 1' } as AvailableProjectDto]);
      expect(typeof result).toBe('object');
      if (typeof result === 'object') {
        expect(result.summary).toBe('Test summary');
        expect(result.scheduleFollowUp).toBe(true);
      }
    });
  });

  describe('generateLeadScore', () => {
    it('should generate a lead score', async () => {
      const result = await service.generateLeadScore('test transcript');
      expect(result).toEqual({ score: 85, category: 'HOT' });
    });
  });

  describe('generateAutoStatusAndNote', () => {
    it('should generate auto status for LEAD', async () => {
      const result = await service.generateAutoStatusAndNote('NEW', ['summary 1']);
      expect(result).toEqual({ suggestedStatus: 'CONTACTED', transitionNote: 'Called' });
    });
  });
});
