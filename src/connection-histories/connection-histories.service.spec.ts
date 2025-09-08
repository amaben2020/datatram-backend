import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionHistoriesService } from './connection-histories.service';

describe('ConnectionHistoriesService', () => {
  let service: ConnectionHistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionHistoriesService],
    }).compile();

    service = module.get<ConnectionHistoriesService>(ConnectionHistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
