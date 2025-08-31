import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Project } from "./Project";
import { User } from "./User";

export enum NoteStatus {
  BACKLOG = "BACKLOG",
  DOING = "DOING",
  DONE = "DONE",
}

export enum NoteColor {
  YELLOW = "YELLOW",
  PINK = "PINK",
  BLUE = "BLUE",
  GREEN = "GREEN",
}

@Entity({ name: "notes" })
export class Note {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column({
    type: "enum",
    enum: NoteColor,
  })
  color: NoteColor;

  @Column({
    type: "enum",
    enum: NoteStatus,
  })
  status: NoteStatus;

  @ManyToOne(() => Project, (project) => project.notes)
  project: Project;

  @ManyToOne(() => User, (user) => user.notes)
  user: User;
}
