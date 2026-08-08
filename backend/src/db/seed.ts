import { getSupabase, memoryDb } from './supabase';
import { Job } from '../types';

export const SAMPLE_INDIAN_JOBS: Omit<Job, 'id' | 'created_at'>[] = [
  {
    company: 'Razorpay',
    role: 'Software Development Engineer I (Backend)',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹14 - ₹18 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech / B.E. in CS/IT or equivalent',
    skills: ['Node.js', 'Express.js', 'Go', 'PostgreSQL', 'Redis', 'REST APIs'],
    description: 'Join Razorpay engineering team building high-concurrency payment gateway infrastructure serving millions of Indian merchants daily.',
    responsibilities: [
      'Design, build and maintain efficient RESTful microservices for payment processing.',
      'Optimize database queries and cache layers using Redis and PostgreSQL.',
      'Collaborate with product managers and security teams to maintain high financial security compliance.'
    ],
    preferred_skills: ['Docker', 'Kafka', 'AWS', 'Payment Domain Knowledge']
  },
  {
    company: 'Zerodha',
    role: 'Full Stack Web Developer',
    location: 'Bengaluru',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹12 - ₹16 LPA',
    experience_required: '1-3 Years',
    education_required: 'B.Tech / BCA / B.Sc in Computer Science',
    skills: ['React', 'TypeScript', 'Python', 'PostgreSQL', 'Vue.js', 'WebSockets'],
    description: 'Work on Kite, India’s largest stock trading platform. Help build ultra-fast, responsive web applications for real-time market data visualization.',
    responsibilities: [
      'Develop low-latency front-end components and WebSocket subscriptions.',
      'Write clean, modular Python/Go backend APIs.',
      'Maintain peak performance during high volatility stock market hours.'
    ],
    preferred_skills: ['Chart.js', 'D3.js', 'Linux System Administration']
  },
  {
    company: 'TCS (Tata Consultancy Services)',
    role: 'Systems Engineer - React & Java',
    location: 'Mumbai',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹4.5 - ₹7 LPA',
    experience_required: '0-1 Years (Fresher / Entry Level)',
    education_required: 'B.Tech / M.Tech / MCA',
    skills: ['Java', 'Spring Boot', 'React', 'SQL', 'JavaScript', 'HTML/CSS'],
    description: 'TCS Digital hiring freshers and junior software engineers for enterprise digital transformation projects for global banking clients.',
    responsibilities: [
      'Build web components using React and Java Spring Boot microservices.',
      'Participate in code reviews, bug fixes, and unit testing.',
      'Document software architecture and functional requirements.'
    ],
    preferred_skills: ['Git', 'Maven', 'Oracle DB']
  },
  {
    company: 'Infosys',
    role: 'Associate Programmer - Full Stack',
    location: 'Pune',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹5 - ₹8 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech / BE / M.Sc Computer Science',
    skills: ['JavaScript', 'Node.js', 'Angular', 'PostgreSQL', 'Git'],
    description: 'Develop cloud-native applications for enterprise clients as part of Infosys Cobalt Cloud ecosystem.',
    responsibilities: [
      'Build responsive web interfaces and RESTful web services.',
      'Write automated unit and integration test suites.',
      'Work in agile sprints following Scrum methodology.'
    ],
    preferred_skills: ['Azure', 'CI/CD Pipelines']
  },
  {
    company: 'Zoho',
    role: 'Member Technical Staff - Backend',
    location: 'Chennai',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹7 - ₹10 LPA',
    experience_required: '0-2 Years',
    education_required: 'Any Graduate with strong coding foundation',
    skills: ['Java', 'C++', 'Python', 'SQL', 'Data Structures', 'Algorithms'],
    description: 'Build SaaS products used by over 100 million users globally. Develop core server logic, custom database engines, and cloud tools.',
    responsibilities: [
      'Write robust server-side algorithms with strict performance metrics.',
      'Solve complex algorithmic and data structure problems.',
      'Collaborate on Zoho Creator and Zoho CRM backends.'
    ],
    preferred_skills: ['System Design', 'Linux Internals']
  },
  {
    company: 'Swiggy',
    role: 'Frontend Developer Intern',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Internship',
    salary: '₹35,000 / month (Stipend)',
    experience_required: '0 Years (Students / Recent Graduates)',
    education_required: 'Pursuing or Completed B.Tech / BCA',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux'],
    description: '6-month internship at Swiggy Consumer Tech team working on Swiggy Instamart and Food Delivery web applications.',
    responsibilities: [
      'Implement pixel-perfect UI components from Figma design mocks.',
      'Improve website performance and bundle load speed.',
      'Integrate analytics tracking and A/B test experiments.'
    ],
    preferred_skills: ['Next.js', 'PWA']
  },
  {
    company: 'PhonePe',
    role: 'Software Engineer - AI/ML Intern',
    location: 'Bengaluru',
    work_mode: 'On-site',
    employment_type: 'Internship',
    salary: '₹40,000 / month (Stipend)',
    experience_required: '0 Years',
    education_required: 'B.Tech / M.Tech in CS/AI/Data Science',
    skills: ['Python', 'PyTorch', 'Scikit-Learn', 'SQL', 'Pandas', 'FastAPI'],
    description: 'Work with PhonePe Fraud Detection & Credit Risk AI team to train real-time machine learning models for digital transactions.',
    responsibilities: [
      'Clean transaction data and engineer feature stores.',
      'Train baseline anomaly detection models using Scikit-Learn and PyTorch.',
      'Deploy FastAPI model inference microservices.'
    ],
    preferred_skills: ['Docker', 'MLflow']
  },
  {
    company: 'Flipkart',
    role: 'UI/UX Frontend Developer',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹12 - ₹16 LPA',
    experience_required: '1-3 Years',
    education_required: 'B.Tech / B.Des / BCA',
    skills: ['React', 'TypeScript', 'CSS/SCSS', 'Webpack', 'Accessibility (a11y)'],
    description: 'Shape the shopping experience for millions of Indians during The Big Billion Days sale events.',
    responsibilities: [
      'Build reusable design system components in React and TypeScript.',
      'Optimize web vitals (LCP, CLS, FID) across mobile web browsers.',
      'Ensure WCAG web accessibility standards.'
    ],
    preferred_skills: ['Storybook', 'GraphQL']
  },
  {
    company: 'Freshworks',
    role: 'Associate Cloud Engineer',
    location: 'Chennai',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹8 - ₹11 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech / BE in CS/IT/ECE',
    skills: ['AWS', 'Terraform', 'Docker', 'Linux', 'Python', 'Shell Scripting'],
    description: 'Freshworks cloud infrastructure engineering team building resilient multi-tenant SaaS hosting platforms.',
    responsibilities: [
      'Provision AWS infrastructure using Terraform infrastructure-as-code.',
      'Monitor container clusters and set up CloudWatch alerting metrics.',
      'Automate deployment pipelines using GitHub Actions.'
    ],
    preferred_skills: ['Kubernetes', 'Prometheus']
  },
  {
    company: 'Accenture India',
    role: 'Application Development Associate',
    location: 'Hyderabad',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹4.8 - ₹6.5 LPA',
    experience_required: '0-1 Years',
    education_required: 'B.Tech / B.E. / MCA / M.Sc',
    skills: ['JavaScript', 'Python', 'SQL', 'Git', 'RESTful Services'],
    description: 'Deliver cutting-edge enterprise software solutions across AI, Cloud, and Web engineering domains for global Fortune 500 clients.',
    responsibilities: [
      'Develop application components according to architectural blueprints.',
      'Perform software testing and debugging.',
      'Participate in client agile sprint planning calls.'
    ],
    preferred_skills: ['Agile Methodology', 'JIRA']
  },
  {
    company: 'Deloitte India',
    role: 'Cybersecurity Analyst Trainee',
    location: 'Gurugram',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹6 - ₹8.5 LPA',
    experience_required: '0-1 Years',
    education_required: 'B.Tech in CS/IT/Cybersecurity',
    skills: ['Network Security', 'Python', 'Linux', 'OWASP Top 10', 'Vulnerability Assessment'],
    description: 'Join Deloitte Advisory team executing vulnerability assessments, penetration testing, and secure code reviews for corporate networks.',
    responsibilities: [
      'Conduct web application security testing against OWASP standards.',
      'Analyze server logs for security anomalies.',
      'Write technical audit reports detailing security vulnerabilities and remedies.'
    ],
    preferred_skills: ['Burp Suite', 'CEH Certification']
  },
  {
    company: 'Wipro',
    role: 'Project Engineer - Python & Django',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹3.6 - ₹5.5 LPA',
    experience_required: '0-1 Years',
    education_required: 'B.Tech / B.E.',
    skills: ['Python', 'Django', 'PostgreSQL', 'HTML/CSS', 'Git'],
    description: 'Work on telecom and healthcare client projects developing automated data processing portals.',
    responsibilities: [
      'Write backend views and REST endpoints using Django REST framework.',
      'Design PostgreSQL database tables and migrations.',
      'Integrate third-party API services.'
    ],
    preferred_skills: ['Celery', 'Redis']
  },
  {
    company: 'HCLTech',
    role: 'Software Engineer - Mobile Developer',
    location: 'Noida',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹5.5 - ₹8 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech / MCA',
    skills: ['React Native', 'JavaScript', 'Flutter', 'Android Studio', 'REST APIs'],
    description: 'Build native and cross-platform mobile apps for automotive and healthcare IoT devices.',
    responsibilities: [
      'Develop responsive mobile UI components in React Native.',
      'Integrate Bluetooth LE and REST API hardware interfaces.',
      'Publish app builds to Google Play Store and Apple App Store.'
    ],
    preferred_skills: ['Redux Toolkit', 'iOS Swift']
  },
  {
    company: 'Tech Mahindra',
    role: 'Junior Data Analyst',
    location: 'Ahmedabad',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹4.5 - ₹6 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Sc / B.Tech / BBA in Data Analytics or CS',
    skills: ['SQL', 'Python', 'Power BI', 'Excel', 'Pandas'],
    description: 'Turn complex operational datasets into actionable business intelligence dashboards for smart cities and energy sectors.',
    responsibilities: [
      'Extract data from SQL databases and clean raw telemetry logs.',
      'Build interactive Power BI dashboards for client leadership.',
      'Automate weekly reporting scripts using Python.'
    ],
    preferred_skills: ['Tableau', 'NumPy']
  },
  {
    company: 'Crest Data Systems',
    role: 'Software Engineer - Python & Cloud',
    location: 'Ahmedabad',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹6 - ₹9 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech in CS/IT',
    skills: ['Python', 'REST APIs', 'Docker', 'Linux', 'Elasticsearch'],
    description: 'Build cybersecurity and data integration plugins for global enterprise products like Splunk, Datadog, and Palo Alto Networks.',
    responsibilities: [
      'Write custom Python data ingestion connectors.',
      'Develop unit tests using PyTest framework.',
      'Optimize API rate limits and async I/O handlers.'
    ],
    preferred_skills: ['Splunk SDK', 'Kibana']
  },
  {
    company: 'TCS (Tata Consultancy Services)',
    role: 'Junior DevOps Engineer',
    location: 'Kolkata',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹5 - ₹7.5 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech / B.E.',
    skills: ['Linux', 'Docker', 'Jenkins', 'Git', 'Shell Scripting', 'AWS'],
    description: 'Help manage CI/CD deployment pipelines for international retail banking portals.',
    responsibilities: [
      'Maintain Jenkins build pipelines and release artifacts.',
      'Configure Nginx web servers and SSL certificates.',
      'Troubleshoot build failures and server resource spikes.'
    ],
    preferred_skills: ['Ansible', 'Kubernetes']
  },
  {
    company: 'eInfochips (An Arrow Company)',
    role: 'Embedded Software Engineer Trainee',
    location: 'Vadodara',
    work_mode: 'On-site',
    employment_type: 'Full-time',
    salary: '₹4.2 - ₹6 LPA',
    experience_required: '0-1 Years',
    education_required: 'B.Tech in EC/EE/CS',
    skills: ['C', 'C++', 'Embedded Systems', 'RTOS', 'Microcontrollers'],
    description: 'Develop firmware and low-level software drivers for smart home automation devices and automotive controllers.',
    responsibilities: [
      'Write C/C++ firmware code for ARM Cortex microcontrollers.',
      'Test hardware peripherals (I2C, SPI, UART, CAN).',
      'Debug firmware using oscilloscopes and logic analyzers.'
    ],
    preferred_skills: ['FreeRTOS', 'Git']
  },
  {
    company: 'Persistent Systems',
    role: 'React Frontend Developer',
    location: 'Nagpur',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹6 - ₹9 LPA',
    experience_required: '1-3 Years',
    education_required: 'B.Tech / MCA',
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML5/CSS3'],
    description: 'Build enterprise health-tech web applications with modern responsive user interfaces.',
    responsibilities: [
      'Develop clean React UI components adhering to material design guidelines.',
      'Integrate REST APIs and handle offline state storage.',
      'Participate in sprint demos and pull request code reviews.'
    ],
    preferred_skills: ['MUI', 'Jest/RTL']
  },
  {
    company: 'Sigmoid Analytics',
    role: 'Junior Data Engineer',
    location: 'Bengaluru',
    work_mode: 'Hybrid',
    employment_type: 'Full-time',
    salary: '₹8.5 - ₹12 LPA',
    experience_required: '0-2 Years',
    education_required: 'B.Tech in CS/IT/Mathematics',
    skills: ['Python', 'SQL', 'PySpark', 'PostgreSQL', 'Airflow'],
    description: 'Build large-scale data pipelines processing terabytes of ad-tech and retail analytics data daily.',
    responsibilities: [
      'Construct ETL pipelines in Apache Airflow and PySpark.',
      'Optimize database query execution plans in PostgreSQL & Snowflake.',
      'Perform data quality validation checks.'
    ],
    preferred_skills: ['Snowflake', 'BigQuery']
  },
  {
    company: 'InMobi',
    role: 'Backend Engineering Intern',
    location: 'Bengaluru',
    work_mode: 'On-site',
    employment_type: 'Internship',
    salary: '₹30,000 / month (Stipend)',
    experience_required: '0 Years',
    education_required: 'B.Tech in CS/IT',
    skills: ['Java', 'Node.js', 'SQL', 'REST APIs', 'Git'],
    description: '6-month engineering internship in InMobi Ad-Tech Ad Serving platform group.',
    responsibilities: [
      'Assist in writing high-throughput REST API endpoints in Java / Node.js.',
      'Write automated unit and regression tests.',
      'Monitor API latency metrics.'
    ],
    preferred_skills: ['Redis', 'Kafka']
  }
];

