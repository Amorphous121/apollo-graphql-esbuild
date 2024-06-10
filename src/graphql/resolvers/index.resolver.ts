import { register, login } from "./auth.resolver";
import { createAuthor, getAuthors, resolveBooks } from "./author.resolver";
import { createBook, getBooks, resolveAuthor } from "./book.resolver";

export const resolvers = {
  Query: {
    authors: getAuthors,
    books: getBooks,
  },
  Mutation: {
    login,
    register,
    createBook,
    createAuthor,
  },
  Author: {
    books: resolveBooks,
  },
  Book: {
    author: resolveAuthor,
  },
};
