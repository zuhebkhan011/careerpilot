import { Job, Application, ResumeProfile } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    company: 'TCS',
    role: 'Backend Developer Intern',
    location: 'Ahmedabad',
    salary: '₹4.5 LPA',
    workMode: 'Hybrid',
    matchScore: 91,
    experienceLevel: 'Internship',
    department: 'Software Engineering',
    postedDate: '2 days ago',
    description: 'We are looking for a passionate Backend Developer Intern to join our digital innovation team in Ahmedabad. You will work on scalable microservices, REST APIs, and database design using Node.js, Python, and PostgreSQL.',
    requirements: [
      'Good understanding of Node.js, Express, or Python FastAPI',
      'Knowledge of RESTful API architecture and SQL databases',
      'Understanding of git version control and asynchronous programming',
      'Strong problem-solving and algorithmic thinking'
    ],
    skillsRequired: ['Node.js', 'Express', 'SQL', 'Git', 'REST APIs', 'TypeScript'],
    benefits: ['Mentorship Program', 'Flexible Work Hours', 'PPO Opportunity', 'Health Insurance']
  },
  {
    id: 'job-2',
    company: 'Google',
    role: 'Software Engineer II (Frontend)',
    location: 'Bangalore',
    salary: '₹28 LPA',
    workMode: 'Hybrid',
    matchScore: 88,
    experienceLevel: 'Mid Level',
    department: 'Google Cloud Platform',
    postedDate: '1 day ago',
    description: 'Join the Google Cloud User Experience team to craft high-performance, accessible, responsive web interfaces powering enterprise applications for millions of developers worldwide.',
    requirements: [
      '3+ years of web application development with React, TypeScript, or Angular',
      'Deep mastery of web performance, DOM rendering, and CSS architecture',
      'Experience with component libraries and responsive layout design',
      'Bachelor degree in CS or equivalent practical experience'
    ],
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'Web Vitals', 'REST APIs', 'Jest'],
    benefits: ['Stock Grants', 'Comprehensive Health', 'Free Meals & Gym', 'Learning Allowance']
  },
  {
    id: 'job-3',
    company: 'Razorpay',
    role: 'Full Stack Engineer',
    location: 'Remote',
    salary: '₹22 LPA',
    workMode: 'Remote',
    matchScore: 95,
    experienceLevel: 'Mid Level',
    department: 'Payments Platform',
    postedDate: '3 days ago',
    description: 'Build fast, ultra-reliable payment checkout experiences and merchant dashboards. Work across modern React frontends and high-throughput Node.js microservices.',
    requirements: [
      'Strong proficiency in React, TypeScript, and modern state management',
      'Experience building Node.js / Express microservices with MongoDB or Postgres',
      'Understanding of API security, caching, and payment workflows',
      'Comfortable with Docker and CI/CD pipelines'
    ],
    skillsRequired: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Express', 'Tailwind CSS'],
    benefits: ['100% Remote Option', 'Wellness Budget', 'Home Office Stipend', 'Unlimited PTO']
  },
  {
    id: 'job-4',
    company: 'Flipkart',
    role: 'Frontend Developer',
    location: 'Bangalore',
    salary: '₹18 LPA',
    workMode: 'Hybrid',
    matchScore: 84,
    experienceLevel: 'Mid Level',
    department: 'E-commerce Core UI',
    postedDate: '4 days ago',
    description: 'Deliver lightning-fast mobile-first web experiences for millions of daily shoppers. Focus on PWA offline capability, mobile optimization, and image loading efficiency.',
    requirements: [
      '2+ years in mobile-first web interface engineering',
      'Expertise in React, Vite, PWA, and performance budgets',
      'Solid understanding of mobile touch interactions and animations'
    ],
    skillsRequired: ['React', 'TypeScript', 'PWA', 'Tailwind CSS', 'Redux / Zustand', 'HTML5/CSS3'],
    benefits: ['Performance Bonus', 'Subsidized Transport', 'Parental Health Insurance']
  },
  {
    id: 'job-5',
    company: 'PhonePe',
    role: 'Android Developer Intern',
    location: 'Remote',
    salary: '₹6 LPA',
    workMode: 'Remote',
    matchScore: 78,
    experienceLevel: 'Internship',
    department: 'Mobile App Core',
    postedDate: '5 days ago',
    description: 'Help build native mobile features and web views using Kotlin and Capacitor/WebView bridges for India’s largest fintech app.',
    requirements: [
      'Fundamental understanding of Kotlin/Java or React Native/Capacitor',
      'Basic knowledge of Android SDK and app lifecycle',
      'Interest in cross-platform mobile frameworks'
    ],
    skillsRequired: ['React', 'Capacitor', 'JavaScript', 'Mobile UX', 'REST APIs'],
    benefits: ['Remote Stipend', 'Mentorship', 'Pre-Placement Offer']
  },
  {
    id: 'job-6',
    company: 'Zomato',
    role: 'Product Designer (UI/UX)',
    location: 'Gurgaon',
    salary: '₹16 LPA',
    workMode: 'Hybrid',
    matchScore: 82,
    experienceLevel: 'Mid Level',
    department: 'Consumer Experience',
    postedDate: 'Just now',
    description: 'Craft intuitive mobile app flows, micro-interactions, and visual design systems that delight hungry users across 500+ cities.',
    requirements: [
      'Strong portfolio showcasing mobile-first app design',
      'Proficiency in Figma, prototyping, and design systems',
      'Understanding of user research and mobile design heuristics'
    ],
    skillsRequired: ['Mobile UX', 'Figma', 'Design Systems', 'Prototyping', 'User Research'],
    benefits: ['Food Allowance', 'Flexible Hours', 'Health Insurance']
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    company: 'TCS',
    role: 'Backend Developer Intern',
    location: 'Ahmedabad',
    salary: '₹4.5 LPA',
    workMode: 'Hybrid',
    status: 'Interviewing',
    appliedDate: '2026-08-01',
    lastUpdated: '2026-08-05',
    notes: 'Technical round 1 completed! Asked about REST API design and SQL queries. Round 2 scheduled for Monday.',
    interviewDate: '2026-08-10 at 11:00 AM',
    contactPerson: 'Priya Sharma (HR Tech Lead)',
    matchScore: 91
  },
  {
    id: 'app-2',
    jobId: 'job-3',
    company: 'Razorpay',
    role: 'Full Stack Engineer',
    location: 'Remote',
    salary: '₹22 LPA',
    workMode: 'Remote',
    status: 'Applied',
    appliedDate: '2026-08-03',
    lastUpdated: '2026-08-03',
    notes: 'Submitted customized cover letter emphasizing Node.js and React project experience.',
    matchScore: 95
  },
  {
    id: 'app-3',
    jobId: 'job-2',
    company: 'Google',
    role: 'Software Engineer II (Frontend)',
    location: 'Bangalore',
    salary: '₹28 LPA',
    workMode: 'Hybrid',
    status: 'Saved',
    appliedDate: '2026-08-06',
    lastUpdated: '2026-08-06',
    notes: 'Need to highlight web performance metrics and state management experience in resume.',
    matchScore: 88
  },
  {
    id: 'app-4',
    jobId: 'job-4',
    company: 'Flipkart',
    role: 'Frontend Developer',
    location: 'Bangalore',
    salary: '₹18 LPA',
    workMode: 'Hybrid',
    status: 'Offered',
    appliedDate: '2026-07-20',
    lastUpdated: '2026-08-06',
    notes: 'Received official offer letter! ₹18 LPA CTC + Joining bonus. Decision deadline Aug 15.',
    matchScore: 84
  }
];

