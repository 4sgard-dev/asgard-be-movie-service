import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../entities/Movie';
import { MovieService } from '../../service/movie/movie.service';

@Controller('movies')
export class MovieController {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private movieService: MovieService,
  ) {}

  @Get()
  async getMovies(
    @Query('imdbId') imdbId: string,
    @Query('search') search: string,
  ): Promise<Movie[]> {
    if (imdbId) {
      const movie = await this.movieService.getMovieByImdbId(imdbId);

      if (!movie) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      return movie;
    }

    if (search) {
      return this.movieService.searchMovieByName(search);
    }

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

  @Get(':id')
  async getMovie(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('m')
      .select('m.movie_id', 'id')
      .addSelect('m.name', 'name')
      .addSelect('m.imdb_id', 'imdbId')
      .addSelect('ROUND(avg(r.rating), 2)', 'rating')
      .where('m.movie_id = :id')
      .innerJoin('m.ratings', 'r')
      .groupBy('m.movie_id')
      .setParameter('id', id)
      .getRawOne();

    if (!movie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return movie;
  }
}
