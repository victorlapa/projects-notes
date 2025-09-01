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
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ProjectsService, PaginationResult } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { Project } from '../entities/project.entity';

@ApiTags('projects')
@Controller('projects')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new project',
    description:
      'Creates a new project with the provided name. Supports idempotency via If-None-Match header.',
  })
  @ApiHeader({
    name: 'If-None-Match',
    description:
      'ETag value for idempotency. If provided, prevents duplicate creation.',
    required: false,
    example: '"1638360000000"',
  })
  @ApiBody({
    description: 'Project creation data',
    type: CreateProjectDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: Project,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Duplicate creation attempt (idempotency)',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Headers('if-none-match') etag?: string,
  ): Promise<Project> {
    return await this.projectsService.create(createProjectDto, etag);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects with pagination and search',
    description:
      'Retrieves a paginated list of projects. Supports search by name and cursor-based pagination.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter projects by name',
    example: 'mobile app',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of projects to return (1-100)',
    example: '20',
  })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description:
      'Cursor for pagination (UUID of last project from previous page)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
  })
  async findAll(
    @Query() queryDto: QueryProjectDto,
  ): Promise<PaginationResult<Project>> {
    return await this.projectsService.findAll(queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Project> {
    const project = await this.projectsService.findOne(id);

    const etag = `"${project.updatedAt.getTime()}"`;
    res.set('ETag', etag);

    return project;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Headers('if-match') etag?: string,
  ): Promise<Project> {
    return await this.projectsService.update(id, updateProjectDto, etag);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.projectsService.remove(id);
  }
}
