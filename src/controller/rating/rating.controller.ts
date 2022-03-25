import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Rating } from '../../entities/Rating';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateRating } from '../dto/UpdateRating';

@Controller('ratings')
export class RatingController {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  @Get()
  async getRatingByMovieId(
    @Query('movieId', ParseIntPipe) movieId: number,
  ): Promise<Rating[]> {
    return this.ratingRepository.find({
      relations: {
        user: true,
      },
      where: { movieId: movieId },
    });
  }

  @Post(':id')
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
}
