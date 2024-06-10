import { Schema, Types, model } from "mongoose";
import { IAuthor } from "./author.model";

export interface IBook {
  title: string;
  author: IAuthor;
}

const bookSchema = new Schema<IBook>({
  title: String,
  author: { type: Types.ObjectId, ref: "author" },
});

export const BookModel = model("book", bookSchema, "books");
