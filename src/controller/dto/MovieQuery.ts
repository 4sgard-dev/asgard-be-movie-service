import { IsOptional, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class MovieQuery {
  @IsOptional()
  @IsString()
  imdbId: string;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @Transform((val: TransformFnParams) => val.value === 'true')
  latest: boolean;
}
