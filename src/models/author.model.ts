import { model, Schema, Types } from "mongoose";
import { IBook } from "./book.model";

export interface IAuthor {
  name: string;
  books: IBook[];
}

const authorSchema = new Schema<IAuthor>({
  name: { type: String },
  books: [{ type: Types.ObjectId, ref: "book" }],
});

export const AuthorModel = model("author", authorSchema, "authors");
