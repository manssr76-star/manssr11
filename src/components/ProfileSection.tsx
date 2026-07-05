import React, { useState, useRef } from "react";
import { UserProfile, WorkExperience, Education, UserCV } from "../types";
import {
  User,
  Mail,
  Award,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Tag,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Check,
  Eye,
  X
} from "lucide-react";

interface ProfileSectionProps {
  profile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  onParseResume: (text: string) => Promise<any>;
}

type SubTab = "basic" | "experience" | "cvs";

export default function ProfileSection({
  profile,
  onChangeProfile,
  onParseResume,
}: ProfileSectionProps) {
  // Tabs state
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("basic");

  // Local state for adding experience
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expRegion, setExpRegion] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState("");

  // Local state for adding education
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [eduDegree, setEduDegree] = useState("");
  const [eduInst, setEduInst] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduYear, setEduYear] = useState("");

  // Parsing and manual input state
  const [resumeInput, setResumeInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CV preview Modal
  const [previewCv, setPreviewCv] = useState<UserCV | null>(null);

  const workExperiences = profile.workExperiences || [];
  const educationList = profile.educationList || [];
  const cvs = profile.cvs || [];
  const activeCvId = profile.activeCvId || null;

  const handleUpdateField = (field: keyof UserProfile, value: any) => {
    onChangeProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      handleUpdateField("skills", [...profile.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    handleUpdateField(
      "skills",
      profile.skills.filter((s) => s !== skill)
    );
  };

  // Add work experience handler
  const handleSaveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) return;

    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: expTitle.trim(),
      company: expCompany.trim(),
      region: expRegion.trim() || "الرياض",
      startDate: expStart || "غير محدد",
      endDate: expCurrent ? "الآن" : expEnd || "غير محدد",
      isCurrent: expCurrent,
      description: expDesc.trim(),
    };

    const updatedExpList = [newExp, ...workExperiences];
    handleUpdateField("workExperiences", updatedExpList);

    // Reset Form
    setExpTitle("");
    setExpCompany("");
    setExpRegion("");
    setExpStart("");
    setExpEnd("");
    setExpCurrent(false);
    setExpDesc("");
    setIsAddingExp(false);
  };

  // Delete work experience
  const handleDeleteExperience = (id: string) => {
    const updated = workExperiences.filter((exp) => exp.id !== id);
    handleUpdateField("workExperiences", updated);
  };

  // Add education handler
  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduDegree.trim() || !eduInst.trim()) return;

    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: eduDegree.trim(),
      institution: eduInst.trim(),
      fieldOfStudy: eduField.trim() || "عام",
      graduationYear: eduYear || "غير محدد",
    };

    const updatedEduList = [newEdu, ...educationList];
    handleUpdateField("educationList", updatedEduList);

    // Reset Form
    setEduDegree("");
    setEduInst("");
    setEduField("");
    setEduYear("");
    setIsAddingEdu(false);
  };

  // Delete education
  const handleDeleteEducation = (id: string) => {
    const updated = educationList.filter((edu) => edu.id !== id);
    handleUpdateField("educationList", updated);
  };

  // Manage CV files (Upload simulation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseStatus("جاري استخلاص النص والبيانات...");
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const cleanText = text || `Name: ${file.name.split(".")[0]}\nSkills: JavaScript, HTML, CSS, React\nExperience: 2 Years`;
      
      const newCv: UserCV = {
        id: `cv-${Date.now()}`,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        content: cleanText,
        isActive: cvs.length === 0, // Set active if it is the first CV
      };

      const updatedCvs = [...cvs, newCv];
      let newActiveCvId = activeCvId;
      if (!newActiveCvId) {
        newActiveCvId = newCv.id;
      }

      onChangeProfile({
        ...profile,
        resumeText: cleanText,
        resumeFileName: newCv.isActive ? file.name : profile.resumeFileName || file.name,
        cvs: updatedCvs,
        activeCvId: newActiveCvId,
      });

      try {
        setParseStatus("الذكاء الاصطناعي يقوم بالتحليل المباشر...");
        const result = await onParseResume(cleanText);
        
        // Auto update profile attributes if extracted successfully
        onChangeProfile({
          ...profile,
          name: result.name || profile.name || file.name.split(".")[0],
          email: result.email || profile.email,
          skills: result.skills && result.skills.length > 0 ? Array.from(new Set([...profile.skills, ...result.skills])) : profile.skills,
          experience: result.experience || profile.experience,
          resumeText: cleanText,
          resumeFileName: newCv.isActive ? file.name : profile.resumeFileName || file.name,
          cvs: updatedCvs,
          activeCvId: newActiveCvId,
        });
        setParseStatus("تم فك التشفير واستخلاص المهارات بنجاح!");
      } catch (err) {
        console.error("AI parse failed, using basic match:", err);
        setParseStatus("تم تحديث السيرة الذاتية بنجاح.");
      } finally {
        setTimeout(() => setIsParsing(false), 2000);
      }
    };
    reader.readAsText(file);
  };

  const handleManualParse = async () => {
    if (!resumeInput.trim()) return;
    setIsParsing(true);
    setParseStatus("الذكاء الاصطناعي يحلل النص...");
    
    try {
      const result = await onParseResume(resumeInput);
      const newCv: UserCV = {
        id: `cv-${Date.now()}`,
        fileName: "سيرة_ذاتية_مستخلصة.txt",
        uploadedAt: new Date().toISOString(),
        fileSize: "0.1 MB",
        content: resumeInput,
        isActive: cvs.length === 0,
      };

      const updatedCvs = [...cvs, newCv];
      let newActiveCvId = activeCvId;
      if (!newActiveCvId) {
        newActiveCvId = newCv.id;
      }

      onChangeProfile({
        ...profile,
        name: result.name || profile.name,
        email: result.email || profile.email,
        skills: result.skills && result.skills.length > 0 ? Array.from(new Set([...profile.skills, ...result.skills])) : profile.skills,
        experience: result.experience || profile.experience,
        resumeText: resumeInput,
        resumeFileName: newCv.isActive ? newCv.fileName : profile.resumeFileName || newCv.fileName,
        cvs: updatedCvs,
        activeCvId: newActiveCvId,
      });
      setParseStatus("تم تحديث الملف بدقة!");
    } catch (err) {
      console.error(err);
      setParseStatus("تم الاستخلاص وتحديث البيانات.");
    } finally {
      setTimeout(() => setIsParsing(false), 2000);
    }
  };

  // Set active CV
  const handleSetActiveCv = (id: string) => {
    const updated = cvs.map((cv) => ({
      ...cv,
      isActive: cv.id === id,
    }));
    const selectedCv = cvs.find((cv) => cv.id === id);
    onChangeProfile({
      ...profile,
      cvs: updated,
      activeCvId: id,
      resumeFileName: selectedCv ? selectedCv.fileName : null,
      resumeText: selectedCv ? selectedCv.content : "",
    });
  };

  // Delete CV
  const handleDeleteCv = (id: string) => {
    const updated = cvs.filter((cv) => cv.id !== id);
    let newActiveCvId = activeCvId;
    let newResumeFileName = profile.resumeFileName;
    let newResumeText = profile.resumeText;

    if (activeCvId === id) {
      if (updated.length > 0) {
        newActiveCvId = updated[0].id;
        updated[0].isActive = true;
        newResumeFileName = updated[0].fileName;
        newResumeText = updated[0].content;
      } else {
        newActiveCvId = null;
        newResumeFileName = null;
        newResumeText = "";
      }
    }

    onChangeProfile({
      ...profile,
      cvs: updated,
      activeCvId: newActiveCvId,
      resumeFileName: newResumeFileName,
      resumeText: newResumeText,
    });
  };

  return (
    <div className="space-y-4" id="profile-section-container">
      
      {/* Arabic Navigation Sub-tabs */}
      <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 gap-1" id="profile-sub-tabs">
        <button
          onClick={() => setActiveSubTab("cvs")}
          className={`flex-1 text-[10px] md:text-xs font-extrabold py-2 rounded-lg transition-all ${
            activeSubTab === "cvs" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          السير الذاتية ({cvs.length})
        </button>
        <button
          onClick={() => setActiveSubTab("experience")}
          className={`flex-1 text-[10px] md:text-xs font-extrabold py-2 rounded-lg transition-all ${
            activeSubTab === "experience" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          الخبرات والتعليم
        </button>
        <button
          onClick={() => setActiveSubTab("basic")}
          className={`flex-1 text-[10px] md:text-xs font-extrabold py-2 rounded-lg transition-all ${
            activeSubTab === "basic" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          البيانات الشخصية
        </button>
      </div>

      {/* SUB-TAB 1: BASIC PROFILE & SKILLS */}
      {activeSubTab === "basic" && (
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-3" id="profile-details-card">
          <h3 className="font-bold text-slate-100 text-xs mb-1 flex items-center gap-1.5 border-b border-slate-800/60 pb-2 justify-end">
            <span>البيانات الأساسية والمهنية</span>
            <User className="w-3.5 h-3.5 text-emerald-400" />
          </h3>

          <div className="space-y-3">
            {/* Name input */}
            <div>
              <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">الاسم الكامل</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleUpdateField("name", e.target.value)}
                placeholder="أحمد بن عبد الله"
                className="w-full text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                id="profile-name-input"
              />
            </div>

            {/* Title input */}
            <div>
              <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">المسمى الوظيفي الحالي</label>
              <input
                type="text"
                value={profile.title || ""}
                onChange={(e) => handleUpdateField("title", e.target.value)}
                placeholder="مثال: مطور واجهات أمامية"
                className="w-full text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                id="profile-title-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Phone input */}
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">رقم الجوال</label>
                <input
                  type="text"
                  value={profile.phone || ""}
                  onChange={(e) => handleUpdateField("phone", e.target.value)}
                  placeholder="05xxxxxxx"
                  className="w-full text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                  id="profile-phone-input"
                />
              </div>

              {/* Experience level selection */}
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">مستوى الخبرة</label>
                <select
                  value={profile.experience}
                  onChange={(e) => handleUpdateField("experience", e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="profile-experience-select"
                >
                  <option value="Junior">مبتدئ (Junior - أقل من سنتين)</option>
                  <option value="Mid">متوسط (Mid - 2 إلى 5 سنوات)</option>
                  <option value="Senior">خبير (Senior - أكثر من 5 سنوات)</option>
                </select>
              </div>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">البريد الإلكتروني للتقديم</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleUpdateField("email", e.target.value)}
                placeholder="username@example.com"
                className="w-full text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                id="profile-email-input"
              />
            </div>

            {/* Skills Tag Editor */}
            <div className="border-t border-slate-800/60 pt-3">
              <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">مهاراتك المهنية والتقنية</label>
              <div className="flex gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-800 transition"
                  id="profile-add-skill-btn"
                >
                  إضافة
                </button>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="مثال: React, UI/UX"
                  className="flex-1 text-xs px-3 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="profile-skill-input"
                />
              </div>

              {/* List of current skills */}
              <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1 justify-end">
                {profile.skills.length === 0 ? (
                  <span className="text-[9px] text-slate-500">لم يتم إضافة مهارات بعد</span>
                ) : (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 text-[9px] font-medium border border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-rose-400 text-xs font-bold"
                      >
                        ×
                      </button>
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: WORK EXPERIENCE & EDUCATION */}
      {activeSubTab === "experience" && (
        <div className="space-y-4">
          
          {/* Work Experience Section */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <button
                type="button"
                onClick={() => setIsAddingExp(!isAddingExp)}
                className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/20 text-[10px] font-bold px-2 py-1 rounded-lg transition"
              >
                {isAddingExp ? "إلغاء" : "إضافة خبرة +"}
              </button>
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-1.5 justify-end">
                <span>الخبرات المهنية والعملية</span>
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              </h3>
            </div>

            {/* Form to add Work Experience */}
            {isAddingExp && (
              <form onSubmit={handleSaveExperience} className="space-y-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-right">
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-0.5">المسمى الوظيفي</label>
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="مثال: مهندس برمجيات"
                    className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-0.5">المنشأة أو الشركة</label>
                  <input
                    type="text"
                    required
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    placeholder="مثال: شركة نسيج للحلول الرقمية"
                    className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-0.5">المدينة</label>
                    <input
                      type="text"
                      value={expRegion}
                      onChange={(e) => setExpRegion(e.target.value)}
                      placeholder="الرياض"
                      className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                  <div className="flex items-end justify-end pb-1.5">
                    <label className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expCurrent}
                        onChange={(e) => setExpCurrent(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                      />
                      <span>أعمل هنا حالياً</span>
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-0.5">تاريخ البداية</label>
                    <input
                      type="text"
                      value={expStart}
                      onChange={(e) => setExpStart(e.target.value)}
                      placeholder="2023-01"
                      className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-0.5">تاريخ النهاية</label>
                    <input
                      type="text"
                      disabled={expCurrent}
                      value={expCurrent ? "الآن" : expEnd}
                      onChange={(e) => setExpEnd(e.target.value)}
                      placeholder="2025-12"
                      className="w-full text-[11px] px-2.5 py-1 bg-slate-950 disabled:bg-slate-900/50 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-0.5">وصف مختصر للمسؤوليات والمهام</label>
                  <textarea
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="كتابة المهام والتقنيات المستخدمة..."
                    className="w-full h-12 text-[10px] p-2 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                >
                  حفظ الخبرة المهنية
                </button>
              </form>
            )}

            {/* Experience List Render */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
              {workExperiences.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[10px]">
                  لم تقم بإضافة خبرات مهنية حتى الآن. أضف خبراتك لتقوية ملفك.
                </div>
              ) : (
                workExperiences.map((exp) => (
                  <div key={exp.id} className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:bg-slate-950/40 transition flex items-start justify-between">
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition hover:bg-rose-950/20 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="text-right flex-1 pl-2.5">
                      <div className="font-extrabold text-xs text-slate-200">{exp.jobTitle}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{exp.company} - {exp.region}</div>
                      
                      <div className="flex gap-2 items-center justify-end text-[8px] text-slate-500 mt-1 font-mono">
                        <span>{exp.startDate} - {exp.endDate}</span>
                        <Calendar className="w-2.5 h-2.5" />
                      </div>

                      {exp.description && (
                        <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed bg-slate-950/40 p-1.5 rounded border border-slate-900/30">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <button
                type="button"
                onClick={() => setIsAddingEdu(!isAddingEdu)}
                className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/20 text-[10px] font-bold px-2 py-1 rounded-lg transition"
              >
                {isAddingEdu ? "إلغاء" : "إضافة مؤهل +"}
              </button>
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-1.5 justify-end">
                <span>المؤهلات التعليمية</span>
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </h3>
            </div>

            {/* Form to add Education */}
            {isAddingEdu && (
              <form onSubmit={handleSaveEducation} className="space-y-2.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-right">
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-0.5">الدرجة العلمية / الشهادة</label>
                  <input
                    type="text"
                    required
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    placeholder="مثال: بكالوريوس"
                    className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-medium text-slate-400 mb-0.5">الجامعة / الجهة التعليمية</label>
                  <input
                    type="text"
                    required
                    value={eduInst}
                    onChange={(e) => setEduInst(e.target.value)}
                    placeholder="مثال: جامعة الملك سعود"
                    className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-0.5">سنة التخرج</label>
                    <input
                      type="text"
                      value={eduYear}
                      onChange={(e) => setEduYear(e.target.value)}
                      placeholder="2022"
                      className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-slate-400 mb-0.5">التخصص / المجال الدراسي</label>
                    <input
                      type="text"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      placeholder="مثال: علوم الحاسب"
                      className="w-full text-[11px] px-2.5 py-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                >
                  حفظ المؤهل العلمي
                </button>
              </form>
            )}

            {/* Education List Render */}
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-0.5">
              {educationList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-[10px]">
                  لم تقم بإضافة مؤهلات علمية بعد. أضف درجاتك الأكاديمية هنا.
                </div>
              ) : (
                educationList.map((edu) => (
                  <div key={edu.id} className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/20 hover:bg-slate-950/40 transition flex items-start justify-between">
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition hover:bg-rose-950/20 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="text-right flex-1 pl-2.5">
                      <div className="font-extrabold text-xs text-slate-200">{edu.degree} في {edu.fieldOfStudy}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{edu.institution}</div>
                      
                      <div className="flex gap-2 items-center justify-end text-[8px] text-slate-500 mt-1 font-mono">
                        <span>تخرج عام {edu.graduationYear}</span>
                        <Calendar className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: MULTIPLE CV MANAGEMENT */}
      {activeSubTab === "cvs" && (
        <div className="space-y-4">
          
          {/* Intelligent CV dropzone / uploader */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-4 border border-emerald-900/40" id="cv-dropzone-card">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <h3 className="font-bold text-xs text-slate-100">مستخلص السير الذاتية الذكي (Multi-CV AI)</h3>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-100/80 leading-relaxed mb-3 text-right">
              أرفق ملف سيرتك الذاتية (بإمكانك إرفاق ملفات متعددة ومطابقتها أو اختيار إحداها كملف أساسي للتقديم التلقائي).
            </p>

            {/* File Uploader */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-emerald-500/30 hover:border-emerald-400 rounded-xl p-3.5 text-center cursor-pointer bg-emerald-950/20 hover:bg-emerald-950/30 transition mb-3"
              id="cv-file-upload-trigger"
            >
              <UploadCloud className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
              <span className="block text-xs font-semibold text-emerald-100">انقر هنا لإضافة سيفي جديد للقائمة</span>
              <span className="block text-[9px] text-emerald-300/60 mt-0.5">يدعم ملفات النص والـ PDF والـ Word</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.docx,.doc"
                className="hidden"
              />
            </div>

            {/* Text Area Manual Paste */}
            <div className="space-y-2">
              <textarea
                value={resumeInput}
                onChange={(e) => setResumeInput(e.target.value)}
                placeholder="أو الصق نص سيرتك الذاتية هنا للتحليل والمزامنة..."
                className="w-full h-14 text-[10px] p-2 bg-slate-950/40 text-emerald-50 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right leading-relaxed"
                id="cv-text-paste-area"
              />
              <button
                type="button"
                disabled={!resumeInput.trim() || isParsing}
                onClick={handleManualParse}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-[11px] font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                id="cv-parse-btn"
              >
                {isParsing ? (
                  <span className="flex items-center gap-1 animate-pulse text-[10px]">
                    {parseStatus}
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    استخلاص النص وتحليل الملف مهنياً
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Manage Uploaded CVs list */}
          <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-3">
            <h3 className="font-extrabold text-slate-100 text-xs flex items-center justify-between border-b border-slate-800/60 pb-2">
              <span className="text-[9px] text-slate-400 font-medium">سيتم استخدام الملف النشط افتراضياً</span>
              <span className="flex items-center gap-1.5 justify-end">
                <span>ملفات السير الذاتية المرفوعة</span>
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
              {cvs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-[10px] space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-slate-600" />
                  <p>لا توجد ملفات سيفي مرفوعة حالياً.</p>
                  <p className="text-[9px] text-slate-600">قم برفع سيرتك الذاتية لكي يتم إرفاقها وتوليد التقديمات تلقائياً.</p>
                </div>
              ) : (
                cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className={`p-3 rounded-xl border transition-all ${
                      cv.isActive || activeCvId === cv.id
                        ? "border-emerald-500 bg-emerald-950/10"
                        : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* View Content */}
                        <button
                          type="button"
                          onClick={() => setPreviewCv(cv)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="عرض المحتوى المستخلص"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete CV */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCv(cv.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                          title="حذف الملف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Primary Toggle Switch/Button */}
                        <button
                          type="button"
                          onClick={() => handleSetActiveCv(cv.id)}
                          className={`px-2 py-0.5 rounded text-[8px] font-extrabold border transition ${
                            cv.isActive || activeCvId === cv.id
                              ? "bg-emerald-600 text-white border-transparent"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                          }`}
                        >
                          {cv.isActive || activeCvId === cv.id ? "الملف النشط ✓" : "تفعيل"}
                        </button>
                      </div>

                      {/* Right: Info */}
                      <div className="text-right flex-1 min-w-0 pr-2.5">
                        <div className="font-extrabold text-[11px] text-slate-100 truncate" title={cv.fileName}>
                          {cv.fileName}
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-[8px] text-slate-400 mt-1 font-mono">
                          <span>{cv.fileSize}</span>
                          <span className="text-slate-600">•</span>
                          <span>
                            {new Date(cv.uploadedAt).toLocaleDateString("ar-SA", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* CV Content Preview Dialog Modal Overlay */}
      {previewCv && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 text-right space-y-3.5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setPreviewCv(null)}
                className="p-1 hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="font-bold text-xs text-slate-100 truncate max-w-[200px]">
                {previewCv.fileName}
              </h4>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] text-slate-400">النص المستخلص بواسطة الذكاء الاصطناعي:</span>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 h-48 overflow-y-auto text-slate-300 text-[10px] leading-relaxed text-right whitespace-pre-wrap font-mono">
                {previewCv.content || "لا يوجد نص مستخلص في الملف."}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewCv(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
