import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateRating {
  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
