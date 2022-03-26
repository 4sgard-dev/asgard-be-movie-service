import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../../entities/Movie';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async getMovieByImdbId(imdbId: string) {
    const movie = await this.movieRepository
      .createQueryBuilder('m')
      .select('m.movie_id', 'id')
      .addSelect('m.name', 'name')
      .addSelect('m.imdb_id', 'imdbId')
      .addSelect('ROUND(avg(r.rating), 2)', 'rating')
      .where('m.imdb_id = :id')
      .innerJoin('m.ratings', 'r')
      .groupBy('m.movie_id')
      .setParameter('id', imdbId)
      .getRawOne();

    return movie;
  }
}
