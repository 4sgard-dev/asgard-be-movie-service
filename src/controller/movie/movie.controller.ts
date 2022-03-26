import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../entities/Movie';
import { MovieService } from '../../service/movie/movie.service';
import { UpdateRating } from '../dto/UpdateRating';
import { CreateMovie } from '../dto/CreateMovie';
import { TmdbService } from '../../service/tmdb/tmdb.service';

@Controller('movies')
export class MovieController {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private movieService: MovieService,
    private tmdbService: TmdbService,
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
      .leftJoin('m.ratings', 'r')
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
      .leftJoin('m.ratings', 'r')
      .groupBy('m.movie_id')
      .setParameter('id', id)
      .getRawOne();

    if (!movie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return movie;
  }

  @Post()
  async createMovie(@Body() movie: CreateMovie) {
    const imdbMovie = await this.tmdbService
      .getMovieByImdbId(movie.imdbId)
      .toPromise();

    if (!imdbMovie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    console.log(imdbMovie);

    const movieEntityPersist = {
      imdbId: movie.imdbId,
      name: imdbMovie.title,
    } as Movie;

    await this.movieRepository.save(movieEntityPersist);

    return;
  }
}
