import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvent {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  eventDate: Date;

  @ValidateIf((o: CreateEvent) => o.imdbId === undefined)
  @IsNotEmpty()
  @IsNumber()
  movieId: number;

  @ValidateIf((o: CreateEvent) => o.movieId === undefined)
  @IsNotEmpty()
  @IsString()
  imdbId: string;
}
