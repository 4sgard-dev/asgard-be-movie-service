import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateVote {
  @IsNotEmpty()
  @IsBoolean()
  interest: boolean;
}
