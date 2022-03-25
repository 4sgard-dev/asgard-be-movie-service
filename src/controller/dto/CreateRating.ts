import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRating {
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsNumber()
  movieId: number;
}
