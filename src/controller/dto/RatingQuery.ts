import { IsNumber, IsOptional } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class RatingQuery {
  @IsOptional()
  @IsNumber()
  @Transform((val: TransformFnParams) => parseInt(val.value))
  movieId: number;

  @IsOptional()
  @IsNumber()
  @Transform((val: TransformFnParams) => parseInt(val.value))
  userId: number;
}
