import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvent {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  eventDate: Date;

  @IsNotEmpty()
  @IsNumber()
  movieId: number;
}
