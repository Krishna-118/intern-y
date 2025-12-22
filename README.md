📘 Notion Article Reader CMS

Role-Based Content Platform with Google SSO


---

1️⃣ Project Overview

Notion Article Reader CMS is a role-based web application that uses Notion as the only backend CMS and Google SSO for authentication.

Content visibility is enforced based on user roles:

Admin → sees all articles

Editor → sees drafts

Viewer → sees only published articles


User roles are stored and managed inside Notion itself.


---

2️⃣ Tech Stack

Frontend

HTML / CSS / JavaScript

Google Identity Services (GSI)

Fetch API


Backend

Node.js

Express.js

JSON Web Token (JWT)

@notionhq/client

dotenv

cors


CMS

Notion Database (Articles)

Notion Database (Users)



---

3️⃣ Authentication Flow (Google SSO + JWT)

1. User clicks “Sign in with Google”


2. Google returns an ID Token


3. Backend verifies token using Google


4. Backend checks Users DB in Notion


5. If user does not exist:

User is automatically added as viewer



6. Backend issues a JWT


7. Frontend stores JWT and loads dashboard


8. Articles are fetched based on role




---

4️⃣ JWT Secret Key (IMPORTANT ❗)

Where is the JWT secret?

It is stored in your .env file.

JWT_SECRET=super_secure_random_string_123

How it’s used

import jwt from "jsonwebtoken";

jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

⚠️ Never expose this key in frontend code


---

5️⃣ Notion Database Structure (CRITICAL)

📂 USERS DATABASE (Required)

Database name: Users

Property Name	Type	Required

Email	Email	✅
Role	Select	✅
Active	Checkbox	✅


Role Select Options

admin

editor

viewer


✅ When a new email logs in → auto-create user with viewer


---

📂 ARTICLES DATABASE (Required)

Database name: Articles

Property Name	Type	Description

Title	Title	Article title
Content	Rich Text	Article body
Role	Select	Target role
Published	Checkbox	Visibility
CreatedAt	Date	Optional


Role Select Options

admin

editor

viewer



---

6️⃣ Role-Based Visibility Rules

Viewer

Published = true

Role = viewer


Editor

Published = true OR false

Role = viewer OR editor


Admin

All articles

No filters



---

7️⃣ Backend Folder Structure

notion-cms-backend/
│
├── index.js
├── notion.js
├── auth/
│   └── google.js
├── middleware/
│   ├── verifyJWT.js
│   └── roleGuard.js
├── .env
├── package.json


---

8️⃣ Frontend Flow

1. User logs in via Google


2. JWT stored in localStorage


3. Dashboard loads


4. Fetch request:

GET /api/articles
Authorization: Bearer <JWT>


5. Backend filters articles using role


6. Articles rendered dynamically

---
---

🔟 Why This Architecture Is Strong

✅ No traditional database
✅ No role hardcoding
✅ Notion controls everything
✅ Secure SSO + JWT
✅ Scalable for future roles


---

1️⃣1️⃣ Future Enhancements

Admin dashboard to change roles

Article editor UI

Draft approval flow

Audit logs

Search & filters



---

✅ Final Words

You were absolutely correct insisting on:

No extra DB

No extra news.js

Single Notion-based flow

Role enforcement from CMS

