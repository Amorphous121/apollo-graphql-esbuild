import Dataloader from "dataloader";

import { AuthorModel, IAuthor } from "../../models/author.model";
import { BookModel } from "../../models/book.model";
import { FlattenMaps } from "mongoose";

const authorLoader = new Dataloader(async (authorIds) => {
  const authors = await AuthorModel.find({ _id: { $in: authorIds } }).lean();
  const authorMap: Record<string, FlattenMaps<IAuthor>> = {};
  
  authors.forEach((author) => {
    authorMap[author._id.toString() as string] = author;
  });

  return authorIds.map((id) => authorMap[id as string]);
});

export const getBooks = async () => {
  return BookModel.find({});
};

export const createBook = async function (parent, args, context, info) {
  const { title, author } = args.payload;
  const book = await BookModel.create({ author, title });
  return book.toObject();
};

export const resolveAuthor = async function (parent, args, context, info) {
  const { author } = parent;
  //   return AuthorModel.findOne({ _id: author });
  return authorLoader.load(author);
};
