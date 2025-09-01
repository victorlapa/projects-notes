import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the project',
    example: 'My Awesome Project',
    minLength: 1,
    maxLength: 100,
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}