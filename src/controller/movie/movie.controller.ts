import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../entities/Movie';

@Controller('movies')
export class MovieController {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  @Get()
  async getMovies(): Promise<Movie[]> {
    return this.movieRepository
      .createQueryBuilder('m')
      .select('m.movie_id', 'id')
      .addSelect('m.name', 'name')
      .addSelect('m.imdb_id', 'imdbId')
      .addSelect('ROUND(avg(r.rating), 2)', 'rating')
      .innerJoin('m.ratings', 'r')
      .groupBy('m.movie_id')
      .getRawMany();
  }
}
