import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Project } from "./Project"

export enum NoteStatus {
    BACKLOG = "BACKLOG",
    DOING = "DOING",
    DONE = "DONE"
}

export enum NoteColor {
    YELLOW = "yellow",
    PINK = "pink", 
    BLUE = "blue",
    GREEN = "green"
}

@Entity()
export class Note {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    content: string

    @Column({
        type: "enum",
        enum: NoteColor
    })
    color: NoteColor

    @Column({
        type: "enum",
        enum: NoteStatus
    })
    status: NoteStatus

    @ManyToOne(() => Project, project => project.notes)
    project: Project

}