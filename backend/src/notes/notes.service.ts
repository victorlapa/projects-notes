import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Note } from '../entities/note.entity';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNoteDto } from './dto/query-note.dto';

export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createNoteDto: CreateNoteDto, etag?: string): Promise<Note> {
    const project = await this.projectRepository.findOne({
      where: { id: createNoteDto.projectId },
    });

    if (!project) {
      throw new BadRequestException(
        `Project with ID ${createNoteDto.projectId} not found`,
      );
    }

    const existingNote = await this.noteRepository.findOne({
      where: {
        content: createNoteDto.content,
        projectId: createNoteDto.projectId,
      },
    });

    if (existingNote) {
      return existingNote;
    }

    const note = this.noteRepository.create(createNoteDto);
    return await this.noteRepository.save(note);
  }

  async findAll(queryDto: QueryNoteDto): Promise<PaginationResult<Note>> {
    const { search, limit = '10', cursor, projectId, status, color } = queryDto;
    const takeLimit = Math.min(parseInt(limit), 50);

    const queryBuilder = this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.project', 'project')
      .orderBy('note.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere('note.content ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (projectId) {
      queryBuilder.andWhere('note.projectId = :projectId', { projectId });
    }

    if (status) {
      queryBuilder.andWhere('note.status = :status', { status });
    }

    if (color) {
      queryBuilder.andWhere('note.color = :color', { color });
    }

    if (cursor) {
      const cursorNote = await this.noteRepository.findOne({
        where: { id: cursor },
        select: ['createdAt'],
      });

      if (cursorNote) {
        queryBuilder.andWhere('note.createdAt < :cursorDate', {
          cursorDate: cursorNote.createdAt,
        });
      }
    }

    const notes = await queryBuilder.take(takeLimit + 1).getMany();

    const hasMore = notes.length > takeLimit;
    const data = hasMore ? notes.slice(0, takeLimit) : notes;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data,
      hasMore,
      nextCursor,
    };
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    etag?: string,
  ): Promise<Note> {
    const note = await this.findOne(id);

    if (updateNoteDto.projectId && updateNoteDto.projectId !== note.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: updateNoteDto.projectId },
      });

      if (!project) {
        throw new BadRequestException(
          `Project with ID ${updateNoteDto.projectId} not found`,
        );
      }
    }

    if (updateNoteDto.content) {
      const projectIdToCheck = updateNoteDto.projectId || note.projectId;
      const existingNote = await this.noteRepository.findOne({
        where: {
          content: updateNoteDto.content,
          projectId: projectIdToCheck,
        },
      });

      if (existingNote && existingNote.id !== id) {
        return existingNote;
      }
    }

    Object.assign(note, updateNoteDto);
    return await this.noteRepository.save(note);
  }

  async remove(id: string): Promise<void> {
    const note = await this.findOne(id);
    await this.noteRepository.remove(note);
  }

  async findByProject(projectId: string): Promise<Note[]> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new BadRequestException(`Project with ID ${projectId} not found`);
    }

    return await this.noteRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
  }
}
