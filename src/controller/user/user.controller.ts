import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/User';
import { Equal, Repository } from 'typeorm';
import { CreateRating } from '../dto/CreateRating';
import { CreateUser } from '../dto/CreateUser';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private userRepostiory: Repository<User>,
  ) {}

  @Post()
  async createUser(@Body() user: CreateUser) {
    const userEntity: User = await this.userRepostiory.findOne({
      where: {
        discordId: Equal(user.discordId),
      },
    });

    if (userEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const userEntityPersist = {
      discordId: user.discordId,
      username: user.username,
    };

    await this.userRepostiory.save(userEntityPersist);
  }
}
