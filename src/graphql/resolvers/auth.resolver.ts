import { sign } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";
import { UserModel } from "../../models/user.model";

export const register = async function (parent, args, context, info) {
  const payload = args;
  const user = await UserModel.create(payload);
  const { password, ...rest } = user.toObject();
  return rest;
};

export const login = async function (parent, args, context, info) {
  const { username, password } = args;
  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
    throw new GraphQLError("Invalid Creadentials", {
      extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
    });
  }

  const isValidPassword = await existingUser.comparePassword(password);

  if (!isValidPassword) {
    throw new GraphQLError("Invalid Creadentials", {
      extensions: { code: ApolloServerErrorCode.BAD_REQUEST },
    });
  }

  const payload = { id: existingUser.id };
  const accessToken = 'Bearer ' + sign(payload, "secret", {
    expiresIn: "1d",
  });

  return {
    message: "Logged in successfully",
    accessToken,
  };
};
