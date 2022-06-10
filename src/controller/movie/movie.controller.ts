import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { MovieQuery } from '../dto/MovieQuery';
import { Suggestion } from '../../entities/Suggestion';
import { EventGridBuilder, EventType } from '../../utils/event.utils';
import { DaprService } from '../../service/dapr/dapr.service';

@Controller('movies')
export class MovieController {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Suggestion)
    private suggestionRepository: Repository<Suggestion>,
    private movieService: MovieService,
    private tmdbService: TmdbService,
    private daprService: DaprService,
  ) {}

  @Get()
  async getMovies(@Query() query: MovieQuery): Promise<Movie[]> {
    if (query.imdbId) {
      const movie = await this.movieService.getMovieByImdbId(query.imdbId);

      if (!movie) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      return movie;
    }

    if (query.search) {
      return this.movieService.searchMovieByName(query.search);
    }

    if (query.latest) {
      return this.movieService.getLatestMovies();
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

  @Delete(':id')
  async deleteMovie(
    @Param('id', ParseIntPipe) id: number,
    @Headers('discord-id') discordId: string,
  ) {
    const movie = await this.movieRepository.findOneBy({ movieId: id });

    if (!movie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.movieRepository.delete(id);

    const egEvent = EventGridBuilder.build(EventType.MovieDeleted, 'movie', {
      discordId,
      name: movie.name,
      imdbId: movie.imdbId,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return movie;
  }

  @Post()
  async createMovie(
    @Body() movie: CreateMovie,
    @Headers('discord-id') discordId: string,
  ) {
    const movieEntity = await this.movieRepository.findOneBy({
      imdbId: movie.imdbId,
    });

    if (movieEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const imdbMovie = await this.tmdbService
      .getMovieByImdbId(movie.imdbId)
      .toPromise();

    if (!imdbMovie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.suggestionRepository.delete({ imdbId: movie.imdbId });

    console.log(imdbMovie);

    const movieEntityPersist = {
      imdbId: movie.imdbId,
      name: imdbMovie.title,
      posterPath: imdbMovie.poster_path,
    } as Movie;

    await this.movieRepository.save(movieEntityPersist);

    const egEvent = EventGridBuilder.build(EventType.MovieCreated, 'movie', {
      discordId,
      name: imdbMovie.title,
      imdbId: imdbMovie.id,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return;
  }
}
