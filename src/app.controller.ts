import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Repository } from 'typeorm';
import { User } from './entities/User';
import { InjectRepository } from '@nestjs/typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Get()
  async getHello(): Promise<number> {
    return this.usersRepository.count();
  }
}
