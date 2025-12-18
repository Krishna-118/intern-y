import jwt from "jsonwebtoken";
import { notion } from "./notion.js";

const USERS_DB = process.env.NOTION_USERS_DB;

// 🔎 Get or create user
export const getOrCreateUser = async (email) => {
  const response = await notion.databases.query({
    database_id: USERS_DB,
    filter: {
      property: "email",
      email: { equals: email },
    },
  });

  // User exists
  if (response.results.length > 0) {
    return response.results[0].properties.role.select.name;
  }

  // ❗ New user → create as viewer
  await notion.pages.create({
    parent: { database_id: USERS_DB },
    properties: {
      email: { email },
      role: { select: { name: "viewer" } },
    },
  });

  return "viewer";
};

// 🎟 Login Controller
export const loginSuccess = async (req, res) => {
  const { email } = req.user;

  const role = await getOrCreateUser(email);

  const token = jwt.sign(
    { email, role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.redirect(`http://localhost:3000?token=${token}`);
};
