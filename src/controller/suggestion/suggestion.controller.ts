import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../../entities/Movie';
import { Equal, Repository } from 'typeorm';
import { MovieService } from '../../service/movie/movie.service';
import { TmdbService } from '../../service/tmdb/tmdb.service';
import { Suggestion } from '../../entities/Suggestion';
import { CreateSuggestion } from '../dto/CreateSuggestion';
import { User } from '../../entities/User';

@Controller('suggestions')
export class SuggestionController {
  constructor(
    @InjectRepository(Suggestion)
    private suggestionRepository: Repository<Suggestion>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private movieService: MovieService,
    private tmdbService: TmdbService,
  ) {}

  @Get()
  async getSuggestions() {
    return this.suggestionRepository.find({ relations: { user: true } });
  }

  @Post()
  async createSuggestion(
    @Body() suggestion: CreateSuggestion,
    @Headers('discord-id') discordId: string,
  ) {
    const movieEntity = await this.movieRepository.findOneBy({
      imdbId: suggestion.imdbId,
    });

    if (movieEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const suggestionEntity = await this.suggestionRepository.findOneBy({
      imdbId: suggestion.imdbId,
    });

    if (suggestionEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const imdbMovie = await this.tmdbService
      .getMovieByImdbId(suggestion.imdbId)
      .toPromise();

    if (!imdbMovie) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    console.log(imdbMovie);

    const userEntity: User = await this.userRepository.findOne({
      where: {
        discordId: Equal(discordId),
      },
    });

    if (!userEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const movieEntityPersist = {
      imdbId: suggestion.imdbId,
      name: imdbMovie.title,
      posterPath: imdbMovie.poster_path,
      user: userEntity,
      created: new Date(),
    } as Suggestion;

    await this.suggestionRepository.save(movieEntityPersist);

    return;
  }
}
