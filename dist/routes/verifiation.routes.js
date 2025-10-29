"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const verification_controller_1 = require("@/controllers/verification.controller");
const auth_middleware_1 = require("@/middlewares/auth.middleware");
const express_1 = require("express");
const verficationRoutes = (0, express_1.Router)();
verficationRoutes.get('/', auth_middleware_1.isUserLoggedIn, verification_controller_1.getUsersForVerification);
verficationRoutes.put('/student/:id', auth_middleware_1.isUserLoggedIn, verification_controller_1.verifyUser);
exports.default = verficationRoutes;
