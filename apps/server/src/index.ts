import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { RecordType, SessionType } from "./types/types";

const app = express();
const port = 3000;

let sessions: SessionType[] = [];
let records: RecordType[] = [];
const priority_types = ["low", "medium", "high"];

// cors
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

// add cookie parser
app.use(cookieParser());
// parse json
app.use(express.json());
// parse form data
app.use(express.urlencoded({ extended: true }));

// middlware

const middleware = (req: Request, res: Response, next: NextFunction) => {
  const sid = req.cookies.sid;

  if (!sid) return res.status(401).json({ error: "Unauthorized" });

  const currentSession = sessions.find((s) => s.sid === sid);
  if (!currentSession) return res.status(401).json({ error: "Unauthorized" });

  (req as any).session = currentSession;
  next();
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/session", (req, res) => {
  const sid = req.cookies.sid;
  const currentSession = sessions.find((s) => s.sid === sid);
  if (!currentSession) return res.json({ session: null });
  res.send({ session: currentSession });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(401).send("Invalid credentials");

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
  const currentSession = (req as any).session as SessionType;

  const currentUserRecords = records.filter(
    ({ user_email }) => user_email === currentSession.email
  );

  return res.json({ data: currentUserRecords });
});

app.post("/api/records", middleware, (req, res) => {
  const currentSession = (req as any).session as SessionType;

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
  const newRecord: RecordType = {
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
