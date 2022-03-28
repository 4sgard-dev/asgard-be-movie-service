import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { map, Observable } from 'rxjs';
import { MovieResult, TMDBResponse } from '../../controller/dto/TMDBResponse';

@Injectable()
export class TmdbService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  getMovieByImdbId(imdbId: string): Observable<MovieResult> {
    return this.httpService
      .get<TMDBResponse>(
        `${this.configService.get<string>('TMDB_URL')}/3/find/${imdbId}`,
        {
          params: {
            external_source: 'imdb_id',
          },
          headers: {
            Authorization:
              'Bearer ' + this.configService.get<string>('TMDB_API_TOKEN'),
          },
        },
      )
      .pipe(
        map((searchResult) => searchResult.data.movie_results),
        map((movieResult) =>
          movieResult.length === 0 ? null : movieResult[0],
        ),
      );
  }
}
