"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const verifiation_routes_1 = __importDefault(require("./routes/verifiation.routes"));
const reumeReview_routes_1 = __importDefault(require("./routes/reumeReview.routes"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3030"],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/auth", auth_routes_1.default);
app.use("/profile", profile_routes_1.default);
app.use("/job", job_routes_1.default);
app.use("/application", application_routes_1.default);
app.use("/verification", verifiation_routes_1.default);
app.use('/resume-review', reumeReview_routes_1.default);
app.get("/ping", (req, res, next) => {
    res.send("hello world");
});
app.use(error_middleware_1.errorMiddleware);
const port = process.env.PORT || 5050;
app.listen(port, () => {
    console.log("✅ server is running on port: " + port);
});
