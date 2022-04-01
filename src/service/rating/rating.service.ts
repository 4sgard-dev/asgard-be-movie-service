import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from '../../entities/Rating';
import { Repository } from 'typeorm';
import { Movie } from '../../entities/Movie';
import * as SqlString from 'sqlstring';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  getUnratedMoviesByUserId(userId: number) {
    const ratingQuery = this.ratingRepository
      .createQueryBuilder('r')
      .select('r.movie_id')
      .where(`r.user_id = ${userId}`);

    return this.getUnratedQuery(ratingQuery.getQuery());
  }

  getUnratedMoviesByDiscordId(discordId: string) {
    const ratingQuery = this.ratingRepository
      .createQueryBuilder('r')
      .select('r.movie_id')
      .leftJoin('r.user', 'u')
      .where(`u.discord_id = '${SqlString.format(discordId)}'`);

    return this.getUnratedQuery(ratingQuery.getQuery());
  }

  private getUnratedQuery(query: string) {
    return this.movieRepository
      .createQueryBuilder('m')
      .select('m.movie_id', 'movieId')
      .addSelect('m.name', 'name')
      .where(`m.movie_id NOT IN (${query})`)
      .getRawMany();
  }
}
