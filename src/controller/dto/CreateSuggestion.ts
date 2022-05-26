import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSuggestion {
  @IsNotEmpty()
  @IsString()
  imdbId: string;
}
