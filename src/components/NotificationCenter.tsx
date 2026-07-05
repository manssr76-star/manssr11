import React from "react";
import { Bell, X, CheckCircle2, Sparkles, Briefcase } from "lucide-react";
import { SystemNotification } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSelectJob: (jobId: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  onSelectJob,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" id="notification-center-container">
      {/* Bell Trigger Button */}
      <button
        id="bell-trigger-button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-800/80 rounded-full transition-all duration-200 focus:outline-none"
        title="التنبيهات الفورية"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            id="unread-badge"
            className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-1 ring-slate-950 animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-72 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 z-50 overflow-hidden text-right"
              id="notifications-panel"
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearAll}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                    >
                      مسح الكل
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 hover:text-white transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-200 text-xs">التنبيهات الفورية</h3>
                  <Bell className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center" id="no-notifications-placeholder">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 mb-2 border border-slate-800">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] text-slate-400">لا توجد تنبيهات حالياً</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">ستظهر هنا المطابقات الفورية فور نشرها</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkAsRead(n.id);
                        if (n.jobId) onSelectJob(n.jobId);
                        setIsOpen(false);
                      }}
                      className={`p-3 text-right hover:bg-slate-800/40 transition cursor-pointer flex gap-2.5 items-start ${
                        !n.read ? "bg-emerald-950/20" : ""
                      }`}
                      id={`notification-item-${n.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[8px] text-slate-500 whitespace-nowrap pt-0.5">
                            {new Date(n.createdAt).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <p className="font-bold text-[11px] text-slate-200 line-clamp-1">{n.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        {!n.read && (
                          <span className="inline-block mt-1 h-1 w-1 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      
                      <div className="mt-0.5 flex-shrink-0">
                        {n.jobId ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-900/40">
                            <Briefcase className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-900/40">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
