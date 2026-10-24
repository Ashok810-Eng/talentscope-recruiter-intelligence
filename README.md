# TalentScope — Recruiter Intelligence Dashboard

A polished React + Express internship project demonstrating keyword-based post discovery, time/location filtering, recruiter contact extraction, and CSV export.

## Important: demo mode vs. live LinkedIn

- The included sample posts are **fictional demo records**. They are not verified LinkedIn posts and do not represent real people or contact details.
- LinkedIn OAuth sign-in does not automatically grant permission to search all LinkedIn posts.
- Before using live data, use an authorized provider/API whose terms permit your intended search and storage. Do not scrape restricted pages or automate the LinkedIn login form.
- The `/auth/linkedin` route illustrates the authorization redirect only. The callback intentionally remains unimplemented until a secure server-side OAuth code exchange, state verification, session/cookie protections, and approved permissions are configured.
- The sample API extracts email/phone-like strings from post text. It does not verify that a contact is real.

## Requirements

- Node.js 20 or newer recommended
- npm

## Run on Windows (PowerShell)

1. Extract this ZIP to a folder, for example `C:\Users\ashok\linkedin-recruiter-intelligence`.
2. Open PowerShell and enter that folder:

   ```powershell
   cd "C:\Users\ashok\linkedin-recruiter-intelligence"
   ```

3. Install dependencies:

   ```powershell
   npm install
   ```

4. Start frontend and backend together:

   ```powershell
   npm run dev
   ```

5. Open **http://localhost:5173** in your browser.

The React frontend runs on port 5173; the Express API runs on port 4000. `/api/health` can be used to check the API.

## Build check

```powershell
npm run build
```

## Project structure

```text
linkedin-recruiter-intelligence/
├── server/
│   ├── index.js                 # API routes and OAuth entry-point placeholder
│   ├── recruiter-extractor.js   # Extracts contact patterns from authorized text
│   └── sample-data.js           # Fictional sample posts
├── src/
│   ├── main.jsx
│   └── ui/
│       ├── App.jsx               # Dashboard and client-side interactions
│       └── styles.css            # Responsive styling
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## API

`GET /api/posts?keywords=Java%20Developer,C2C,W2&hours=24&usOnly=true`

Returns matching records and recruiter fields extracted from the demo post text.

`GET /api/health`

Returns API health information.

## Next steps for a production version

1. Confirm the assignment's expected LinkedIn developer product and approved scopes.
2. Complete OAuth code exchange on the server; verify `state`; use secure, HTTP-only, same-site cookies; never expose client secrets to React.
3. Connect an approved post-search/data provider. Normalize its response into the post schema used in `server/index.js`.
4. Apply the 24-hour and US filters using source timestamps and structured location/country data.
5. Add tests for keyword matching, time-window boundaries, US filtering, and contact extraction.
6. Add rate limiting, audit logs, consent/retention controls, and deployment secrets management.
