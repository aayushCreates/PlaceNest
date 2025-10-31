"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidUserByPassword = exports.getJWT = exports.isUserLoggedIn = void 0;
const error_utils_1 = __importDefault(require("../utils/error.utils"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.log("JWT secret is not found");
}
const isUserLoggedIn = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res
                .status(401)
                .json({ message: "Authentication token not found" });
        }
        const tokenParts = token.split(" ");
        if (tokenParts.length != 2 || tokenParts[0] !== "Bearer") {
            return res.status(401).json({ message: "Invalid token format" });
        }
        const actualToken = tokenParts[1];
        const decoded = jsonwebtoken_1.default.verify(actualToken, jwtSecret);
        if (!decoded) {
            return next(new error_utils_1.default("Invalid token, please login again", 400));
        }
        const userId = decoded.userId;
        console.log("userid: ", userId);
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        req.user = user;
        next();
    }
    catch (err) {
        next(new error_utils_1.default("Error in user login", 500));
    }
};
exports.isUserLoggedIn = isUserLoggedIn;
const getJWT = async (userId, userRole) => {
    try {
        const token = await jsonwebtoken_1.default.sign({ userId, userRole }, jwtSecret);
        return token;
    }
    catch (err) {
        console.log("Error in jwt generation.");
    }
};
exports.getJWT = getJWT;
const checkValidUserByPassword = async (password, hashedPassword) => {
    const isValidPassword = await bcryptjs_1.default.compare(password, hashedPassword);
    return isValidPassword;
};
exports.checkValidUserByPassword = checkValidUserByPassword;
