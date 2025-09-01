import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';

export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    etag?: string,
  ): Promise<Project> {
    const existingProject = await this.projectRepository.findOne({
      where: { name: createProjectDto.name },
    });

    if (existingProject) {
      return existingProject;
    }

    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
  }

  async findAll(queryDto: QueryProjectDto): Promise<PaginationResult<Project>> {
    const { search, limit = '10', cursor } = queryDto;
    const takeLimit = Math.min(parseInt(limit), 50);

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.notes', 'notes')
      .orderBy('project.createdAt', 'DESC');

    if (search) {
      queryBuilder.where('project.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (cursor) {
      const cursorProject = await this.projectRepository.findOne({
        where: { id: cursor },
        select: ['createdAt'],
      });

      if (cursorProject) {
        queryBuilder.andWhere('project.createdAt < :cursorDate', {
          cursorDate: cursorProject.createdAt,
        });
      }
    }

    const projects = await queryBuilder.take(takeLimit + 1).getMany();

    const hasMore = projects.length > takeLimit;
    const data = hasMore ? projects.slice(0, takeLimit) : projects;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data,
      hasMore,
      nextCursor,
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['notes'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    etag?: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    if (updateProjectDto.name) {
      const existingProject = await this.projectRepository.findOne({
        where: { name: updateProjectDto.name },
      });

      if (existingProject && existingProject.id !== id) {
        throw new ConflictException('Project with this name already exists');
      }
    }

    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}
