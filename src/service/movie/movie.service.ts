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

  async getLatestMovies() {
    const movie = await this.movieRepository.manager
      .createQueryBuilder()
      .select('subquery.id', 'id')
      .addSelect('subquery.name', 'name')
      .addSelect('subquery.imdbid', 'imdbId')
      .addSelect('subquery.rating', 'rating')
      .addSelect('subquery.poster_path', 'posterPath')
      .addSelect('e.time', 'date')
      .from(
        (qb) =>
          qb
            .select('m.movie_id', 'id')
            .addSelect('m.name', 'name')
            .addSelect('m.imdb_id', 'imdbid')
            .addSelect('m.poster_path', 'poster_path')
            .addSelect('ROUND(avg(r.rating), 2)', 'rating')
            .from(Movie, 'm')
            .leftJoin('m.ratings', 'r')
            .groupBy('m.movie_id'),
        'subquery',
      )
      .innerJoin('event', 'e', 'subquery.id = e.movie_id')
      .orderBy('e.time', 'DESC')
      .limit(5)
      .getRawMany();

    return movie;
  }

  async searchMovieByName(name: string) {
    const movie = await this.movieRepository
      .createQueryBuilder('m')
      .select('m.movie_id', 'id')
      .addSelect('m.name', 'name')
      .addSelect('m.imdb_id', 'imdbId')
      .addSelect('ROUND(avg(r.rating), 2)', 'rating')
      .where(
        'LOWER(m.name) like LOWER(:name) OR m.movie_id = :id OR LOWER(m.imdb_id) like LOWER(:name)',
      )
      .leftJoin('m.ratings', 'r')
      .groupBy('m.movie_id')
      .setParameter('name', '%' + name + '%')
      .setParameter('id', Number(name) || 0)
      .getRawMany<Movie>();

    return movie;
  }
}
