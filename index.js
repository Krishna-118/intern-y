import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- SETUP -------------------- */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const notion = new Client({ auth: process.env.NOTION_SECRET });

const USERS_DB = process.env.NOTION_USERS_DB;
const NEWS_DB = process.env.NOTION_NEWS_DB;

/* -------------------- AUTH (GOOGLE SSO) -------------------- */
app.post("/api/auth/google/callback", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email } = ticket.getPayload();

    // Check user in Notion
    const response = await notion.databases.query({
      database_id: USERS_DB,
      filter: { property: "email", title: { equals: email } },
    });

    let role = "viewer";

    // Create new user if not exists
    if (response.results.length === 0) {
      await notion.pages.create({
        parent: { database_id: USERS_DB },
        properties: {
          email: { title: [{ text: { content: email } }] },
          role: { select: { name: "viewer" } },
        },
      });
    } else {
      role = response.results[0].properties.role.select.name;
    }

    // Create JWT
    const jwtToken = jwt.sign({ email, role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Authentication failed" });
  }
});

/* -------------------- MIDDLEWARE -------------------- */
const auth = (roles = []) => (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/* -------------------- NEWS ROUTE: RBAC & full content -------------------- */
app.get("/news", auth(["viewer", "editor", "admin"]), async (req, res) => {
  try {
    const userRole = req.user.role;

    const response = await notion.databases.query({
      database_id: NEWS_DB,
    });

    const data = response.results.map((page) => ({
      id: page.id,
      title: page.properties.title.title[0]?.plain_text || "",
      content: page.properties.content.rich_text[0]?.plain_text || "",
      status: page.properties.status.select?.name || "",
      category: page.properties.category.select?.name || "",
      createdAt: page.properties["created_at"]?.date?.start || null,
    }));

    // Filter content by role
    const filtered = data.filter(item => {
      if (userRole === "viewer") return item.status === "published";
      if (userRole === "editor") return item.status === "draft";
      if (userRole === "admin") return true;
      return false;
    });

    res.json(filtered);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Failed to load content" });
  }
});

/* -------------------- SERVER -------------------- */
app.listen(3001, () =>
  console.log("Backend running at http://localhost:3001")
);
