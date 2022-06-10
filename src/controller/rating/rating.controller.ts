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
import { Equal, FindOneOptions, Repository } from 'typeorm';
import { UpdateRating } from '../dto/UpdateRating';
import { CreateRating } from '../dto/CreateRating';
import { User } from '../../entities/User';
import { RatingQuery } from '../dto/RatingQuery';
import { Movie } from '../../entities/Movie';
import { RatingService } from '../../service/rating/rating.service';
import { EventGridBuilder, EventType } from '../../utils/event.utils';
import { DaprService } from '../../service/dapr/dapr.service';

@Controller('ratings')
export class RatingController {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private ratingService: RatingService,
    private daprService: DaprService,
  ) {}

  @Get()
  async getRatingByMovieId(@Query() query: RatingQuery): Promise<Rating[]> {
    if (query.unrated && !query.userId && !query.discordId) {
      throw new HttpException(
        'Unprocessable entity',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (query.unrated) {
      return query.userId
        ? this.ratingService.getUnratedMoviesByUserId(query.userId)
        : this.ratingService.getUnratedMoviesByDiscordId(query.discordId);
    }

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

    const egEvent = EventGridBuilder.build(EventType.RatingDeleted, 'rating', {
      ...ratingEntity,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();
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

    const egEvent = EventGridBuilder.build(EventType.RatingUpdated, 'rating', {
      ...ratingEntity,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();
  }

  @Post()
  async createRating(
    @Body() rating: CreateRating,
    @Headers('discord-id') discordId: string,
  ) {
    const query: FindOneOptions<Rating> = rating.imdbId
      ? { where: { movie: { imdbId: rating.imdbId } } }
      : {
          where: {
            movieId: rating.movieId,
            user: {
              discordId: Equal(discordId),
            },
          },
        };

    const ratingEntity: Rating = await this.ratingRepository.findOne({
      where: {
        ...query.where,
        user: {
          discordId: discordId,
        },
      },
    });

    if (ratingEntity) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }

    const userEntity: User = await this.userRepository.findOne({
      where: {
        discordId: Equal(discordId),
      },
    });

    if (!userEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    let movieId = rating.movieId;

    if (rating.imdbId) {
      const movie = await this.movieRepository.findOneBy({
        imdbId: rating.imdbId,
      });

      if (!movie) {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }

      movieId = movie.movieId;
    }

    const ratingEntityPersist = {
      rating: rating.rating,
      movieId,
      user: userEntity,
    };

    const ratingPersisted = await this.ratingRepository.save(
      ratingEntityPersist,
    );

    const egEvent = EventGridBuilder.build(EventType.RatingCreated, 'rating', {
      ...ratingPersisted,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();
  }
}
