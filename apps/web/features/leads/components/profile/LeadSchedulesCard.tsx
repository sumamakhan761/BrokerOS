import React from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar, Clock } from 'lucide-react';

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
  hideSiteVisits
}: LeadSchedulesCardProps) {
  return (
    <Card className="p-0 flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900">Schedules</h3>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-6 bg-gray-50/30 overflow-hidden">

        {/* Site Visits Section */}
        {!hideSiteVisits && (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-3 shrink-0">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Site Visits</h4>
              <button onClick={() => openSiteVisitModal && openSiteVisitModal()} className="text-blue-600 hover:text-blue-700 text-xs font-medium">+ Add</button>
            </div>
            <div className="space-y-3 max-h-[145px] overflow-y-auto pr-2 custom-scrollbar">
              {siteVisits.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No site visits scheduled.</p>
              ) : (
                siteVisits.map(sv => (
                  <div key={sv.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group shrink-0 flex justify-between items-start">
                    <div onClick={() => openSiteVisitModal && openSiteVisitModal(sv)} className={openSiteVisitModal ? 'cursor-pointer flex-1' : 'flex-1'}>
                      <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                        {sv.project?.name || 'Unknown Project'}
                        {sv.destinationUrl && (
                          <a href={sv.destinationUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-500 hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          </a>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(sv.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      {sv.arrivedAt && (
                        <div className="mt-1">
                          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            Arrived: {new Date(sv.arrivedAt).toLocaleTimeString([], { timeStyle: 'short' })}
                          </p>
                          {sv.arriveLatitude && sv.arriveLongitude && (
                            <a href={`https://maps.google.com/?q=${sv.arriveLatitude},${sv.arriveLongitude}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-emerald-500 hover:text-emerald-700 hover:underline mt-0.5 ml-4 block">
                              View coordinates on Map
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    {onMarkCompleted && (!sv.completedAt && sv.status !== 'COMPLETED') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onMarkCompleted(sv.id); }}
                        className="ml-2 px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                        title="Mark site visit as completed"
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
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Follow-ups</h4>
            <button onClick={() => openFollowUpModal && openFollowUpModal()} className="text-blue-600 hover:text-blue-700 text-xs font-medium">+ Add</button>
          </div>
          <div className="space-y-3 max-h-[145px] overflow-y-auto pr-2 custom-scrollbar">
            {followUps?.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No follow-ups scheduled.</p>
            ) : (
              followUps?.map(fu => (
                <div key={fu.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all shrink-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => openFollowUpModal && openFollowUpModal(fu)} style={{ cursor: openFollowUpModal ? 'pointer' : 'default' }}>
                      <p className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors">{fu.type || 'Follow-up'}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(fu.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    {handleConfirmFollowUp && (fu.status === 'SCHEDULED' || fu.status === 'RESCHEDULED' || fu.status === 'MISSED') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConfirmFollowUp(fu.id); }}
                        className="ml-2 px-2 py-1 text-xs font-semibold rounded-md bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors shrink-0"
                        title="Confirm follow-up (requires call record today)"
                      >
                        ✓ Confirm
                      </button>
                    )}
                    {fu.status === 'COMPLETED' && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-500 border border-gray-200 shrink-0">Done ✓</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Card>
  );
}
