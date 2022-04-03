import { IsNumber, IsOptional } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class EventQuery {
  @IsOptional()
  @IsNumber()
  @Transform((val: TransformFnParams) => parseInt(val.value))
  movieId: number;
}
