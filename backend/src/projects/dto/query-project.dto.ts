import { IsOptional, IsString, IsUUID, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProjectDto {
  @ApiPropertyOptional({
    description: 'Search term to filter projects by name',
    example: 'mobile app',
    type: String
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of projects to return per page (1-100)',
    example: '20',
    default: '20',
    type: String
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (UUID of the last project from previous page)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String
  })
  @IsOptional()
  @IsUUID()
  cursor?: string;
}