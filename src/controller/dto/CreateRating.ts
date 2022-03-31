import { IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class CreateRating {
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @ValidateIf((o: CreateRating) => o.imdbId === undefined)
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @ValidateIf((o: CreateRating) => o.movieId === undefined)
  @IsNotEmpty()
  @IsString()
  imdbId: string;
}
