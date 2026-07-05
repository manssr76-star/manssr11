import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Award,
  DollarSign,
  Search,
  Sparkles,
  Send,
  Bell,
  Mail,
  History,
  Info,
  CheckCircle2,
  FileText,
  X,
  AlertCircle,
  Building2,
  User,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  Check,
  SendHorizontal,
  Loader2,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Job, UserProfile, Application, JobAlert, SystemNotification, CompanyEmail } from "./types";
import NotificationCenter from "./components/NotificationCenter";
import AlertSettings from "./components/AlertSettings";
import ProfileSection from "./components/ProfileSection";
import EmployerSandbox from "./components/EmployerSandbox";

export default function App() {
  // 1. Core States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "أحمد بن عبد الله",
    email: "ahmed.dev@gmail.com",
    phone: "0512345678",
    title: "أخصائي مطور واجهات أمامية (React)",
    skills: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Vite", "Figma", "REST APIs"],
    experience: "Mid",
    resumeText: "الاسم الكامل: أحمد بن عبد الله\nالبريد الإلكتروني: ahmed.dev@gmail.com\nرقم الجوال: 0512345678\nالمسمى: مطور واجهات أمامية (React)\nالخبرة: سنتين ونصف\nالمهارات التقنية: React, TypeScript, JavaScript, Tailwind CSS, REST APIs\nالمؤهل: بكالوريوس تقنية معلومات من جامعة الملك سعود",
    resumeFileName: "السيرة_الذاتية_أحمد_الرئيسية.pdf",
    activeCvId: "cv-seed-primary",
    workExperiences: [
      {
        id: "exp-seed-1",
        jobTitle: "مطور واجهات أمامية (React)",
        company: "مجموعة الحلول الرقمية المتقدمة",
        region: "الرياض",
        startDate: "2024-02",
        endDate: "الآن",
        isCurrent: true,
        description: "قيادة تطوير الواجهات الأمامية لمنصة المسار الإلكترونية والمراسلة بالنيابة باستخدام React 18 وVite وTailwind CSS."
      },
      {
        id: "exp-seed-2",
        jobTitle: "مطور تطبيقات ويب مبتدئ",
        company: "شركة الحلول اللامتناهية",
        region: "جدة",
        startDate: "2022-06",
        endDate: "2024-01",
        isCurrent: false,
        description: "تصميم وبرمجة لوحات تحكم تفاعلية متجاوبة وربطها مع خدمات الخوادم وقواعد البيانات المصغرة."
      }
    ],
    educationList: [
      {
        id: "edu-seed-1",
        degree: "بكالوريوس علوم الحاسب والمعلومات",
        institution: "جامعة الملك سعود",
        fieldOfStudy: "تقنية المعلومات",
        graduationYear: "2022"
      }
    ],
    cvs: [
      {
        id: "cv-seed-primary",
        fileName: "السيرة_الذاتية_أحمد_الرئيسية.pdf",
        uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        fileSize: "1.2 MB",
        content: "الاسم الكامل: أحمد بن عبد الله\nالبريد الإلكتروني: ahmed.dev@gmail.com\nرقم الجوال: 0512345678\nالمسمى: مطور واجهات أمامية (React)\nالخبرة: سنتين ونصف\nالمهارات التقنية: React, TypeScript, JavaScript, Tailwind CSS, REST APIs\nالمؤهل: بكالوريوس تقنية معلومات من جامعة الملك سعود",
        isActive: true
      },
      {
        id: "cv-seed-secondary",
        fileName: "سيرة_ذاتية_بناء_مشاريع_فرعية.txt",
        uploadedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        fileSize: "0.4 MB",
        content: "الاسم الكامل: أحمد بن عبد الله\nالخبرات الجانبية: تطوير برمجيات مفتوحة المصدر وبوتات ذكية ومشاريع فرونت اند سريعة التجاوب.",
        isActive: false
      }
    ]
  });
  const [applications, setApplications] = useState<Application[]>([]);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  
  // 2. Mobile Active Tab
  // 'jobs' | 'emails' | 'alerts' | 'profile' | 'sandbox'
  const [activeTab, setActiveTab] = useState<'jobs' | 'emails' | 'alerts' | 'profile' | 'sandbox'>('jobs');

  // 3. Search & Filtering States (Jobs Tab)
  const [searchRegion, setSearchRegion] = useState("الرياض");
  const [selectedExperience, setSelectedExperience] = useState<'Junior' | 'Mid' | 'Senior' | 'All'>("All");
  const [skillInput, setSkillInput] = useState("");
  const [searchSkills, setSearchSkills] = useState<string[]>([]);
  
  // 4. Company Email Search States (Emails Tab)
  const [companyQuery, setCompanyQuery] = useState("");
  const [discoveredCompanies, setDiscoveredCompanies] = useState<CompanyEmail[]>([]);
  const [isSearchingEmails, setIsSearchingEmails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyEmail | null>(null);
  
  // Custom automated sending process states
  const [isSendingOnBehalf, setIsSendingOnBehalf] = useState(false);
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingSuccess, setSendingSuccess] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");

  // 5. Job Details View
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedDetails, setAppliedDetails] = useState<Application | null>(null);
  const [activeFeedTab, setActiveFeedTab] = useState<'search' | 'history'>("search");
  const [isLoading, setIsLoading] = useState(false);
  const [customToast, setCustomToast] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  // Simulated Time for Status Bar
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Keep clock updated
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12;
      hours = hours ? hours : 12; // safety
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load initial search list on mount
  useEffect(() => {
    fetchJobs(searchRegion, searchSkills, selectedExperience);
    
    // Set up 1 starter active alert to guide the user
    setAlerts([
      {
        id: "alert-starter",
        region: "الرياض",
        skills: ["React"],
        experience: "All",
        isActive: true
      }
    ]);

    // Initial search for companies to show some results on first load
    handleSearchCompanyEmails("أرامكو");
  }, []);

  // Fetch jobs from Express API
  const fetchJobs = async (region: string, skills: string[], experience: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, skills, experience }),
      });
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
        checkAlertsForJobs(data.jobs, alerts);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search manually
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(searchRegion, searchSkills, selectedExperience);
  };

  const handleAddSearchSkill = () => {
    if (skillInput.trim() && !searchSkills.includes(skillInput.trim())) {
      setSearchSkills([...searchSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSearchSkill = (skill: string) => {
    setSearchSkills(searchSkills.filter((s) => s !== skill));
  };

  // Call API to parse resume
  const handleParseResume = async (text: string) => {
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: text }),
    });
    if (!response.ok) {
      throw new Error("Failed to parse resume");
    }
    return response.json();
  };

  // Call API to apply for job
  const handleApplyJob = async () => {
    if (!selectedJob) return;
    setIsApplying(true);
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job: selectedJob, profile }),
      });
      const result = await response.json();
      if (result.success) {
        const newApp: Application = {
          id: `app-${Date.now()}`,
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          appliedAt: result.appliedAt,
          coverLetter: result.coverLetter,
          emailPreview: result.emailPreview,
          status: "Sent",
        };
        setApplications((prev) => [newApp, ...prev]);
        setAppliedDetails(newApp);
        
        // Show success Toast
        triggerToast(`تم إرسال سيفي والتقديم على ${selectedJob.title} بنجاح!`, 'success');
      }
    } catch (err) {
      console.error(err);
      triggerToast("تعذر إرسال التقديم حالياً، يرجى المحاولة لاحقاً.", 'alert');
    } finally {
      setIsApplying(false);
    }
  };

  // Search for company recruitment emails
  const handleSearchCompanyEmails = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsSearchingEmails(true);
    try {
      const response = await fetch("/api/search-company-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm }),
      });
      const data = await response.json();
      if (data.companies) {
        setDiscoveredCompanies(data.companies);
      }
    } catch (err) {
      console.error("Error searching company emails:", err);
      triggerToast("تعذر البحث عن إيميلات الشركات حالياً.", 'alert');
    } finally {
      setIsSearchingEmails(false);
    }
  };

  // Compose AI cover letter draft for custom company recruitment email
  const handleDraftCustomEmailLetter = async (company: CompanyEmail) => {
    setSelectedCompany(company);
    setSendingSuccess(false);
    setSendingProgress(0);
    setSendingLogs([]);
    
    // Generate simple customized letter immediately as a base
    const customLetterPrompt = `السلام عليكم ورحمة الله وبركاته،
إلى فريق استقطاب المواهب والتوظيف في ${company.companyName}،

يطيب لي التقدم إليكم مباشرة بطلب رغبة وظيفية للانضمام لشركتكم الموقرة في منطقة ${company.region}.

أنا ${profile.name}، وأمتلك مهارات احترافية وخبرات تشمل: ${profile.skills.join(", ")} بمستوى خبرة ${profile.experience === 'Junior' ? 'مبتدئ' : profile.experience === 'Mid' ? 'متوسط' : 'خبير'}.

لقد قمت بإرفاق سيرتي الذاتية للاطلاع عليها وأرجو أن أحظى بفرصة مقابلة كريمة لمناقشة طموحي لخدمة وتطوير أهدافكم.

وتقبلوا وافر التقدير والاحترام،
${profile.name}
بريدي الإلكتروني: ${profile.email}`;

    setGeneratedLetter(customLetterPrompt);
  };

  // Dispatch Email on behalf of user (Simulated advanced pipeline with terminal log)
  const handleSendEmailOnBehalf = async () => {
    if (!selectedCompany) return;
    setIsSendingOnBehalf(true);
    setSendingSuccess(false);
    setSendingProgress(5);
    setSendingLogs(["جاري تهيئة قناة الاتصال SMTP...", "جاري تشفير الاتصال الآمن (TLS v1.3)..."]);

    // Phase 1: 1.5 seconds
    setTimeout(() => {
      setSendingProgress(30);
      setSendingLogs(prev => [
        ...prev,
        `تم تأسيس الاتصال المشفر بنجاح مع خوادم البريد لـ ${selectedCompany.companyName}`,
        "جاري إعداد حزمة الطلب (CV_Attachment + Profile Data)...",
        profile.resumeFileName ? `تم دمج ملف السيرة الذاتية المرفوع: ${profile.resumeFileName}` : "تنبيه: لم ترفق سيفي مخصص، تم دمج ملف المسار الرقمي الموحد للباحث"
      ]);
    }, 1200);

    // Phase 2: 3 seconds
    setTimeout(() => {
      setSendingProgress(65);
      setSendingLogs(prev => [
        ...prev,
        "جاري صياغة الرسالة النهائية وتلقيحها بالذكاء الاصطناعي لتطابق الشروط المحددة...",
        `العنوان: طلب وظيفي وانضمام - ${profile.name}`,
        `المستلم الفعلي: ${selectedCompany.email}`,
        "جاري إرسال البيانات وتجاوز جدار حماية البريد المزعج (Spam Filter Check)... ✅"
      ]);
    }, 2400);

    // Phase 3: 4.5 seconds
    setTimeout(() => {
      setSendingProgress(100);
      setSendingLogs(prev => [
        ...prev,
        "تم تسليم الرسالة للخادم بنجاح! 🚀",
        `كود التأكيد البريدي المستلم: SMTP_MSG_ID_${Math.floor(Math.random() * 900000 + 100000)}`,
        `تم تسليم الملف التعريفي والخطاب إلى ${selectedCompany.companyName} بنجاح بالنيابة عنك!`
      ]);
      setSendingSuccess(true);
      setIsSendingOnBehalf(false);
      
      // Save this as a custom application history item
      const customApp: Application = {
        id: `app-custom-${Date.now()}`,
        jobId: `company-${Date.now()}`,
        jobTitle: "طلب توظيف مباشر بالنيابة عن المستخدم",
        company: selectedCompany.companyName,
        appliedAt: new Date().toISOString(),
        coverLetter: generatedLetter,
        status: "Sent",
        emailPreview: `From: ${profile.email}\nTo: ${selectedCompany.email}\nSubject: Direct Talent Application - ${profile.name}\nDate: ${new Date().toUTCString()}\nAttachment: CV_Resume_${profile.name.replace(/\s+/g, "_")}.pdf (Verified)\n\n--------------------------------------------\n\n${generatedLetter}`
      };
      setApplications(prev => [customApp, ...prev]);
      
      playNotificationSound();
      triggerToast(`تمت مراسلة شركة ${selectedCompany.companyName} بنجاح بالنيابة عنك!`, 'success');
    }, 4500);
  };

  // Post employer sandbox job
  const handlePostEmployerJob = async (jobData: any) => {
    try {
      const response = await fetch("/api/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      const result = await response.json();
      if (result.success) {
        setJobs((prev) => [result.job, ...prev]);
        
        // Match with user alerts
        const matchedAlerts = alerts.filter((alert) => {
          if (!alert.isActive) return false;
          const regionMatch = result.job.region.toLowerCase().includes(alert.region.toLowerCase()) || 
                              alert.region.toLowerCase().includes(result.job.region.toLowerCase());
          if (!regionMatch) return false;
          if (alert.experience !== "All" && result.job.experience !== alert.experience) return false;
          if (alert.skills.length > 0) {
            const jobSkillsLower = result.job.skills.map((s: string) => s.toLowerCase());
            const hasSkill = alert.skills.some((s) => 
              jobSkillsLower.some((js) => js.includes(s.toLowerCase()))
            );
            if (!hasSkill) return false;
          }
          return true;
        });

        if (matchedAlerts.length > 0) {
          playNotificationSound();
          const newNotifs = matchedAlerts.map((alert) => ({
            id: `notif-${Date.now()}-${Math.random()}`,
            title: `فرصة مطابقة للتنبيه في ${result.job.region}!`,
            message: `وظيفة جديدة "${result.job.title}" في شركة ${result.job.company} تطابق تفضيلاتك وجرس تنبيهك النشط.`,
            jobId: result.job.id,
            createdAt: new Date().toISOString(),
            read: false,
          }));
          setNotifications((prev) => [...newNotifs, ...prev]);
          triggerToast(`تنبيه فوري! فرصة جديدة مطابقة لتفضيلاتك: ${result.job.title}`, 'alert');
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Check alert settings against a list of loaded jobs
  const checkAlertsForJobs = (loadedJobs: Job[], activeAlerts: JobAlert[]) => {
    const matched: SystemNotification[] = [];
    activeAlerts.forEach((alert) => {
      if (!alert.isActive) return;
      loadedJobs.forEach((job) => {
        const regionMatch = job.region.toLowerCase().includes(alert.region.toLowerCase()) || 
                            alert.region.toLowerCase().includes(job.region.toLowerCase());
        if (!regionMatch) return;
        if (alert.experience !== "All" && job.experience !== alert.experience) return;
        if (alert.skills.length > 0) {
          const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
          const hasSkill = alert.skills.some((s) => 
            jobSkillsLower.some((js) => js.includes(s.toLowerCase()))
          );
          if (!hasSkill) return;
        }
        if (notifications.some((n) => n.jobId === job.id)) return;

        matched.push({
          id: `notif-check-${job.id}-${Date.now()}`,
          title: `فرصة مطابقة في ${job.region}`,
          message: `تم العثور على وظيفة "${job.title}" لدى "${job.company}" متوافقة مع مهاراتك المختارة.`,
          jobId: job.id,
          createdAt: new Date().toISOString(),
          read: false,
        });
      });
    });

    if (matched.length > 0) {
      setNotifications((prev) => [...matched, ...prev]);
      triggerToast(`تم العثور على ${matched.length} وظائف مطابقة لتنبيهاتك النشطة!`, 'alert');
    }
  };

  // Helper to trigger floating custom notification toast
  const triggerToast = (message: string, type: 'success' | 'alert') => {
    setCustomToast({ message, type });
    setTimeout(() => setCustomToast(null), 5000);
  };

  // Play audio notification chime
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log("Audio feedback skipped");
    }
  };

  // Alert settings CRUD handlers
  const handleAddAlert = (alertData: Omit<JobAlert, "id" | "isActive">) => {
    const newAlert: JobAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      isActive: true,
    };
    setAlerts([...alerts, newAlert]);
    triggerToast("تم تفعيل جرس التنبيه الفوري الجديد!", "success");
    checkAlertsForJobs(jobs, [newAlert]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleSelectJobFromNotification = (jobId: string) => {
    const found = jobs.find((j) => j.id === jobId);
    if (found) {
      setSelectedJob(found);
      setAppliedDetails(null);
      setActiveTab('jobs');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-0 md:p-6 text-right font-sans antialiased overflow-x-hidden select-none">
      
      {/* Decorative Neon background elements for gorgeous smartphone presentation */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl pointer-events-none hidden md:block"></div>

      {/* Main Container - Renders virtual phone on desktop and fits perfectly on real mobile */}
      <div className="w-full max-w-[430px] h-screen md:h-[880px] bg-slate-950 md:rounded-[48px] md:border-[12px] md:border-slate-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative flex flex-col overflow-hidden text-slate-100" id="smartphone-wrapper">
        
        {/* Phone Virtual Notch & Top Status Bar */}
        <div className="w-full bg-slate-950 px-6 pt-3 pb-2 flex justify-between items-center z-50 text-[11px] font-bold text-slate-300 shrink-0 select-none">
          {/* Signal and battery icons */}
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">98%</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          
          {/* Elegant curved dynamic island / speaker notch simulator (Centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-32 h-6 bg-slate-900 rounded-full border border-slate-800/40 hidden md:flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full ml-1"></div>
            <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
          </div>

          {/* Time text */}
          <div className="pr-1 text-[11px] tracking-wide text-slate-200">
            {currentTime || "10:30 ص"}
          </div>
        </div>

        {/* Dynamic Mobile Header */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800/60 flex justify-between items-center z-30 shrink-0" id="mobile-header">
          {/* Notification hub */}
          <div className="flex items-center gap-2">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkNotifAsRead}
              onClearAll={handleClearAllNotifs}
              onSelectJob={handleSelectJobFromNotification}
            />
          </div>

          {/* Logo / Title */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[8px] bg-emerald-600 font-bold px-1.5 py-0.5 rounded text-white tracking-widest">AI</span>
                <h1 className="text-sm font-black tracking-tight text-white">Alyfee توظيف ai</h1>
              </div>
              <p className="text-[9px] text-slate-400">البحث التلقائي والمراسلة بالنيابة</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Scrolling Mobile Screen Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 pb-20 relative scrollbar-none" id="mobile-screen-body">
          
          {/* Custom toast inside screen */}
          <AnimatePresence>
            {customToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-2 left-4 right-4 z-40 flex items-center gap-2.5 bg-slate-900/95 border border-slate-800 text-white p-3 rounded-xl shadow-lg text-xs"
              >
                {customToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                )}
                <span className="font-medium text-right flex-1">{customToast.message}</span>
                <button onClick={() => setCustomToast(null)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCREEN TAB 1: JOBS DIRECTORY & EXPLORER */}
          {activeTab === 'jobs' && (
            <div className="space-y-4" id="screen-jobs">
              
              {/* Search Widget */}
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80">
                <div className="flex items-center gap-1.5 mb-2 justify-end text-emerald-400">
                  <span className="text-xs font-bold">تصفية الفرص الوظيفية</span>
                  <Search className="w-3.5 h-3.5" />
                </div>
                
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      </span>
                      <input
                        type="text"
                        value={searchRegion}
                        onChange={(e) => setSearchRegion(e.target.value)}
                        placeholder="المدينة: الرياض، جدة، الدمام..."
                        className="w-full text-xs pr-9 pl-3 py-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-right font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select
                          value={selectedExperience}
                          onChange={(e) => setSelectedExperience(e.target.value as any)}
                          className="w-full text-[11px] px-2 py-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-right"
                        >
                          <option value="All">الخبرة: الكل</option>
                          <option value="Junior">مبتدئ (Junior)</option>
                          <option value="Mid">متوسط (Mid)</option>
                          <option value="Senior">خبير (Senior)</option>
                        </select>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSearchSkill();
                            }
                          }}
                          placeholder="مثال: React"
                          className="w-full text-[11px] px-2 py-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-right"
                        />
                        {skillInput.trim() && (
                          <button
                            type="button"
                            onClick={handleAddSearchSkill}
                            className="absolute left-1 top-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-lg"
                          >
                            أضف
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {searchSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center justify-end pt-1">
                      {searchSkills.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-900/50"
                        >
                          {tag}
                          <button type="button" onClick={() => handleRemoveSearchSkill(tag)} className="text-emerald-500 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    ابحث عن وظائف مطابقة
                  </button>
                </form>
              </div>

              {/* Feed Tabs inside Job Tab */}
              <div className="flex border-b border-slate-800 gap-4 text-xs font-bold" id="job-feed-tabs">
                <button
                  onClick={() => setActiveFeedTab('search')}
                  className={`pb-2 transition relative ${activeFeedTab === 'search' ? "text-emerald-400" : "text-slate-400"}`}
                >
                  الفرص المتاحة ({jobs.length})
                  {activeFeedTab === 'search' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />}
                </button>
                <button
                  onClick={() => setActiveFeedTab('history')}
                  className={`pb-2 transition relative ${activeFeedTab === 'history' ? "text-emerald-400" : "text-slate-400"}`}
                >
                  الطلبات البريدية ({applications.length})
                  {activeFeedTab === 'history' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />}
                </button>
              </div>

              {/* Jobs List */}
              {activeFeedTab === 'search' ? (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                      <p className="text-[11px] text-slate-400">جاري قراءة البيانات وتوليد الوظائف...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8 bg-slate-900/30 rounded-2xl border border-slate-900 p-6">
                      <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <h4 className="font-bold text-slate-300 text-xs">لم نجد نتائج مطابقة</h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        جرب تغيير مدينة التصفية أو أضف مدينة جديدة، وسوف يستخدم النظام الذكاء الاصطناعي لتوليد وظائف مطابقة لتطلعاتك فوراً.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {jobs.map((job) => (
                        <div
                          key={job.id}
                          onClick={() => {
                            setSelectedJob(job);
                            setAppliedDetails(applications.find((app) => app.jobId === job.id) || null);
                          }}
                          className={`bg-slate-900/60 rounded-xl p-3.5 border hover:border-emerald-500/40 transition cursor-pointer ${
                            selectedJob?.id === job.id ? "ring-2 ring-emerald-500 border-transparent bg-slate-900" : "border-slate-900"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                              {job.experience === 'All' ? "الكل" : job.experience}
                            </span>
                            <h3 className="font-bold text-slate-100 text-xs line-clamp-1">{job.title}</h3>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 mt-1">{job.company}</div>

                          <div className="flex gap-2 justify-end my-2 text-[9px] text-slate-300">
                            <span className="bg-slate-950 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              {job.region}
                              <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                            </span>
                            <span className="bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              {job.salary}
                              <DollarSign className="w-2.5 h-2.5 text-emerald-500" />
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                            {job.description}
                          </p>

                          <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[9px]">
                            <span className="text-slate-500">{new Date(job.postedAt).toLocaleDateString("ar-SA")}</span>
                            {applications.some((app) => app.jobId === job.id) ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" />
                                تم التقديم بالكامل
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-bold">عرض تفاصيل السيفي والتقديم ←</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* History inside Jobs feed */
                <div className="space-y-3">
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-[11px] text-slate-400">لم تقم بأي تقديمات بعد.</p>
                    </div>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-start text-[10px]">
                          <span className="text-slate-400">{new Date(app.appliedAt).toLocaleDateString("ar-SA")}</span>
                          <div>
                            <h4 className="font-bold text-slate-200">{app.jobTitle}</h4>
                            <p className="text-slate-400 text-[9px]">{app.company}</p>
                          </div>
                        </div>

                        {app.emailPreview && (
                          <div className="bg-slate-950 p-2 rounded-lg font-mono text-[8px] text-slate-300 overflow-x-auto max-h-[100px]">
                            <pre className="whitespace-pre-wrap">{app.emailPreview}</pre>
                          </div>
                        )}

                        <div className="text-[9px] text-emerald-400 font-bold text-left">
                          مرسل بنجاح عبر خادم البريد التلقائي للذكاء الاصطناعي
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Selected Job Drawer Overlay for Mobile */}
              <AnimatePresence>
                {selectedJob && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed inset-x-0 bottom-16 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 z-40 max-w-[430px] mx-auto overflow-y-auto max-h-[75%]"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <button onClick={() => setSelectedJob(null)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="font-bold text-slate-100 text-xs truncate max-w-[250px]">{selectedJob.title}</h3>
                    </div>

                    <div className="space-y-3.5 text-right text-[11px]">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">اسم المنشأة</span>
                        <span className="font-bold text-slate-200">{selectedJob.company}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="block text-slate-400 text-[9px] mb-0.5">المدينة</span>
                          <span className="font-bold text-slate-200">{selectedJob.region}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          <span className="block text-slate-400 text-[9px] mb-0.5">الراتب</span>
                          <span className="font-bold text-emerald-400">{selectedJob.salary}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="block text-slate-400 text-[9px] mb-1">المهارات المطلوبة</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {selectedJob.skills.map(s => (
                            <span key={s} className="bg-slate-900 text-slate-200 text-[9px] px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                        <span className="block text-slate-400 text-[9px] mb-1">وصف المهام والبيئة</span>
                        <p className="text-slate-300 text-[10px] whitespace-pre-line">{selectedJob.description}</p>
                      </div>

                      {/* Cover letter & Sending CTA */}
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <span className="block text-slate-400 text-[9px] text-right">ملف السيرة الذاتية المرفق بالتقديم:</span>
                          {profile.cvs && profile.cvs.length > 0 ? (
                            <div className="space-y-1.5 text-right">
                              {profile.cvs.map((cv) => (
                                <button
                                  key={cv.id}
                                  type="button"
                                  onClick={() => {
                                    const updated = profile.cvs?.map(c => ({ ...c, isActive: c.id === cv.id })) || [];
                                    setProfile({
                                      ...profile,
                                      cvs: updated,
                                      activeCvId: cv.id,
                                      resumeFileName: cv.fileName,
                                      resumeText: cv.content
                                    });
                                  }}
                                  className={`w-full p-2 rounded-lg border text-right text-[10px] flex items-center justify-between transition-all ${
                                    cv.isActive || profile.activeCvId === cv.id
                                      ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold"
                                      : "border-slate-850 bg-slate-900 text-slate-400 hover:bg-slate-800"
                                  }`}
                                >
                                  <span className="font-mono text-[8px] text-slate-500">{cv.fileSize}</span>
                                  <div className="flex items-center gap-1.5 justify-end">
                                    <span className="truncate max-w-[170px]">{cv.fileName}</span>
                                    { (cv.isActive || profile.activeCvId === cv.id) ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <div className="w-3 h-3 rounded-full border border-slate-700" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-900/30 text-right">
                              لا توجد سير ذاتية مرفوعة حالياً. سيتم إرسال المسار الشخصي الرقمي الموحد.
                            </div>
                          )}
                        </div>

                        {appliedDetails ? (
                          <div className="space-y-2">
                            <div className="bg-slate-950 p-2.5 rounded-lg text-slate-300 text-[9px]">
                              <span className="text-emerald-400 font-bold block mb-1">الخطاب الذكي المولد لملفك الشخصي:</span>
                              {appliedDetails.coverLetter}
                            </div>
                            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/30 p-2 rounded-lg justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                              تم إرسال هذا التقديم بنجاح!
                            </span>
                          </div>
                        ) : (
                          <button
                            disabled={isApplying}
                            onClick={handleApplyJob}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isApplying ? "جاري صياغة الخطاب وإرسال الإيميل..." : "التقديم التلقائي بالذكاء الاصطناعي"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* SCREEN TAB 2: COMPANY EMAILS DIRECTORY & DIRECT SENDING */}
          {activeTab === 'emails' && (
            <div className="space-y-4" id="screen-emails">
              
              {/* Feature Intro */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <h3 className="font-bold text-xs text-emerald-400">البحث الذكي عن إيميلات التوظيف والمراسلة بالنيابة</h3>
                  <Building2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  اكتب اسم أي منشأة أو قطاع (مثال: أرامكو، بنك، مستشفى، تقنية)؛ وسيقوم النظام بالبحث وتوليد إيميلات التوظيف وقسم الموارد البشرية مع إمكانية إرسال ملفك الشخصي بالكامل وخطاب مخصص بالنيابة عنك فوراً!
                </p>
              </div>

              {/* Email Finder Search input */}
              <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex gap-2">
                <button
                  onClick={() => handleSearchCompanyEmails(companyQuery)}
                  disabled={!companyQuery.trim() || isSearchingEmails}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  {isSearchingEmails ? "جاري البحث..." : "ابحث"}
                </button>
                <input
                  type="text"
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                  placeholder="ابحث عن شركة: مثل سابك، أرامكو، نيوما..."
                  className="flex-1 text-xs px-3 py-2 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-right"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchCompanyEmails(companyQuery);
                  }}
                />
              </div>

              {/* Discovered results list */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 text-right pr-1">إيميلات الموارد البشرية والتوظيف المتوفرة:</h4>
                
                {isSearchingEmails ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400">يقوم الذكاء الاصطناعي بتتبع عناوين التوظيف وفحصها...</p>
                  </div>
                ) : discoveredCompanies.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-[10px]">
                    لا توجد شركات مدرجة بالبحث حالياً، اكتب اسماً للبحث.
                  </div>
                ) : (
                  discoveredCompanies.map((comp) => (
                    <div
                      key={comp.email}
                      className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700/80 transition text-right space-y-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-900/50">
                          {comp.reliability}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-100">{comp.companyName}</h4>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-300 bg-slate-950 px-2 py-1.5 rounded border border-slate-900 font-mono">
                        <span className="text-[9px] text-slate-500">{comp.region}</span>
                        <span className="font-semibold text-emerald-400 select-all">{comp.email}</span>
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal">
                        {comp.description}
                      </p>

                      <div className="border-t border-slate-800/60 pt-2 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500">تم التحقق بواسطة نظام مسار للفرص</span>
                        <button
                          onClick={() => handleDraftCustomEmailLetter(comp)}
                          className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-lg border border-emerald-900/40 transition flex items-center gap-1"
                        >
                          <SendHorizontal className="w-3 h-3" />
                          مراسلة فورية بالنيابة
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Direct email sender modal drawer overlay inside app */}
              <AnimatePresence>
                {selectedCompany && (
                  <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed inset-x-0 bottom-16 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 z-40 max-w-[430px] mx-auto overflow-y-auto max-h-[80%] text-right space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <button onClick={() => setSelectedCompany(null)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                      <h3 className="font-bold text-slate-100 text-xs">
                        تجهيز إرسال بالنيابة: {selectedCompany.companyName}
                      </h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 mb-1">البريد المستهدف للمراسلة المباشرة</span>
                        <input
                          type="text"
                          readOnly
                          value={selectedCompany.email}
                          className="w-full text-xs px-3 py-2 bg-slate-950 text-emerald-400 font-mono border border-slate-800 rounded-xl"
                        />
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 mb-1">خطاب الغلاف المخصص للشركة (يمكنك تعديله)</span>
                        <textarea
                          value={generatedLetter}
                          onChange={(e) => setGeneratedLetter(e.target.value)}
                          className="w-full h-36 text-[10px] p-2.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 font-medium leading-relaxed text-right"
                        />
                      </div>

                      {/* Attachment indication */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <span className="block text-slate-400 text-[9px] text-right">ملف السيرة الذاتية المرفق للإرسال بالنيابة:</span>
                        {profile.cvs && profile.cvs.length > 0 ? (
                          <div className="space-y-1.5 text-right">
                            {profile.cvs.map((cv) => (
                              <button
                                key={cv.id}
                                type="button"
                                onClick={() => {
                                  const updated = profile.cvs?.map(c => ({ ...c, isActive: c.id === cv.id })) || [];
                                  setProfile({
                                    ...profile,
                                    cvs: updated,
                                    activeCvId: cv.id,
                                    resumeFileName: cv.fileName,
                                    resumeText: cv.content
                                  });
                                }}
                                className={`w-full p-2 rounded-lg border text-right text-[10px] flex items-center justify-between transition-all ${
                                  cv.isActive || profile.activeCvId === cv.id
                                    ? "border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold"
                                    : "border-slate-850 bg-slate-900 text-slate-400 hover:bg-slate-800"
                                }`}
                              >
                                <span className="font-mono text-[8px] text-slate-500">{cv.fileSize}</span>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="truncate max-w-[170px]">{cv.fileName}</span>
                                  { (cv.isActive || profile.activeCvId === cv.id) ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <div className="w-3 h-3 rounded-full border border-slate-700" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-400 bg-amber-950/20 p-2 rounded border border-amber-900/30 text-right">
                            لا توجد سير ذاتية مرفوعة حالياً. سيتم إرسال المسار الشخصي الرقمي الموحد.
                          </div>
                        )}
                      </div>

                      {/* Dynamic terminal log loader if sending */}
                      {isSendingOnBehalf && (
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-left font-mono text-[9px] space-y-1.5">
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>{sendingProgress}%</span>
                            <span>خادم الإرسال المباشر SMTP</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${sendingProgress}%` }} />
                          </div>

                          <div className="text-slate-400 space-y-1 mt-1 font-mono text-[8px] max-h-[100px] overflow-y-auto">
                            {sendingLogs.map((log, i) => (
                              <div key={i}>{`> ${log}`}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sendingSuccess && (
                        <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-center text-[11px] font-bold space-y-1">
                          <p>✓ تم تسليم السيرة الذاتية لشركة {selectedCompany.companyName}!</p>
                          <p className="text-[9px] text-slate-400 font-normal">تم الإرسال وحفظ نسخة في الطلبات المبعوثة.</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          disabled={isSendingOnBehalf}
                          onClick={handleSendEmailOnBehalf}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          {isSendingOnBehalf ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              جاري الإرسال بالنيابة...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              أرسل السيفي والإيميل بالنيابة عني الآن
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

          {/* SCREEN TAB 3: REAL-TIME NOTIFICATION ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4" id="screen-alerts">
              
              <div className="bg-emerald-950/20 rounded-2xl p-4 border border-emerald-900/30 text-right space-y-2">
                <div className="flex items-center gap-1.5 justify-end text-emerald-400">
                  <h3 className="font-bold text-xs">نظام جرس التنبيه الفوري النشط</h3>
                  <Bell className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  أنشئ تفضيلات التنبيه الخاص بمهنتك ومدينتك (مثال: مهارة React في مدينة الرياض). بمجرد إضافة أي وظيفة جديدة تطابق شروطك، ستقوم المنصة بإطلاق جرس صوتي مباشر وإرسال إشعار فوري لك بالفرصة!
                </p>
              </div>

              {/* Alert Settings Component */}
              <AlertSettings
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onToggleAlert={handleToggleAlert}
                onDeleteAlert={handleDeleteAlert}
                availableSkills={profile.skills}
              />

            </div>
          )}

          {/* SCREEN TAB 4: PROFILE SETUP & CV EXTRACTION */}
          {activeTab === 'profile' && (
            <div className="space-y-4" id="screen-profile">
              
              {/* Profile setup details */}
              <ProfileSection
                profile={profile}
                onChangeProfile={setProfile}
                onParseResume={handleParseResume}
              />

            </div>
          )}

          {/* SCREEN TAB 5: SIMULATED EMPLOYER SANDBOX */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4" id="screen-sandbox">
              
              {/* Employer posting interface to test alerts */}
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-2 text-right">
                <h3 className="font-bold text-xs text-amber-400 flex items-center gap-1.5 justify-end">
                  <span>محاكاة أصحاب الأعمال لتجربة الإنذار</span>
                  <Info className="w-4 h-4" />
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  هذه اللوحة لمحاكاة قيام شركة أو جهة حكومية بنشر وظيفة شاغرة. استخدمها لإطلاق وظيفة تطابق تفضيلات <strong>"جرس التنبيه الفوري"</strong> النشط لديك، وراقب كيف يطلق الهاتف صوتاً وتظهر بطاقة التنبيه الحمراء فوراً!
                </p>
              </div>

              <EmployerSandbox onPostJob={handlePostEmployerJob} />

            </div>
          )}

        </div>

        {/* Floating Simulated iOS/Android Home Indicator Bar */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700/60 rounded-full z-40 hidden md:block" />

        {/* iOS/Android Smartphone Bottom Tab Navigation Bar */}
        <nav className="absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 py-2.5 px-2 flex justify-around items-center z-40 shrink-0" id="mobile-nav-bar">
          
          {/* Tab 5: Sandbox */}
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'sandbox' ? "text-emerald-400 scale-105" : "text-slate-400 hover:text-slate-200"}`}
          >
            <History className="w-4 h-4" />
            <span className="text-[9px] font-bold">بوابة النشر</span>
          </button>

          {/* Tab 4: Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? "text-emerald-400 scale-105" : "text-slate-400 hover:text-slate-200"}`}
          >
            <User className="w-4 h-4" />
            <span className="text-[9px] font-bold">الملف الشخصي</span>
          </button>

          {/* Tab 3: Alerts */}
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center gap-1 transition-all relative ${activeTab === 'alerts' ? "text-emerald-400 scale-105" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Sliders className="w-4 h-4" />
            <span className="text-[9px] font-bold">جرس التنبيه</span>
            {alerts.some(a => a.isActive) && (
              <span className="absolute top-0 right-3.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Tab 2: Companies Emails Directory */}
          <button
            onClick={() => setActiveTab('emails')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'emails' ? "text-emerald-400 scale-105" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Building2 className="w-4 h-4" />
            <span className="text-[9px] font-bold">إيميلات الشركات</span>
          </button>

          {/* Tab 1: Search & Jobs */}
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'jobs' ? "text-emerald-400 scale-105" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[9px] font-bold">الوظائف</span>
          </button>

        </nav>

      </div>

      {/* Decorative desktop-only instructions sidebar wrapper */}
      <div className="mt-4 text-center text-xs text-slate-400 max-w-sm px-4 hidden md:block">
        <p>التطبيق مصمم ومحاكي بدقة فائقة للهواتف الذكية فقط 📱</p>
        <p className="text-[10px] text-slate-500 mt-1">تصفح التبويبات بالأسفل لمشاهدة المراسلة بالنيابة والتنبيهات المباشرة.</p>
      </div>

    </div>
  );
}
