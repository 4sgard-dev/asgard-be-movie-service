import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Rating } from '../../entities/Rating';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UpdateRating } from '../dto/UpdateRating';
import { CreateRating } from '../dto/CreateRating';
import { User } from '../../entities/User';
import { RatingQuery } from '../dto/RatingQuery';

@Controller('ratings')
export class RatingController {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private userRepostiory: Repository<User>,
  ) {}

  @Get()
  async getRatingByMovieId(@Query() query: RatingQuery): Promise<Rating[]> {
    if (query.movieId) {
      return this.ratingRepository.find({
        relations: {
          user: true,
        },
        where: { movieId: query.movieId },
      });
    }

    if (query.userId || query.discordId) {
      return this.ratingRepository.find({
        relations: {
          movie: true,
        },
        where: [
          {
            user: {
              userId: query.userId,
            },
          },
          {
            user: {
              discordId: query.discordId,
            },
          },
        ],
        order: {
          ratingId: 'DESC',
        },
      });
    }
  }

  @Delete(':id')
  async deleteRating(
    @Param('id', ParseIntPipe) id: number,
    @Headers('discord-id') discordId: string,
  ) {
    const ratingEntity: Rating = await this.ratingRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        ratingId: id,
      },
    });

    if (!ratingEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (ratingEntity.user.discordId != discordId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.ratingRepository.delete({ ratingId: id });
  }

  @Put(':id')
  async updateRating(
    @Body() rating: UpdateRating,
    @Param('id', ParseIntPipe) id: number,
    @Headers('discord-id') discordId: string,
  ) {
    const ratingEntity: Rating = await this.ratingRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        ratingId: id,
      },
    });

    if (!ratingEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    if (ratingEntity.user.discordId != discordId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    ratingEntity.rating = rating.rating;

    await this.ratingRepository.update({ ratingId: id }, ratingEntity);
  }

  @Post()
  async createRating(
    @Body() rating: CreateRating,
    @Headers('discord-id') discordId: string,
  ) {
    const ratingEntity: Rating = await this.ratingRepository.findOne({
      where: {
        movieId: rating.movieId,
        user: {
          discordId: Equal(discordId),
        },
      },
    });

    if (ratingEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const userEntity: User = await this.userRepostiory.findOne({
      where: {
        discordId: Equal(discordId),
      },
    });

    if (!userEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const ratingEntityPersist = {
      rating: rating.rating,
      movieId: rating.movieId,
      user: userEntity,
    };

    await this.ratingRepository.save(ratingEntityPersist);
  }
}
