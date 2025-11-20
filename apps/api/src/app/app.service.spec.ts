import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

/** Unit tests for AppService. */
describe('AppService', () => {
  let service: AppService;

  /** Initialize testing module. */
  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  /** Validate default response. */
  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
