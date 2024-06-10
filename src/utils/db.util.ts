import { connect, connection } from "mongoose";

import { configs } from "../config";

connection.on("connected", () => {
  console.log("Database connected");
});

export function connectDatabase() {
  return connect(configs.DATABASE_URL);
}
