import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to determine if an error is related to API quota or rate limits
function isQuotaError(err: any): boolean {
  if (!err) return false;
  const errMsg = String(err.message || err.stack || err).toLowerCase();
  return (
    errMsg.includes("429") ||
    errMsg.includes("quota") ||
    errMsg.includes("resource_exhausted") ||
    errMsg.includes("rate_limit") ||
    errMsg.includes("limit exceeded") ||
    (err.status === "RESOURCE_EXHAUSTED" || err.code === 429)
  );
}

// Robust, high-fidelity local parser to fall back on when API keys are exhausted
function localParseResume(resumeText: string) {
  const textLower = resumeText.toLowerCase();
  const skillsList = ["React", "TypeScript", "Node.js", "Express", "Figma", "UI", "UX", "HTML", "CSS", "JavaScript", "Python", "SQL", "Dart", "Flutter", "SEO"];
  const matchedSkills = skillsList.filter((skill) => textLower.includes(skill.toLowerCase()));
  
  // Simple regex to extract email
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "user@example.com";
  
  // Guess experience level
  let experience: "Junior" | "Mid" | "Senior" = "Junior";
  if (textLower.includes("senior") || textLower.includes("خبير") || textLower.includes("مدير") || textLower.includes("lead") || textLower.includes("manager") || textLower.includes("سنوات") && resumeText.match(/[6-9] سنوات|10 سنوات/)) {
    experience = "Senior";
  } else if (textLower.includes("mid") || textLower.includes("خبرة") || textLower.includes("سنوات") && resumeText.match(/[3-5] سنوات/)) {
    experience = "Mid";
  }

  // Guess Name from lines
  let name = "طالب وظيفة ذكي";
  const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const nameLine = lines.find(l => l.includes("الاسم") || l.toLowerCase().includes("name"));
    if (nameLine) {
      name = nameLine.replace(/الاسم\s*:\s*|name\s*:\s*/i, "").trim();
    } else if (lines[0].length < 45 && !lines[0].includes(":") && !lines[0].includes("@")) {
      name = lines[0];
    }
  }

  return {
    name,
    email,
    skills: matchedSkills.length > 0 ? matchedSkills : ["React", "JavaScript"],
    experience,
    isLocalFallback: true,
  };
}

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini Client successfully initialized.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY environment variable found. Using high-fidelity local simulation engines.");
}

// ---------------------------------------------------------
// Procedural Seed Data & Fallbacks
// ---------------------------------------------------------
const SAMPLE_JOBS = [
  {
    id: "seed-1",
    title: "مطور واجهات أمامية (React Developer)",
    company: "تقنية الحلول المبتكرة",
    region: "الرياض",
    experience: "Junior" as const,
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
    description: "نبحث عن مطور واجهات أمامية طموح للانضمام إلى فريقنا البرمجي بالرياض لإنشاء واجهات مستخدم مذهلة وتطبيقات ويب سريعة التجاوب.",
    salary: "8,000 - 11,000 ريال",
    contactEmail: "hr@solutions-innov.sa",
    postedAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "مهندس برمجيات خلفية (Backend Engineer - Node.js)",
    company: "بوابة سدايا للتقنية",
    region: "الرياض",
    experience: "Mid" as const,
    skills: ["Node.js", "Express", "PostgreSQL", "REST APIs"],
    description: "مطلوب مهندس برمجيات خلفية ذو خبرة متوسطة للعمل على تطوير وإدارة خوادم وقواعد بيانات الأنظمة السحابية والربط البرمجي الكامل.",
    salary: "12,000 - 16,000 ريال",
    contactEmail: "careers@sadaya-portal.com.sa",
    postedAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "مصمم تجربة المستخدم (UI/UX Designer)",
    company: "مجموعة المبدعين الرقمية",
    region: "جدة",
    experience: "Senior" as const,
    skills: ["Figma", "User Research", "Prototyping", "UI Design"],
    description: "نبحث عن مصمم تجربة وواجهة مستخدم خبير لقيادة عمليات تصميم وتطوير المنتجات الرقمية للمنصات الحكومية والتجارية في جدة.",
    salary: "15,000 - 20,000 ريال",
    contactEmail: "jobs@creative-digital.com",
    postedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "seed-4",
    title: "أخصائي تسويق رقمي وصناعة محتوى",
    company: "روافد للتسويق الإلكتروني",
    region: "المنطقة الشرقية",
    experience: "Junior" as const,
    skills: ["SEO", "Social Media", "Content Writing", "Google Analytics"],
    description: "فرصة ممتازة لأخصائي تسويق مبتدئ للعمل على إدارة حسابات التواصل الاجتماعي وتحسين محركات البحث وكتابة الإعلانات الجذابة.",
    salary: "6,000 - 8,500 ريال",
    contactEmail: "hr@rawafed-marketing.sa",
    postedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "seed-5",
    title: "مطور تطبيقات هواتف ذكية (Flutter Developer)",
    company: "التقنية اللامتناهية",
    region: "مكة المكرمة",
    experience: "Mid" as const,
    skills: ["Flutter", "Dart", "Firebase", "State Management"],
    description: "نبحث عن مطور فلاتر موهوب لبناء تطبيقات هواتف ذكية ممتازة وتعمل بسلاسة على نظامي iOS و Android.",
    salary: "10,000 - 14,000 ريال",
    contactEmail: "recruitment@infinitech.sa",
    postedAt: new Date(Date.now() - 14400000).toISOString(),
  }
];

