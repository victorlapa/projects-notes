import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(async () => {
    console.log("starting db...");
  })
  .catch((error) => console.log(error));
