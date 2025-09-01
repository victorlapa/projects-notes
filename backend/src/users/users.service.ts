import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, etag?: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { name: createUserDto.name },
    });

    if (existingUser) {
      return existingUser;
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginationResult<User>> {
    const { search, limit = '10', cursor } = queryDto;
    const takeLimit = Math.min(parseInt(limit), 50);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.notes', 'notes')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      queryBuilder.where('user.name ILIKE :search', { search: `%${search}%` });
    }

    if (cursor) {
      const cursorUser = await this.userRepository.findOne({
        where: { id: cursor },
        select: ['createdAt'],
      });

      if (cursorUser) {
        queryBuilder.andWhere('user.createdAt < :cursorDate', {
          cursorDate: cursorUser.createdAt,
        });
      }
    }

    const users = await queryBuilder.take(takeLimit + 1).getMany();

    const hasMore = users.length > takeLimit;
    const data = hasMore ? users.slice(0, takeLimit) : users;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return {
      data,
      hasMore,
      nextCursor,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['notes', 'notes.project'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    etag?: string,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.name) {
      const existingUser = await this.userRepository.findOne({
        where: { name: updateUserDto.name },
      });

      if (existingUser && existingUser.id !== id) {
        return existingUser;
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async getUserNotes(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['notes', 'notes.project'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user.notes;
  }
}
