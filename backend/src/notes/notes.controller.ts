import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { NotesService, PaginationResult } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';
import { Note } from '../entities/note.entity';

@ApiTags('notes')
@Controller('notes')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new note',
    description:
      'Creates a new note with content, color, status, and project assignment. Supports idempotency via If-None-Match header.',
  })
  @ApiHeader({
    name: 'If-None-Match',
    description:
      'ETag value for idempotency. If provided, prevents duplicate creation.',
    required: false,
    example: '"1638360000000"',
  })
  @ApiBody({
    description: 'Note creation data',
    type: CreateNoteDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: Note,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Headers('if-none-match') etag?: string,
  ): Promise<Note> {
    return await this.notesService.create(createNoteDto, etag);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  async findAll(
    @Query() queryDto: QueryNoteDto,
  ): Promise<PaginationResult<Note>> {
    return await this.notesService.findAll(queryDto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all notes for a specific project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project notes retrieved successfully',
  })
  async findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<Note[]> {
    return await this.notesService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by ID' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note retrieved successfully',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Note> {
    const note = await this.notesService.findOne(id);

    const etag = `"${note.updatedAt.getTime()}"`;
    res.set('ETag', etag);

    return note;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: Note,
  })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Headers('if-match') etag?: string,
  ): Promise<Note> {
    return await this.notesService.update(id, updateNoteDto, etag);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'id', description: 'Note ID' })
  @ApiResponse({ status: 204, description: 'Note deleted successfully' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.notesService.remove(id);
  }
}
