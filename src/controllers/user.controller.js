import userService from "../services/user.service.js";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const { password, ...userData } = user.toJSON();
    res.status(201).json(userData);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    const { password, ...userData } = user.toJSON();
    res.json(userData);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const exportUsersProto = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    // Prepare plain objects and remove sensitive fields
    const usersPayload = users.map((u) => {
      const obj = u.toJSON ? u.toJSON() : u;
      const { password, ...rest } = obj;
      return {
        id: rest.id,
        name: rest.name || "",
        email: rest.email || "",
        role: rest.role || "",
        status: rest.status || "",
        createdAt: rest.createdAt ? new Date(rest.createdAt).toISOString() : "",
      };
    });

    // Load proto
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const protoPath = path.join(__dirname, "../protos/user.proto");
    const root = await protobuf.load(protoPath);
    const UsersMessage = root.lookupType("user.Users");

    const payload = { users: usersPayload };

    const errMsg = UsersMessage.verify(payload);
    if (errMsg) throw new Error(errMsg);

    const message = UsersMessage.create(payload);
    const buffer = UsersMessage.encode(message).finish();

    // Ensure CORS headers as a fallback (global CORS middleware should normally handle this)
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/x-protobuf");
    // buffer is a Uint8Array from protobufjs; send it directly
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
