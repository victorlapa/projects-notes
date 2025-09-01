import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Project } from "./project.entity";
import { User } from "./user.entity";

export enum NoteStatus {
    BACKLOG = "BACKLOG",
    DOING = "DOING", 
    DONE = "DONE"
}

export enum NoteColor {
    YELLOW = "YELLOW",
    PINK = "PINK",
    BLUE = "BLUE", 
    GREEN = "GREEN"
}

@Entity('notes')
export class Note {
    @ApiProperty({
        description: 'Unique identifier for the note',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        description: 'The content/text of the note',
        example: 'Remember to implement user authentication',
        maxLength: 1000
    })
    @Column()
    content: string;

    @ApiProperty({
        description: 'The color of the note for visual categorization',
        enum: NoteColor,
        example: NoteColor.YELLOW,
        enumName: 'NoteColor'
    })
    @Column({
        type: "enum",
        enum: NoteColor,
        default: NoteColor.YELLOW
    })
    color: NoteColor;

    @ApiProperty({
        description: 'The current status of the note in the workflow',
        enum: NoteStatus,
        example: NoteStatus.BACKLOG,
        enumName: 'NoteStatus'
    })
    @Column({
        type: "enum", 
        enum: NoteStatus,
        default: NoteStatus.BACKLOG
    })
    status: NoteStatus;

    @ApiProperty({
        description: 'Timestamp when the note was created',
        example: '2023-12-01T10:30:00.000Z'
    })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the note was last updated',
        example: '2023-12-01T15:45:00.000Z'
    })
    @UpdateDateColumn()
    updatedAt: Date;

    @ApiProperty({
        description: 'The project this note belongs to',
        type: () => Project
    })
    @ManyToOne(() => Project, project => project.notes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @ApiProperty({
        description: 'UUID of the project this note belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000',
        format: 'uuid'
    })
    @Column({ name: 'projectId' })
    projectId: string;

    @ApiPropertyOptional({
        description: 'The user assigned to this note (optional)',
        type: () => User
    })
    @ManyToOne(() => User, user => user.notes, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @ApiPropertyOptional({
        description: 'UUID of the user assigned to this note (optional)',
        example: '987fcdeb-51a2-43d1-b789-123456789abc',
        format: 'uuid'
    })
    @Column({ name: 'userId', nullable: true })
    userId?: string;
}