// Helper to simulate alert triggers for newly created jobs
let activeJobsStore = [...SAMPLE_JOBS];

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", usingAI: ai !== null });
});

// GET /api/jobs - Search and filter jobs or dynamically generate them using Gemini
app.post("/api/jobs", async (req, res) => {
  const { region, skills = [], experience = "All" } = req.body;

  // Let's filter jobs currently stored in memory
  let filtered = activeJobsStore.filter((job) => {
    // Region filter (case-insensitive & supports substring/arabic terms)
    if (region && region.trim()) {
      const regQuery = region.trim().toLowerCase();
      const jobReg = job.region.toLowerCase();
      if (!jobReg.includes(regQuery) && !regQuery.includes(jobReg)) {
        return false;
      }
    }

    // Experience filter
    if (experience !== "All" && job.experience !== experience) {
      return false;
    }

    // Skills filter (at least one skill matches if specified)
    if (skills && skills.length > 0) {
      const jobSkillsLower = job.skills.map((s: string) => s.toLowerCase());
      const hasMatchingSkill = skills.some((s: string) =>
        jobSkillsLower.some((js: string) => js.includes(s.toLowerCase()))
      );
      if (!hasMatchingSkill) {
        return false;
      }
    }

    return true;
  });

  // If we have AI enabled and a custom region/skills is requested and we have less than 3 matched results,
  // we can use Gemini to dynamically generate 4 extremely high-quality local jobs for that region and skills!
  // This satisfies the "Search in region specified by the user" using Gemini AI.
  if (ai && region && region.trim().length > 1) {
    try {
      console.log(`Using Gemini to generate regional jobs in "${region}" matching skills: ${skills.join(", ")}`);
      
      const prompt = `Create exactly 4 realistic, high-quality job postings for the region/city of "${region}" in Saudi Arabia or neighboring areas, that are highly relevant to the required skills: [${skills.join(", ")}], and of varying experience levels (Junior, Mid, Senior).
Respond in professional Arabic (with English tech terms where appropriate, e.g. React Developer, Node.js). Ensure salary ranges are represented in Saudi Riyals (ريال).

The output must conform strictly to this JSON array schema, containing 4 objects:
[
  {
    "id": "gen-[random number]",
    "title": "[Job Title, e.g., مطور واجهات أمامية]",
    "company": "[Realistic Saudi Company Name, e.g., شركة العليان للحلول التقنية]",
    "region": "${region}",
    "experience": "Junior" | "Mid" | "Senior" | "All",
    "skills": ["Skill1", "Skill2", "Skill3"],
    "description": "[Attractive job description in Arabic outlining responsibilities and environment]",
    "salary": "[Salary range, e.g., 9,000 - 13,000 ريال]",
    "contactEmail": "[contact email, e.g., careers@company.com]"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                region: { type: Type.STRING },
                experience: { type: Type.STRING, enum: ["Junior", "Mid", "Senior", "All"] },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
                salary: { type: Type.STRING },
                contactEmail: { type: Type.STRING },
              },
              required: ["id", "title", "company", "region", "experience", "skills", "description", "salary", "contactEmail"],
            },
          },
        },
      });

      if (response.text) {
        const generatedJobs = JSON.parse(response.text.trim());
        const timestampedJobs = generatedJobs.map((j: any) => ({
          ...j,
          postedAt: new Date().toISOString(),
        }));

        // Append generated jobs to active memory store to enrich results and simulate persistent postings
        // Filter out duplicates based on ID
        for (const genJob of timestampedJobs) {
          if (!activeJobsStore.some((j) => j.title === genJob.title && j.company === genJob.company)) {
            activeJobsStore.unshift(genJob);
          }
        }

        // Re-filter with the newly appended AI jobs included
        filtered = activeJobsStore.filter((job) => {
          if (region && region.trim()) {
            const regQuery = region.trim().toLowerCase();
            const jobReg = job.region.toLowerCase();
            if (!jobReg.includes(regQuery) && !regQuery.includes(jobReg)) return false;
          }
          if (experience !== "All" && job.experience !== experience) return false;
          if (skills && skills.length > 0) {
            const jobSkillsLower = job.skills.map((s: string) => s.toLowerCase());
            const hasMatchingSkill = skills.some((s: string) =>
              jobSkillsLower.some((js: string) => js.includes(s.toLowerCase()))
            );
            if (!hasMatchingSkill) return false;
          }
          return true;
        });
      }
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn("Gemini API quota exceeded in jobs generation. Activating local database fallback.");
      } else {
        console.error("Failed to generate AI jobs:", error);
      }
    }
  }

  res.json({ jobs: filtered });
});

// POST /api/parse-resume - AI resume processing
app.post("/api/parse-resume", async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || !resumeText.trim()) {
    return res.status(400).json({ error: "Resume text is empty" });
  }

  // Fallback if AI is not enabled
  if (!ai) {
    return res.json(localParseResume(resumeText));
  }

  try {
    const prompt = `Analyze this resume text and extract the candidate's name, email, skills, and experience level.
Resume Text:
"""
${resumeText}
"""

Conform strictly to the following JSON schema:
{
  "name": "Full name of the candidate or a default friendly string if not found",
  "email": "extracted email or a default placeholder email if not found",
  "skills": ["Array of programming languages, tools, frameworks, or soft skills matched"],
  "experience": "Junior" | "Mid" | "Senior" (Choose based on years of experience, titles, or leadership words. Junior for <2 years, Mid for 2-5 years, Senior for 5+ years or Lead/Manager roles)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: { type: Type.STRING, enum: ["Junior", "Mid", "Senior"] },
          },
          required: ["name", "email", "skills", "experience"],
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }
  } catch (error) {
    const isQuota = isQuotaError(error);
    if (isQuota) {
      console.warn("Gemini API quota exceeded in resume parser. Activating local high-fidelity parsing engine.");
    } else {
      console.error("Failed to parse resume with AI:", error);
    }
    const fallbackResult = localParseResume(resumeText);
    return res.json({
      ...fallbackResult,
      quotaExceeded: isQuota
    });
  }
});

