
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import crypto from 'node:crypto';
import { extractRecruiterDetails } from './recruiter-extractor.js';
import { demoPosts } from './sample-data.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
const isProduction = process.env.NODE_ENV === 'production';

const oauthConfigured = [
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_REDIRECT_URI',
  'SESSION_SECRET'
].every((key) => Boolean(process.env[key]));

if (isProduction) {
  app.set('trust proxy', 1);
}

// Allow the deployed GitHub Pages frontend to call the Render API.
const allowedOrigin = new URL(frontendUrl).origin;

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use(session({
  name: 'talentscope.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'TalentScope API', mode: 'demo-data' });
});

app.get('/api/me', (req, res) => {
  res.set('Cache-Control', 'no-store');

  if (!req.session.linkedinUser) {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: req.session.linkedinUser
  });
});

// Existing demo data endpoint — this is not live LinkedIn search.
app.get('/api/posts', (req, res) => {
  const hours = Math.min(Math.max(Number(req.query.hours || 24), 1), 168);
  const terms = String(
    req.query.keywords ||
    'Java Developer,C2C,Bench,Sales,W2,Full-Time,Hotlist'
  )
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const usOnly = req.query.usOnly !== 'false';
  const cutoff = Date.now() - hours * 60 * 60 * 1000;

  const posts = demoPosts
    .filter((post) => new Date(post.postedAt).getTime() >= cutoff)
    .filter((post) => !usOnly || post.countryCode === 'US')
    .filter((post) => terms.length === 0 || terms.some((term) =>
      `${post.title} ${post.text} ${post.company} ${post.location}`
        .toLowerCase()
        .includes(term)
    ))
    .map((post) => ({
      ...post,
      recruiter: extractRecruiterDetails(post.text, post)
    }));

  res.json({
    items: posts,
    total: posts.length,
    appliedFilters: { hours, usOnly, keywords: terms },
    source: 'demo',
    notice: 'Demo dataset only. An authorized provider is required for live results.'
  });
});

// Start LinkedIn OAuth authorization.
app.get('/auth/linkedin', (req, res, next) => {
  if (!oauthConfigured) {
    return res.status(503).send(
      'OAuth is not configured. Check the required values in your local .env file.'
    );
  }

  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  // Persist the state and session cookie before leaving for LinkedIn.
  req.session.save((err) => {
    if (err) return next(err);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state
    });

    return res.redirect(
      `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
    );
  });
});

// Handle LinkedIn's authorization response.
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    delete req.session.oauthState;
    return res.redirect(
      `${frontendUrl}/?linkedin_error=authorization_denied`
    );
  }

  // Verify state before using the authorization code.
  const expectedState = req.session.oauthState;

  if (
    typeof state !== 'string' ||
    typeof expectedState !== 'string' ||
    !crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(expectedState)
    )
  ) {
    return res.status(403).send(
      'OAuth state validation failed. Return to TalentScope and start a new login.'
    );
  }

  // Consume state so it cannot be reused.
  delete req.session.oauthState;

  if (typeof code !== 'string' || !code) {
    return res.status(400).send('LinkedIn did not return an authorization code.');
  }

  try {
    const tokenResponse = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: redirectUri
        }),
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!tokenResponse.ok) {
      console.error('LinkedIn token exchange failed:', tokenResponse.status);
      return res.redirect(`${frontendUrl}/?linkedin_error=token_exchange`);
    }

    const tokenData = await tokenResponse.json();

    if (typeof tokenData.access_token !== 'string') {
      console.error('LinkedIn token response contained no access token.');
      return res.redirect(`${frontendUrl}/?linkedin_error=token_missing`);
    }

    // The access token stays on the server and is not returned to the browser.
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!profileResponse.ok) {
      console.error('LinkedIn userinfo request failed:', profileResponse.status);
      return res.redirect(`${frontendUrl}/?linkedin_error=profile_fetch`);
    }

    const profile = await profileResponse.json();

    if (typeof profile.sub !== 'string' || !profile.sub) {
      console.error('LinkedIn userinfo response has no subject identifier.');
      return res.redirect(`${frontendUrl}/?linkedin_error=profile_invalid`);
    }

    // Rotate the session ID after authentication to prevent session fixation.
    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        console.error('Session regeneration failed.');
        return res.status(500).send('Could not create a login session.');
      }

      req.session.linkedinUser = {
        id: profile.sub,
        name: profile.name || '',
        givenName: profile.given_name || '',
        familyName: profile.family_name || '',
        picture: profile.picture || '',
        email: profile.email || '',
        emailVerified: profile.email_verified === true
      };

      req.session.save((saveError) => {
        if (saveError) {
          console.error('Session save failed.');
          return res.status(500).send('Could not save the login session.');
        }

        return res.redirect(`${frontendUrl}/?linkedin=connected`);
      });
    });
  } catch (err) {
    console.error('LinkedIn OAuth request failed:', err.name || 'Error');
    return res.redirect(`${frontendUrl}/?linkedin_error=server_error`);
  }
});

// Log out of TalentScope (not LinkedIn itself).
app.post('/auth/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    res.clearCookie('talentscope.sid', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    });

    return res.json({ ok: true });
  });
});

app.listen(port, () => {
  console.log(`TalentScope API running at http://localhost:${port}`);
});
