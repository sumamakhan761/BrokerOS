import React from "react";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, MapPin, CheckCircle2, Navigation } from "lucide-react";

interface LeadSchedulesCardProps {
  siteVisits: any[];
  openSiteVisitModal?: (item?: any) => void;
  followUps?: any[];
  openFollowUpModal?: (item?: any) => void;
  handleConfirmFollowUp?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  hideSiteVisits?: boolean;
}

export function LeadSchedulesCard({
  siteVisits,
  openSiteVisitModal,
  followUps,
  openFollowUpModal,
  handleConfirmFollowUp,
  onMarkCompleted,
  hideSiteVisits,
}: LeadSchedulesCardProps) {
  return (
    <Card className="p-0 flex flex-col h-[520px] rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 px-5 border-b border-slate-100">
        <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-tight m-0 flex items-center gap-2">
          <Calendar size={15} className="text-[var(--brand-600)]" />
          <span>Scheduled Engagements</span>
        </h3>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-5 overflow-y-auto">
        {/* Site Visits Section */}
        {!hideSiteVisits && (
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                Site Visits
              </span>
              <button
                onClick={() => openSiteVisitModal && openSiteVisitModal()}
                className="text-[11px] font-bold text-[var(--brand-700)] hover:underline cursor-pointer"
              >
                + Schedule Visit
              </button>
            </div>

            <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
              {siteVisits.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic m-0">
                  No site visits scheduled yet.
                </p>
              ) : (
                siteVisits.map((sv) => (
                  <div
                    key={sv.id}
                    className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 hover:border-purple-200 transition-all flex justify-between items-start gap-3"
                  >
                    <div
                      onClick={() =>
                        openSiteVisitModal && openSiteVisitModal(sv)
                      }
                      className={
                        openSiteVisitModal ? "cursor-pointer flex-1 min-w-0" : "flex-1 min-w-0"
                      }
                    >
                      <p className="font-bold text-xs text-[var(--text-primary)] hover:text-[var(--brand-700)] transition-colors flex items-center gap-1.5 truncate m-0">
                        <span>{sv.project?.name || "Project Site"}</span>
                        {sv.destinationUrl && (
                          <a
                            href={sv.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-sky-600 hover:text-sky-700"
                            title="Open Google Maps link"
                          >
                            <Navigation size={12} />
                          </a>
                        )}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 tabular-nums m-0">
                        <Calendar size={11} />
                        <span>
                          {new Date(sv.scheduledDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>

                      {/* GPS Arrival Badge */}
                      {sv.arrivedAt && (
                        <div className="mt-1.5">
                          <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 m-0">
                            <CheckCircle2 size={11} />
                            <span>
                              Arrived:{" "}
                              {new Date(sv.arrivedAt).toLocaleTimeString([], {
                                timeStyle: "short",
                              })}
                            </span>
                          </p>
                          {sv.arriveLatitude && sv.arriveLongitude && (
                            <a
                              href={`https://maps.google.com/?q=${sv.arriveLatitude},${sv.arriveLongitude}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-emerald-600 hover:underline mt-0.5 ml-3.5 block tabular-nums"
                            >
                              GPS Coordinates Verified
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {onMarkCompleted &&
                      !sv.completedAt &&
                      sv.status !== "COMPLETED" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkCompleted(sv.id);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-[0.96] press-effect shrink-0 cursor-pointer"
                        >
                          ✓ Complete
                        </button>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Follow-ups Section */}
        <div className="flex flex-col space-y-2 pt-1 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              Follow-ups
            </span>
            <button
              onClick={() => openFollowUpModal && openFollowUpModal()}
              className="text-[11px] font-bold text-[var(--brand-700)] hover:underline cursor-pointer"
            >
              + Add Follow-up
            </button>
          </div>

          <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
            {followUps?.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic m-0">
                No follow-ups scheduled.
              </p>
            ) : (
              followUps?.map((fu) => (
                <div
                  key={fu.id}
                  className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80 hover:border-purple-200 transition-all flex justify-between items-start gap-3"
                >
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => openFollowUpModal && openFollowUpModal(fu)}
                    style={{ cursor: openFollowUpModal ? "pointer" : "default" }}
                  >
                    <p className="font-bold text-xs text-[var(--text-primary)] hover:text-[var(--brand-700)] transition-colors truncate m-0">
                      {fu.type || "Scheduled Call"}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 tabular-nums m-0">
                      <Clock size={11} />
                      <span>
                        {new Date(fu.scheduledDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  {handleConfirmFollowUp &&
                    (fu.status === "SCHEDULED" ||
                      fu.status === "RESCHEDULED" ||
                      fu.status === "MISSED") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmFollowUp(fu.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-[0.96] press-effect shrink-0 cursor-pointer"
                        title="Confirm follow-up"
                      >
                        ✓ Confirm
                      </button>
                    )}

                  {fu.status === "COMPLETED" && (
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      Done ✓
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
