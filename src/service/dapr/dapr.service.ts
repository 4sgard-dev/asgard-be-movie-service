import { Injectable } from '@nestjs/common';
import { DaprClient } from 'dapr-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DaprService {
  public client: DaprClient;

  constructor(private configService: ConfigService) {
    this.client = new DaprClient(
      configService.get<string>('DAPR_HOST'),
      configService.get<string>('DAPR_PORT'),
    );
  }
}