export const INITIAL_RESUME: ResumeProfile = {
  id: 'res-1',
  fullName: 'Aarav Mehta',
  email: 'aarav.mehta@example.com',
  phone: '+91 98765 43210',
  location: 'Ahmedabad, India',
  targetRole: 'Full Stack / Backend Developer',
  yearsOfExperience: 2,
  summary: 'Detail-oriented Full Stack Developer with 2 years of hands-on experience building mobile-first web applications, REST APIs, and responsive frontends using React, TypeScript, Node.js, and Express.',
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Express',
    'Tailwind CSS',
    'SQL',
    'PostgreSQL',
    'MongoDB',
    'Git',
    'REST APIs',
    'PWA & Mobile UI'
  ],
  experiences: [
    {
      id: 'exp-1',
      title: 'Associate Software Developer',
      company: 'TechPulse Solutions',
      period: '2024 - Present',
      description: 'Developed responsive client dashboards and API endpoints for a SaaS application serving 50k+ active users. Improved mobile load speed by 35% using code splitting and lazy loading.'
    },
    {
      id: 'exp-2',
      title: 'Full Stack Development Intern',
      company: 'Innovate Labs',
      period: '2023 - 2024',
      description: 'Built RESTful microservices with Node.js and Express. Integrated PostgreSQL database queries and optimized API latency.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Engineering',
      institution: 'Gujarat Technological University',
      year: '2020 - 2024',
      grade: '8.6 CGPA'
    }
  ],
  fileName: 'Aarav_Mehta_Resume_2026.pdf',
  fileSize: '420 KB',
  updatedAt: '2026-08-05'
};
