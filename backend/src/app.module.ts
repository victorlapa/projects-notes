import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { Project } from './entities/project.entity';
import { Note } from './entities/note.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'project-notes',
      entities: [Project, Note, User],
      synchronize: true,
      logging: false,
    }),
    ProjectsModule,
    NotesModule,
    UsersModule,
  ],
})
export class AppModule {}
