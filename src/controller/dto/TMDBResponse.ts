export interface MovieResult {
  overview: string;
  release_date: string;
  title: string;
  id: number;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  vote_average: number;
  vote_count: number;
  video: boolean;
  poster_path: string;
  popularity: number;
}

export interface TMDBResponse {
  movie_results: MovieResult[];
  person_results: any[];
  tv_results: any[];
  tv_episode_results: any[];
  tv_season_results: any[];
}
