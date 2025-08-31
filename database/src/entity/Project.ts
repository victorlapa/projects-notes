import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Note } from "./Note"

@Entity()
export class Project {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    name: string

    @OneToMany(() => Note, note => note.project)
    notes: Note[]

}