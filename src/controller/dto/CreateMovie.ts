import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMovie {
  @IsNotEmpty()
  @IsString()
  imdbId: string;
}
