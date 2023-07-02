import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRating {
  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comment: string;
}
