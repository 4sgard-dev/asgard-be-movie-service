import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../../entities/Movie';
import { Repository } from 'typeorm';
import { Rating } from '../../entities/Rating';

@Controller('counts')
export class CountController {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
  ) {}

  @Get('movie')
  async getMovieCount(): Promise<any> {
    return { count: await this.movieRepository.count() };
  }

  @Get('rating')
  async getRatingAverage(): Promise<any> {
    return this.ratingRepository
      .createQueryBuilder('r')
      .select('ROUND(avg(r.rating), 2)', 'average')
      .getRawOne();
  }
}
