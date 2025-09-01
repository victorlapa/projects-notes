import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Note } from './entities/note.entity';
import { User } from './entities/user.entity';
import { NoteStatus, NoteColor } from './entities/note.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    const existingProjects = await this.projectRepository.count();
    if (existingProjects > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding database with sample data...');

    const user1 = this.userRepository.create({
      name: 'John Doe'
    });
    const user2 = this.userRepository.create({
      name: 'Jane Smith'
    });
    await this.userRepository.save([user1, user2]);

    const project1 = this.projectRepository.create({
      name: 'Mobile App Development'
    });
    const project2 = this.projectRepository.create({
      name: 'Website Redesign'
    });
    await this.projectRepository.save([project1, project2]);

    const notes = [
      this.noteRepository.create({
        content: 'Setup project structure and dependencies',
        color: NoteColor.BLUE,
        status: NoteStatus.DONE,
        projectId: project1.id,
        userId: user1.id
      }),
      this.noteRepository.create({
        content: 'Design user authentication flow',
        color: NoteColor.YELLOW,
        status: NoteStatus.DOING,
        projectId: project1.id,
        userId: user1.id
      }),
      this.noteRepository.create({
        content: 'Implement API endpoints for user management',
        color: NoteColor.PINK,
        status: NoteStatus.BACKLOG,
        projectId: project1.id,
        userId: user2.id
      }),
      this.noteRepository.create({
        content: 'Create responsive navigation component',
        color: NoteColor.GREEN,
        status: NoteStatus.DOING,
        projectId: project2.id,
        userId: user2.id
      }),
      this.noteRepository.create({
        content: 'Update brand colors and typography',
        color: NoteColor.YELLOW,
        status: NoteStatus.BACKLOG,
        projectId: project2.id
      })
    ];

    await this.noteRepository.save(notes);

    console.log('Database seeded successfully!');
  }
}