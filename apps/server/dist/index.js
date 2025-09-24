"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
let sessions = [];
let records = [];
const priority_types = ["low", "medium", "high"];
// cors
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true,
}));
// add cookie parser
app.use((0, cookie_parser_1.default)());
// parse json
app.use(express_1.default.json());
// parse form data
app.use(express_1.default.urlencoded({ extended: true }));
// middlware
const middleware = (req, res, next) => {
    const sid = req.cookies.sid;
    if (!sid)
        return res.status(401).json({ error: "Unauthorized" });
    const currentSession = sessions.find((s) => s.sid === sid);
    if (!currentSession)
        return res.status(401).json({ error: "Unauthorized" });
    req.session = currentSession;
    next();
};
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/api/session", (req, res) => {
    const sid = req.cookies.sid;
    const currentSession = sessions.find((s) => s.sid === sid);
    if (!currentSession)
        return res.json({ session: null });
    res.send({ session: currentSession });
});
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(401).send("Invalid credentials");
    const sid = crypto.randomUUID();
    let existingSession = sessions.find((sess) => sess.email === email);
    if (!existingSession) {
        existingSession = { sid, email };
    }
    sessions.push(existingSession);
    res.cookie("sid", existingSession.sid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "lax",
    });
    return res.json(existingSession);
});
app.post("/api/logout", (req, res) => {
    res.clearCookie("sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.json({ success: true });
});
app.get("/api/records", middleware, (req, res) => {
    const currentSession = req.session;
    const currentUserRecords = records.filter(({ user_email }) => user_email === currentSession.email);
    return res.json({ data: currentUserRecords });
});
app.post("/api/records", middleware, (req, res) => {
    const currentSession = req.session;
    const { title, priority } = req.body;
    if (!title || !priority)
        return res.status(401).send({ error: "invalid_input" });
    if (title.length < 3) {
        return res.status(400).json({
            error: "validation_failed",
            details: [{ message: "Title requires atleast 3 characters" }],
        });
    }
    if (!priority_types.includes(priority)) {
        return res.status(400).json({
            error: "validation_failed",
            details: [{ message: "Priority must be low, medium, or high" }],
        });
    }
    const newRecord = {
        id: crypto.randomUUID(),
        user_email: currentSession.email,
        title,
        priority,
        created_at: new Date().toISOString(),
    };
    records.push(newRecord);
    return res.json(newRecord);
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
