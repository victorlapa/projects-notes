import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Note } from './note.entity';

@Entity('projects')
export class Project {
  @ApiProperty({
    description: 'Unique identifier for the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Name of the project',
    example: 'Mobile App',
    maxLength: 100,
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Timestamp when the project was created',
    example: '2023-12-01T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the project was last updated',
    example: '2023-12-01T15:45:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'Array of notes associated with this project',
    type: () => Note,
    isArray: true,
  })
  @OneToMany(() => Note, (note) => note.project)
  notes: Note[];
}
