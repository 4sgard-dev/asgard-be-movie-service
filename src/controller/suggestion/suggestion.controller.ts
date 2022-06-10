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
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../../entities/Movie';
import { Equal, Repository } from 'typeorm';
import { MovieService } from '../../service/movie/movie.service';
import { TmdbService } from '../../service/tmdb/tmdb.service';
import { Suggestion } from '../../entities/Suggestion';
import { CreateSuggestion } from '../dto/CreateSuggestion';
import { User } from '../../entities/User';
import { CreateVote } from '../dto/CreateVote';
import { Vote } from '../../entities/Vote';
import { DaprService } from '../../service/dapr/dapr.service';
import { EventGridBuilder, EventType } from '../../utils/event.utils';

@Controller('suggestions')
export class SuggestionController {
  constructor(
    @InjectRepository(Suggestion)
    private suggestionRepository: Repository<Suggestion>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    private movieService: MovieService,
    private tmdbService: TmdbService,
    private daprService: DaprService,
  ) {}

  @Get()
  async getSuggestions() {
    const { raw, entities } = await this.suggestionRepository
      .createQueryBuilder('s')
      //.select('s.*')
      .addSelect('interested.interested', 's_interested')
      .addSelect('not_interested.not_interested', 's_notInterested')
      .leftJoinAndSelect('s.user', 'user')
      .leftJoin(
        (qb) =>
          qb
            .select('v.suggestion_id')
            .addSelect('count(*)', 'interested')
            .from(Vote, 'v')
            .where('v.interest = :interest', { interest: true })
            .groupBy('v.suggestion_id'),
        'interested',
        'interested.suggestion_id = s.suggestion_id',
      )
      .leftJoin(
        (qb) =>
          qb
            .select('v.suggestion_id')
            .addSelect('count(*)', 'not_interested')
            .from(Vote, 'v')
            .where('v.interest = :not_interest', { not_interest: false })
            .groupBy('v.suggestion_id'),
        'not_interested',
        'not_interested.suggestion_id = s.suggestion_id',
      )
      .leftJoinAndSelect(
        's.votes',
        'votes',
        'votes.suggestion_id = s.suggestion_id',
      )
      .leftJoinAndSelect('votes.user', 'vu', 'vu.user_id = votes.user_id')
      .getRawAndEntities();

    for (let i = 0; i < entities.length; i++) {
      entities[i].interested = +raw[i].s_interested;
      entities[i].notInterested = +raw[i].s_notInterested || 0;
    }

    return entities;
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

    const egEvent = EventGridBuilder.build(
      EventType.SuggestionCreated,
      'suggestion',
      {
        discordId: userEntity.discordId,
        name: imdbMovie.title,
        imdbId: suggestion.imdbId,
      },
    );

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return;
  }

  @Delete(':id')
  async deleteSuggestion(
    @Param('id') imdbId: string,
    @Headers('discord-id') discordId: string,
  ) {
    const suggestion = await this.suggestionRepository.findOne({
      where: { imdbId },
    });

    if (!suggestion) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    await this.suggestionRepository.delete({ imdbId });

    const egEvent = EventGridBuilder.build(
      EventType.SuggestionDeleted,
      'suggestion',
      {
        discordId,
        name: suggestion.name,
        imdbId: suggestion.imdbId,
      },
    );

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return suggestion;
  }

  @Get(':id/votes')
  async getVotes(@Param('id', ParseIntPipe) suggestionId: number) {
    const suggestion = await this.suggestionRepository.findOne({
      where: { suggestionId: suggestionId },
    });

    if (!suggestion) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    return this.voteRepository.find({
      where: { suggestion: Equal(suggestion) },
    });
  }

  @Put(':id/votes')
  async updateVote(
    @Body() vote: CreateVote,
    @Param('id', ParseIntPipe) suggestionId: number,
    @Headers('discord-id') discordId: string,
  ) {
    const suggestion = await this.suggestionRepository.findOne({
      where: { suggestionId: suggestionId },
    });

    if (!suggestion) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const userEntity: User = await this.userRepository.findOne({
      where: {
        discordId: Equal(discordId),
      },
    });

    if (!userEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const voteEntityPersist = {
      suggestion,
      user: userEntity,
      interest: vote.interest,
      created: new Date(),
    } as Vote;

    const voteEntity = await this.voteRepository.findOne({
      where: {
        suggestion: Equal(suggestion),
        user: Equal(userEntity),
      },
    });

    if (voteEntity) {
      await this.voteRepository.update(
        { voteId: voteEntity.voteId },
        { voteId: voteEntity.voteId, ...voteEntityPersist },
      );
    } else {
      await this.voteRepository.save(voteEntityPersist);
    }
  }
}
