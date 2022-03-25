import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUser {
  @IsNotEmpty()
  @IsString()
  discordId: string;

  @IsNotEmpty()
  @IsString()
  username: string;
}
