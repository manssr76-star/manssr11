import React, { useState } from "react";
import { Bell, Plus, Trash2, ShieldAlert, Check } from "lucide-react";
import { JobAlert } from "../types";

interface AlertSettingsProps {
  alerts: JobAlert[];
  onAddAlert: (alert: Omit<JobAlert, "id" | "isActive">) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  availableSkills: string[];
}

export default function AlertSettings({
  alerts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  availableSkills = [],
}: AlertSettingsProps) {
  const [region, setRegion] = useState("");
  const [experience, setExperience] = useState<'Junior' | 'Mid' | 'Senior' | 'All'>("All");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!region.trim()) return;

    onAddAlert({
      region: region.trim(),
      skills: selectedSkills,
      experience,
    });

    // Reset inputs
    setRegion("");
    setSelectedSkills([]);
    setExperience("All");
  };

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80" id="alert-settings-card">
      <div className="flex items-center gap-2 mb-3.5 justify-end">
        <div className="text-right">
          <h3 className="font-extrabold text-slate-100 text-xs">التنبيهات الفورية الفعالة</h3>
          <p className="text-[9px] text-slate-400">احصل على إشعارات فورية عند توفر وظيفة تناسب مهاراتك</p>
        </div>
        <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
          <Bell className="w-4 h-4" />
        </div>
      </div>

      {/* Alert Creator Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4 border-b border-slate-800/60 pb-4" id="create-alert-form">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">المنطقة أو المدينة</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="مثال: الرياض"
              required
              className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
              id="alert-region-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">مستوى الخبرة</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value as any)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
              id="alert-experience-select"
            >
              <option value="All">الكل (All)</option>
              <option value="Junior">مبتدئ (Junior)</option>
              <option value="Mid">متوسط (Mid)</option>
              <option value="Senior">خبير (Senior)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-slate-400 mb-1 text-right">المهارات المطلوبة بالتنبيه</label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-slate-800 transition"
              id="add-alert-skill-btn"
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
              placeholder="مثال: React, Node.js"
              className="flex-1 text-xs px-2.5 py-1.5 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
              id="alert-skill-input"
            />
          </div>

          {/* Render selected skills for alerts */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 justify-end">
              {selectedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-medium border border-emerald-900/50"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white focus:outline-none"
                  >
                    ×
                  </button>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
          id="submit-alert-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          تفعيل جرس التنبيه الفوري
        </button>
      </form>

      {/* Active Alerts List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-slate-500" id="no-alerts-placeholder">
            <ShieldAlert className="w-6 h-6 mx-auto text-slate-600 mb-1" />
            <p className="text-[9px]">لا توجد تناليبيهات نشطة مضافة حالياً</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between ${
                alert.isActive ? "border-slate-800 bg-slate-900/40" : "border-slate-800 bg-slate-900/10 opacity-50"
              }`}
              id={`alert-item-${alert.id}`}
            >
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onDeleteAlert(alert.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition"
                  id={`delete-alert-btn-${alert.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Switch */}
                <button
                  type="button"
                  onClick={() => onToggleAlert(alert.id)}
                  className={`w-7 h-4 rounded-full p-0.5 transition-colors focus:outline-none ${
                    alert.isActive ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                  id={`toggle-alert-btn-${alert.id}`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                      alert.isActive ? "-translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 min-w-0 pr-2 text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[8px] font-medium">
                    {alert.experience === "All" ? "الكل" : alert.experience}
                  </span>
                  <span className="font-bold text-xs text-slate-100">{alert.region}</span>
                </div>
                {alert.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1 justify-end">
                    {alert.skills.map((s) => (
                      <span
                        key={s}
                        className="px-1 rounded bg-slate-950 text-slate-400 text-[8px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-slate-500 mt-0.5 text-right">جميع مهارات المدينة</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
