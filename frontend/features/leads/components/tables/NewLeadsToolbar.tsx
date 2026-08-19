import React from 'react';
import { Upload, Users, Shuffle, CheckSquare } from 'lucide-react';
import Papa from 'papaparse';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface NewLeadsToolbarProps {
  selectedLeadIds: Set<string>;
  subordinates: any[];
  onAssign: (leadIds: string[], targetUserId?: string, roundRobin?: boolean) => void;
  onUploadSuccess: () => void;
}

export function NewLeadsToolbar({
  selectedLeadIds,
  subordinates,
  onAssign,
  onUploadSuccess,
}: NewLeadsToolbarProps) {
  const [bulkAssignTarget, setBulkAssignTarget] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';
          const res = await fetch(`${baseUrl}/api/leads/bulk-create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results.data.map((row: any) => ({
              firstName: row['First Name'] || row['FirstName'] || row['Name'],
              lastName: row['Last Name'] || row['LastName'],
              phone: row['Phone'] || row['Mobile'],
              email: row['Email'],
              source: row['Source'] || row['Source Name'],
              project: row['Project'] || row['Interested Project'],
              preferredLocation: row['Preferred Location'] || row['Location'],
              budget: row['Budget'],
              requirements: row['Requirements'],
            }))),
          });

          if (res.ok) {
            onUploadSuccess();
          } else {
            toast.error('Failed to upload leads.');
          }
        } catch (err) {
          console.error(err);
          toast.error('Error uploading leads.');
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
    });
  };

  const numSelected = selectedLeadIds.size;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Left: selection actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {numSelected > 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--brand-50)',
            border: '1px solid var(--brand-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px 14px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--brand-700)',
            }}>
              <CheckSquare size={14} /> {numSelected} selected
            </span>

            {/* Select employee */}
            <div style={{ position: 'relative' }}>
              <Users size={12} style={{
                position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <select
                value={bulkAssignTarget}
                onChange={e => setBulkAssignTarget(e.target.value)}
                style={{
                  height: 32,
                  paddingLeft: 26,
                  paddingRight: 10,
                  appearance: 'none',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  minWidth: 140,
                }}
              >
                <option value="">Select employee…</option>
                {subordinates.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name || sub.username}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onAssign(Array.from(selectedLeadIds), bulkAssignTarget)}
              disabled={!bulkAssignTarget}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-600)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: bulkAssignTarget ? 'pointer' : 'not-allowed',
                opacity: bulkAssignTarget ? 1 : 0.5,
                transition: 'opacity var(--duration-fast)',
              }}
            >
              Assign
            </button>

            <div style={{ width: 1, height: 20, background: 'var(--brand-200)' }} />

            <button
              onClick={() => onAssign(Array.from(selectedLeadIds), undefined, true)}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-700)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Shuffle size={12} /> Round Robin
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)' }}>
            Select leads to bulk assign
          </span>
        )}
      </div>

      {/* Right: upload */}
      <div>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            height: 38,
            padding: '0 18px',
            borderRadius: 'var(--radius-lg)',
            background: uploading ? 'var(--bg-subtle)' : 'var(--brand-600)',
            color: uploading ? 'var(--text-muted)' : '#fff',
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: uploading ? 'wait' : 'pointer',
            boxShadow: uploading ? 'none' : 'var(--shadow-brand)',
            transition: 'all var(--duration-base) var(--ease-out-expo)',
          }}
        >
          <Upload size={14} />
          {uploading ? 'Uploading…' : 'Upload CSV'}
        </button>
      </div>
    </div>
  );
}
