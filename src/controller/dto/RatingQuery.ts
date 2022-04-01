import {
  IsBoolean,
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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

  @IsOptional()
  @IsString()
  discordId: string;

  @IsOptional()
  @IsBoolean()
  @Transform((val: TransformFnParams) => {
    return (
      val.value === 'true' ||
      val.value === true ||
      val.value === 1 ||
      val.value === '1'
    );
  })
  unrated: boolean;
}
