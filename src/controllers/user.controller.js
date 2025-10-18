import userService from "../services/user.service.js";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";
import { getPublicKey as getCryptoPublicKey, verifySignature, hashEmail } from "../utils/crypto.js";

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const { password: _password, ...userData } = user.toJSON();
    res.status(201).json({
      ...userData,
      emailSignature: userData.emailSignature,
      emailHash: hashEmail(req.body.email),
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    const usersWithSignatures = users.map((user) => {
      const userData = user.toJSON ? user.toJSON() : user;
      const { password: _password, ...userWithoutPassword } = userData;
      return {
        ...userWithoutPassword,
        emailSignature: userData.emailSignature,
      };
    });
    res.json(usersWithSignatures);
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
    const { password: _password, ...userData } = user.toJSON();
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
    const usersPayload = users.map((u) => {
      const obj = u.toJSON ? u.toJSON() : u;
      const { password, ...rest } = obj;
      return {
        id: rest.id,
        name: rest.name || "",
        email: rest.email || "",
        role: rest.role || "",
        status: rest.status || "",
        emailSignature: rest.emailSignature || "",
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
    // include public key for clients to verify signatures
    const publicKey = getCryptoPublicKey();
    payload.publicKey = publicKey;

    const errMsg = UsersMessage.verify(payload);
    if (errMsg) throw new Error(errMsg);

    const message = UsersMessage.create(payload);
    const buffer = UsersMessage.encode(message).finish();
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Content-Type", "application/x-protobuf");
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

// New endpoint to get the public key for signature verification
export const getPublicKey = async (req, res, next) => {
  try {
    const publicKey = getCryptoPublicKey();
    res.json({ publicKey });
  } catch (err) {
    next(err);
  }
};

// New endpoint to verify a signature
export const verifyUserSignature = async (req, res, next) => {
  try {
    const { email, signature } = req.body;

    if (!email || !signature) {
      return res.status(400).json({
        error: "Email and signature are required",
        valid: false,
      });
    }

    const emailHash = hashEmail(email);
    const isValid = verifySignature(emailHash, signature);

    res.json({
      valid: isValid,
      emailHash: emailHash,
      message: isValid ? "Signature is valid" : "Signature is invalid",
    });
  } catch (err) {
    next(err);
  }
};