export async function seedJobs() {
  console.log('🌱 Starting Seed process for 20+ Realistic Indian Jobs...');
  const supabase = getSupabase();

  if (supabase) {
    // Check if jobs already exist in Supabase
    const { data: existingJobs } = await supabase.from('jobs').select('id');
    if (existingJobs && existingJobs.length > 0) {
      console.log(`✅ Database already has ${existingJobs.length} jobs seeded.`);
      return;
    }

    const { data, error } = await supabase.from('jobs').insert(SAMPLE_INDIAN_JOBS).select();
    if (error) {
      console.error('❌ Failed to seed Supabase jobs table:', error.message);
    } else {
      console.log(`✅ Successfully seeded ${data?.length || 0} Indian jobs into Supabase!`);
    }
  } else {
    // Populate in-memory database
    memoryDb.jobs = SAMPLE_INDIAN_JOBS.map((job, idx) => ({
      ...job,
      id: `job-indian-sample-${idx + 1}`,
      created_at: new Date().toISOString(),
    }));
    console.log(`✅ Populated in-memory database with ${memoryDb.jobs.length} realistic Indian jobs!`);
  }
}

if (require.main === module) {
  seedJobs().then(() => {
    console.log('🎉 Seeding script execution completed.');
    process.exit(0);
  });
}
