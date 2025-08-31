import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Project } from "./entity/Project";
import { Note } from "./entity/Note";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "root",
  database: "project-notes",
  synchronize: true,
  logging: false,
  entities: [User, Project, Note],
  migrations: [],
  subscribers: [],
});
