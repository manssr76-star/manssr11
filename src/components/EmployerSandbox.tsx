import React, { useState } from "react";
import { Briefcase, Plus, CheckCircle, HelpCircle } from "lucide-react";

interface EmployerSandboxProps {
  onPostJob: (job: any) => Promise<boolean>;
}

export default function EmployerSandbox({ onPostJob }: EmployerSandboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [experience, setExperience] = useState<'Junior' | 'Mid' | 'Senior' | 'All'>("All");
  const [skills, setSkills] = useState("");
  const [salary, setSalary] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !region || !contactEmail) return;

    setIsSubmitting(true);
    const success = await onPostJob({
      title,
      company,
      region,
      experience,
      skills: skills,
      salary,
      contactEmail,
      description: description || `مطلوب ${title} للعمل الفوري في شركة ${company} بمدينة ${region}. نرحب بالكفاءات المميزة.`,
    });

    setIsSubmitting(false);
    if (success) {
      setIsSuccess(true);
      // Reset form
      setTitle("");
      setCompany("");
      setRegion("");
      setSkills("");
      setSalary("");
      setContactEmail("");
      setDescription("");

      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden" id="employer-sandbox-card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-900/40 transition focus:outline-none"
        id="toggle-sandbox-btn"
      >
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-900/40">
          {isOpen ? "إخفاء اللوحة" : "عرض النموذج"}
        </span>

        <div className="flex items-center gap-2 justify-end">
          <div className="text-right">
            <h3 className="font-extrabold text-slate-100 text-xs">بوابة أصحاب الأعمال (Sandbox)</h3>
            <p className="text-[9px] text-slate-400">انشر وظيفة لاختبار جرس التنبيه الفوري</p>
          </div>
          <Briefcase className="w-4 h-4 text-emerald-400" />
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40" id="sandbox-form-container">
          <p className="text-[9px] text-slate-300 mb-3.5 leading-relaxed text-right bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/30">
            <strong>تلميح الاختبار:</strong> قم بوضع مهارات ومدينة في الوظيفة الجديدة تطابق نفس المهارات والمدينة التي قمت بتفعيلها في <strong>"تفضيلات جرس التنبيه"</strong>. بمجرد ضغط زر "نشر الوظيفة"، ستقوم المنصة بإطلاق جرس صوتي وإشعار فوري لمطابقة السيفي!
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 text-right" id="sandbox-post-job-form">
            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: Developer React"
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="sandbox-job-title"
                />
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">اسم المنشأة/الشركة</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="مثال: شركة سابك"
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="sandbox-company-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">المنطقة أو المدينة</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="الرياض"
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="sandbox-region"
                />
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">مستوى الخبرة المطلوبة</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="sandbox-experience"
                >
                  <option value="All">الكل (All)</option>
                  <option value="Junior">مبتدئ (Junior)</option>
                  <option value="Mid">متوسط (Mid)</option>
                  <option value="Senior">خبير (Senior)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">الراتب المتوقع</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="مثال: 12,000 ريال"
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                  id="sandbox-salary"
                />
              </div>

              <div>
                <label className="block text-[9px] font-medium text-slate-400 mb-1">بريد التقديمات</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="careers@company.com"
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left font-mono"
                  id="sandbox-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-medium text-slate-400 mb-1">المهارات المطلوبة (تفصل بفاصلة)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, CSS"
                required
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-left"
                id="sandbox-skills"
              />
            </div>

            <div>
              <label className="block text-[9px] font-medium text-slate-400 mb-1">الوصف المهني والتفاصيل</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل الاختصاص والمهام المطلوبة..."
                className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right font-medium"
                id="sandbox-description"
              />
            </div>

            <div className="flex items-center justify-between pt-1.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                id="sandbox-submit-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                {isSubmitting ? "جاري النشر..." : "نشر وإطلاق فرصة التنبيه"}
              </button>
            </div>

            {isSuccess && (
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 justify-center bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/30">
                <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                تم نشر الفرصة بنجاح ومسح أجهزة الإنذار الفورية!
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
