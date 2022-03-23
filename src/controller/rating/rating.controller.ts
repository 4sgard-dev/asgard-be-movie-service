import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Rating } from '../../entities/Rating';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
}
