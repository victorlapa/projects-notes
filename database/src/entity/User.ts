import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Note } from "./Note";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Note, (note) => note.user)
  notes: Note[];
}
