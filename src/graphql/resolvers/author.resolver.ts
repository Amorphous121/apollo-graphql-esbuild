import Dataloader from 'dataloader';
import { FlattenMaps } from 'mongoose';

import { BookModel, IBook } from "../../models/book.model";
import { AuthorModel } from "../../models/author.model";

const booksLoader = new Dataloader(async (authorsId) => {
    const books = await BookModel.find({ author: { $in: authorsId } }).lean();
    
    const booksMap: Record<string, FlattenMaps<IBook>> = {};

    books.forEach(book => {
        booksMap[book.author.toString() as string] = book;
    });

    return authorsId.map(id => booksMap[id as string]);
})

export const getAuthors = async function () {
  return AuthorModel.find({});
};

export const createAuthor = async function (parent, args, context, info) {
  const { name } = args.payload;
  const author = await AuthorModel.create({ name });
  return author.toObject();
};

export const resolveBooks = async function (parent, args, context, info) {
    // return BookModel.find({ author: parent._id });
    return booksLoader.loadMany([parent._id])
}