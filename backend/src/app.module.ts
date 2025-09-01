import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module';
import { NotesModule } from './notes/notes.module';
import { UsersModule } from './users/users.module';
import { Project } from './entities/project.entity';
import { Note } from './entities/note.entity';
import { User } from './entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'root',
      database: process.env.DATABASE_NAME || 'billor',
      entities: [Project, Note, User],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([Project, Note, User]),
    ProjectsModule,
    NotesModule,
    UsersModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
