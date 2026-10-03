import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";
import { ApiError } from "../utils/ApiError";
import { RegisterInput, LoginInput } from "../validators/authValidators";

const SALT_ROUNDS = 10;

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = signToken(user.id);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    const token = signToken(user.id);
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },
};
