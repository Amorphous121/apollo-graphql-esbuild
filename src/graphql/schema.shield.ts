import Joi from 'joi';
import { GraphQLError } from "graphql";
import { JwtPayload, verify } from "jsonwebtoken";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { chain, inputRule, or, rule, shield } from "graphql-shield";

import { UserModel } from "../models/user.model";

const isAuthenticated = rule({ cache: "no_cache" })(
  async (parent, args, ctx, info) => {
    const { authorization } = ctx;
    if (!authorization) {
      return new GraphQLError("Invalid token", {
        extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
      });
    }

    const accessToken = authorization.split(' ')[1];

    const payload = verify(accessToken, "secret", { ignoreExpiration: false });

    if (!payload) {
      return new GraphQLError("Invalid token", {
        extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
      });
    }

    const user = await UserModel.findOne(
      { _id: (payload as JwtPayload).id },
      { password: 0 }
    ).lean();

    if (!user) {
      return new GraphQLError("Invalid token", {
        extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
      });
    }

    ctx.user = user;
    return true;
  }
);

const isAdmin = rule('isAdmin', { cache: 'contextual' })(function (parent, args, ctx, info) {
  return ctx.user.role === 'admin'
})

const isUser = rule('isUser', { cache: 'contextual' })(function (parent, args, ctx, info) {
  return ctx.user.role === 'user'
})

const isValidRegisterInput = inputRule()((yup) => yup.object({
  username: yup.string().email('username has to be an email').required(),
  password: yup.string().required()
}), { abortEarly: true }
)



const createBookValidation = Joi.object({
  author: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).message('Author id is not valid').required(),
  title: Joi.string().required(),
})

function validate(validationSchema: Joi.ObjectSchema) {
  return rule({ cache: 'contextual' })(async function (parent, args, ctx, info) {
    return validationSchema.validateAsync(args.payload, { abortEarly: true }).then(() => true).catch((e) => new GraphQLError(e.message, { extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT } }));    
  });
}

export const permission = shield({
  Query: {
    books: chain(isAuthenticated, isUser),
    authors: isAuthenticated
  },
  Mutation: {
    register: isValidRegisterInput,
    createBook: validate(createBookValidation)
  },
  Author: or(isAdmin, isUser),
});
