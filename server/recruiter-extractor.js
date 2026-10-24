const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig;
const PHONE_RE = /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g;

export function extractRecruiterDetails(text, post = {}) {
  const emails = [...new Set(text.match(EMAIL_RE) || [])];
  const phones = [...new Set(text.match(PHONE_RE) || [])];

  // Names cannot be reliably inferred from arbitrary text. Prefer structured,
  // provider-supplied author metadata when it is available and authorized.
  return {
    name: post.authorName || null,
    title: post.authorTitle || 'Recruiter / author not verified',
    company: post.company || null,
    location: post.location || null,
    emails,
    phones,
    profileUrl: post.authorProfileUrl || null,
    postUrl: post.url || null
  };
}
