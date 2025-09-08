import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionHistoriesController } from './connection-histories.controller';

describe('ConnectionHistoriesController', () => {
  let controller: ConnectionHistoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionHistoriesController],
    }).compile();

    controller = module.get<ConnectionHistoriesController>(ConnectionHistoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
