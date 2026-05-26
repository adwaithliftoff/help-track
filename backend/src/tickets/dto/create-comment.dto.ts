import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }) => value.trim())
  @IsString()
  @IsNotEmpty()
  comment: string;
}