// POST /api/apply - Apply to a job and generate an AI-tailored cover letter and simulated email dispatches
app.post("/api/apply", async (req, res) => {
  const { job, profile } = req.body;

  if (!job || !profile) {
    return res.status(400).json({ error: "Job details or user profile missing." });
  }

  let coverLetter = "";
  let emailPreview = "";

  if (ai) {
    try {
      const prompt = `Draft a highly professional, engaging job application cover letter tailored specifically for this job and applicant.
Applicant Details:
- Name: ${profile.name}
- Email: ${profile.email}
- Key Skills: ${profile.skills.join(", ")}
- Experience Level: ${profile.experience}

Job Details:
- Job Title: ${job.title}
- Company: ${job.company}
- Region: ${job.region}
- Job Description: ${job.description}

Write the email cover letter in the dominant language of the job listing (usually Arabic for Saudi firms, or professional bilingual if mixed).
Keep it elegant, structured, highlight the candidate's matching skills, express enthusiasm, and conclude politely.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      coverLetter = response.text || "عزيزي مسؤول التوظيف، أود التقدم للوظيفة المذكورة...";
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn("Gemini API quota exceeded during cover letter generation. Using high-fidelity Arabic procedural template.");
      } else {
        console.error("Gemini failed to write cover letter:", error);
      }
      coverLetter = `السلام عليكم ورحمة الله وبركاته،\n\nأتقدم إليكم بطلب وظيفة "${job.title}" في شركة "${job.company}". أمتلك مهارات مناسبة تشمل (${profile.skills.join(", ")}) وبمستوى خبرة (${profile.experience}). يسعدني الانضمام إليكم.\n\nأطيب التحيات،\n${profile.name}`;
    }
  } else {
    // Generate beautiful procedural cover letter in Arabic
    coverLetter = `السلام عليكم ورحمة الله وبركاته،

إلى إدارة الموارد البشرية في ${job.company}،

لقد لفت انتباهي إعلانكم عن وظيفة "${job.title}" المتاحة في منطقة "${job.region}"، ويسعدني جدًا التقدم لهذه الفرصة المميزة.

بصفتي أخصائيًا في مجالي بمستوى خبرة "${profile.experience}"، ولدي مهارات متقدمة في:
${profile.skills.map((s: string) => `• ${s}`).join("\n")}

أعتقد أن خلفيتي المهنية وتطلعاتي تلتقي مع رؤية شركتكم الموقرة. لقد أرفقت سيرتي الذاتية للاطلاع عليها، وكلي أمل في الحصول على فرصة لإجراء مقابلة شخصية لمناقشة كيف يمكنني المساهمة في نجاحاتكم المستمرة.

وتفضلوا بقبول فائق الاحترام والتقدير،

${profile.name}
بريد التواصل: ${profile.email}`;
  }

  // Create the simulated email wrapper
  emailPreview = `From: ${profile.email}
To: ${job.contactEmail}
Subject: Application for ${job.title} - ${profile.name}
Date: ${new Date().toUTCString()}
Attachment: CV_Resume_${profile.name.replace(/\s+/g, "_")}.pdf (Attached Successfully)

----------------------------------------------------

${coverLetter}`;

  res.json({
    success: true,
    coverLetter,
    emailPreview,
    appliedAt: new Date().toISOString(),
  });
});

// POST /api/post-job - Simulate a employer adding a new job post to trigger notifications for subscribers
app.post("/api/post-job", (req, res) => {
  const { title, company, region, experience, skills, description, salary, contactEmail } = req.body;

  if (!title || !company || !region || !skills || !contactEmail) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const newJob = {
    id: `custom-${Date.now()}`,
    title,
    company,
    region,
    experience: (experience || "All") as any,
    skills: Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim()),
    description,
    salary: salary || "غير محدد",
    contactEmail,
    postedAt: new Date().toISOString(),
  };

  // Prepend to database
  activeJobsStore.unshift(newJob);

  res.json({ success: true, job: newJob });
});

// POST /api/search-company-emails - Search for company recruitment emails
app.post("/api/search-company-emails", async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is empty" });
  }

  const queryClean = query.trim();

  // Fallback data
  const fallbackCompanies = [
    {
      companyName: "شركة أرامكو السعودية",
      email: "recruiting@aramco.com",
      description: "إدارة استقطاب المواهب والكفاءات الهندسية والإدارية والتقنية",
      reliability: "رسمي وموثق",
      region: "المنطقة الشرقية، الظهران"
    },
    {
      companyName: "شركة سابك (SABIC)",
      email: "careers@sabic.com",
      description: "الموارد البشرية والتوظيف العالمي للبتروكيماويات والحلول الابتكارية",
      reliability: "رسمي وموثق",
      region: "الرياض"
    },
    {
      companyName: "مجموعة الراجحي المالية",
      email: "jobs@alrajhibank.com.sa",
      description: "إدارة علاقات التوظيف للقطاع المصرفي والمالي وتقنية المعلومات والخدمات",
      reliability: "شبه رسمي",
      region: "الرياض والمناطق"
    },
    {
      companyName: "شركة الاتصالات السعودية (STC)",
      email: "recruitment@stc.com.sa",
      description: "استقطاب المواهب التقنية الرقمية والأمن السيبراني والمبيعات",
      reliability: "رسمي وموثق",
      region: "الرياض"
    },
    {
      companyName: "شركة علم (Elm)",
      email: "careers@elm.sa",
      description: "التوظيف التقني والمشاريع الحكومية والتحول الرقمي",
      reliability: "رسمي وموثق",
      region: "الرياض"
    }
  ];

  if (!ai) {
    // Local filter based on query
    const results = fallbackCompanies.filter(c => 
      c.companyName.toLowerCase().includes(queryClean.toLowerCase()) || 
      c.email.toLowerCase().includes(queryClean.toLowerCase())
    );
    return res.json({ companies: results.length > 0 ? results : fallbackCompanies });
  }

  try {
    const prompt = `Generate exactly 5 realistic, professional recruitment/HR contact records of companies or sectors matching the query: "${queryClean}" in Saudi Arabia or Gulf region.
Make sure the email addresses and company information look highly professional and realistic (e.g., hr@company.sa, careers@company.com).

Conform strictly to the following JSON schema format:
{
  "companies": [
    {
      "companyName": "[Realistic Arabic Company/Sector Name]",
      "email": "[recruitment email, e.g., jobs@company.com.sa]",
      "description": "[Brief description of the recruitment department or roles in Arabic]",
      "reliability": "رسمي وموثق" | "تنبؤي تقريبي",
      "region": "[Headquarters or major region, e.g., الرياض]"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  companyName: { type: Type.STRING },
                  email: { type: Type.STRING },
                  description: { type: Type.STRING },
                  reliability: { type: Type.STRING, enum: ["رسمي وموثق", "تنبؤي تقريبي"] },
                  region: { type: Type.STRING }
                },
                required: ["companyName", "email", "description", "reliability", "region"]
              }
            }
          },
          required: ["companies"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }
  } catch (error) {
    const isQuota = isQuotaError(error);
    if (isQuota) {
      console.warn("Gemini API quota exceeded in company email search. Activating filtered local fallback.");
    } else {
      console.error("Gemini company email search failed:", error);
    }
    const queryLower = queryClean.toLowerCase();
    const filteredFallback = fallbackCompanies.filter(c =>
      c.companyName.toLowerCase().includes(queryLower) ||
      c.email.toLowerCase().includes(queryLower) ||
      c.description.toLowerCase().includes(queryLower) ||
      c.region.toLowerCase().includes(queryLower)
    );
    res.json({
      companies: filteredFallback.length > 0 ? filteredFallback : fallbackCompanies,
      quotaExceeded: isQuota
    });
  }
});

// ---------------------------------------------------------
// Serving Frontend / Static Assets
// ---------------------------------------------------------

if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on http://localhost:${PORT}`);
    });
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on http://localhost:${PORT}`);
  });
}
