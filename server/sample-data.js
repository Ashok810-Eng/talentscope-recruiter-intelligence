const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const demoPosts = [
  {
    id: 'demo-101', title: 'Java Developer — C2C Contract', company: 'Northstar Talent Group',
    location: 'Dallas, TX, USA', countryCode: 'US', postedAt: hoursAgo(2),
    authorName: 'Maya Patel', authorTitle: 'Technical Recruiter',
    authorProfileUrl: 'https://www.linkedin.com/', url: 'https://www.linkedin.com/',
    text: 'Hiring Java Developer for a C2C contract in Dallas, TX. Spring Boot, REST APIs, and microservices. Contact maya.patel@example.com or (214) 555-0134. #JavaDeveloper #C2C'
  },
  {
    id: 'demo-102', title: 'W2 Java Engineer — Full-Time', company: 'BluePeak Systems',
    location: 'Austin, TX, USA', countryCode: 'US', postedAt: hoursAgo(5),
    authorName: 'Jordan Lee', authorTitle: 'Senior Talent Partner',
    authorProfileUrl: 'https://www.linkedin.com/', url: 'https://www.linkedin.com/',
    text: 'Full-Time W2 opportunity for a Java Developer in Austin. Java, Spring Boot, SQL, and cloud experience preferred. Reach jordan.lee@example.org. #W2 #FullTime'
  },
  {
    id: 'demo-103', title: 'Java Developer Hotlist — Immediate Interview', company: 'Summit Staffing',
    location: 'New Jersey, USA', countryCode: 'US', postedAt: hoursAgo(9),
    authorName: 'Chris Morgan', authorTitle: 'IT Recruiter',
    authorProfileUrl: 'https://www.linkedin.com/', url: 'https://www.linkedin.com/',
    text: 'Hotlist: Java developers available for C2C and W2 roles. Bench candidates welcome. Email chris.morgan@example.net or call 201-555-0176.'
  },
  {
    id: 'demo-104', title: 'Bench Sales Recruiter', company: 'Vertex Consulting',
    location: 'Chicago, IL, USA', countryCode: 'US', postedAt: hoursAgo(18),
    authorName: 'Rina Shah', authorTitle: 'Bench Sales Recruiter',
    authorProfileUrl: 'https://www.linkedin.com/', url: 'https://www.linkedin.com/',
    text: 'Looking for bench sales professionals familiar with vendor calls, hotlists, and US IT staffing. Contact rina.shah@example.com.'
  },
  {
    id: 'demo-105', title: 'Java Engineer Opportunity', company: 'Sample Global',
    location: 'London, UK', countryCode: 'GB', postedAt: hoursAgo(3),
    authorName: 'Alex Taylor', authorTitle: 'Recruiter',
    url: 'https://www.linkedin.com/',
    text: 'Java Developer opening in London. Contact alex.taylor@example.co.uk.'
  },
  {
    id: 'demo-106', title: 'Senior Java Developer', company: 'Pioneer Tech',
    location: 'Seattle, WA, USA', countryCode: 'US', postedAt: hoursAgo(42),
    authorName: 'Sam Rivera', authorTitle: 'Technical Recruiter',
    url: 'https://www.linkedin.com/',
    text: 'Java Developer role. Full-Time W2. Email sam.rivera@example.com.'
  }
];
