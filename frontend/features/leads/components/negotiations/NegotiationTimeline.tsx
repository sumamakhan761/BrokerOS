import React, { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp, Handshake } from 'lucide-react';
import { NegotiationNote, parseNegotiationContent } from '@/features/leads/types/negotiation-types';

interface NegotiationTimelineProps {
  negotiationNotes: any[];
}

export function NegotiationTimeline({ negotiationNotes }: NegotiationTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (negotiationNotes.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p className="text-sm font-medium text-gray-600">No negotiation rounds yet</p>
        <p className="text-xs text-gray-500 mt-1">Click "Add Round" to log the first negotiation</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {negotiationNotes.map((note, index) => {
        // Map database fields to the UI expected variables
        const data = {
          askingPrice: note.askingPrice,
          offeredPrice: note.offeredPrice,
          objections: note.customerObjections,
          strategy: note.managerSuggestion,
          title: note.negotiationNotes,
          nextStep: note.nextActionPlan,
        };
        const isExpanded = expandedId === note.id;
        const gap = data.askingPrice && data.offeredPrice
          ? Number(data.askingPrice) - Number(data.offeredPrice)
          : null;

        return (
          <div key={note.id} className="flex gap-3">
            {/* Content */}
            <div className="flex-1 border border-gray-100 rounded-2xl overflow-hidden mb-1 shadow-sm transition-all">
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/80 transition-colors"
                onClick={() => toggleExpand(note.id)}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100/50">
                    <Handshake className="w-4.5 h-4.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{data.title || 'Round'}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                      {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
                  {(data.askingPrice || data.offeredPrice) && (
                    <div className="flex gap-4 mb-3">
                      {data.askingPrice && (
                        <div className="bg-blue-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-blue-600 font-medium">Our Price</p>
                          <p className="text-sm font-bold text-blue-800">₹{Number(data.askingPrice).toLocaleString('en-IN')}</p>
                        </div>
                      )}
                      {data.offeredPrice && (
                        <div className="bg-orange-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-orange-600 font-medium">Customer Offered</p>
                          <p className="text-sm font-bold text-orange-800">₹{Number(data.offeredPrice).toLocaleString('en-IN')}</p>
                        </div>
                      )}
                      {gap !== null && gap > 0 && (
                        <div className="bg-red-50/80 rounded-xl p-3 text-center border border-red-100/50">
                          <p className="text-xs text-red-600 font-medium mb-1">Gap</p>
                          <p className="text-[15px] font-bold text-red-900">₹{gap.toLocaleString('en-IN')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {data.objections && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:border-red-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Customer Objections</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.objections}</p>
                      </div>
                    )}
                    
                    {data.strategy && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:border-violet-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Our Strategy</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.strategy}</p>
                      </div>
                    )}
                    
                    {data.nextStep && (
                      <div className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:border-green-100 transition-colors">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Next Step</h4>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{data.nextStep}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
