import { IsString, IsNotEmpty, IsEnum, IsUUID, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NoteColor, NoteStatus } from '../../entities/note.entity';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The content/text of the note',
    example: 'Remember to implement user authentication',
    minLength: 1,
    maxLength: 1000,
    type: String
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @MaxLength(1000, { message: 'Content must be at most 1000 characters long' })
  content: string;

  @ApiProperty({
    description: 'The color of the note for visual categorization',
    enum: NoteColor,
    example: NoteColor.YELLOW,
    enumName: 'NoteColor'
  })
  @IsEnum(NoteColor)
  color: NoteColor;

  @ApiProperty({
    description: 'The current status of the note in the workflow',
    enum: NoteStatus,
    example: NoteStatus.BACKLOG,
    enumName: 'NoteStatus'
  })
  @IsEnum(NoteStatus)
  status: NoteStatus;

  @ApiProperty({
    description: 'UUID of the project this note belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String
  })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'UUID of the user assigned to this note (optional)',
    example: '987fcdeb-51a2-43d1-b789-123456789abc',
    format: 'uuid',
    type: String
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}