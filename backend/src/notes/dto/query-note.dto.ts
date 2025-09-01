import { IsOptional, IsString, IsUUID, IsNumberString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NoteColor, NoteStatus } from '../../entities/note.entity';

export class QueryNoteDto {
  @ApiPropertyOptional({
    description: 'Search term to filter notes by content',
    example: 'authentication',
    type: String
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of notes to return per page (1-100)',
    example: '20',
    default: '20',
    type: String
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (UUID of the last note from previous page)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String
  })
  @IsOptional()
  @IsUUID()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Filter notes by project UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter notes by status',
    enum: NoteStatus,
    example: NoteStatus.BACKLOG,
    enumName: 'NoteStatus'
  })
  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @ApiPropertyOptional({
    description: 'Filter notes by color',
    enum: NoteColor,
    example: NoteColor.YELLOW,
    enumName: 'NoteColor'
  })
  @IsOptional()
  @IsEnum(NoteColor)
  color?: NoteColor;
}