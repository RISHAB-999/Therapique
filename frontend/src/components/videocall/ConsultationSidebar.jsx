import React, { useState } from 'react'
import { ChevronRight, FileText, Calendar, Clock, User, PlusCircle, Check } from 'lucide-react'

const ConsultationSidebar = ({
  isOpen,
  onClose,
  patientName = 'Rishab Negi',
  doctorName = 'Dr. Sarah Sharma',
  consultType = 'General OPD',
  apptTime = '10:00 AM',
  mrn = 'MH-24-1182',
  lastVisit = '14 Jul 2025',
  isDoctorView = false
}) => {
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState([])
  const [isEditingNote, setIsEditingNote] = useState(false)

  const handleSaveNote = () => {
    if (!notes.trim()) return
    setSavedNotes(prev => [...prev, { text: notes, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setNotes('')
    setIsEditingNote(false)
  }

  if (!isOpen) return null

  return (
    <aside className="w-full sm:w-80 md:w-84 shrink-0 h-full bg-[#121722]/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl sm:rounded-3xl p-4 flex flex-col justify-between overflow-y-auto shadow-2xl z-30 transition-all duration-300">
      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-100 tracking-wide">
              {isDoctorView ? 'Patient Details' : 'Session Details'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-[#181F2E] p-3 rounded-xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600 font-bold text-sm flex items-center justify-center text-white shadow-md">
            {patientName.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PT'}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4 className="font-bold text-sm text-white truncate">{patientName}</h4>
            <p className="text-xs text-slate-400">28 yrs · Male · O+</p>
          </div>
        </div>

        {/* 2x2 Grid Metadata */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="bg-[#181F2E]/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">CONSULT TYPE</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{consultType}</span>
          </div>
          <div className="bg-[#181F2E]/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">APPT. TIME</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate">{apptTime}</span>
          </div>
          <div className="bg-[#181F2E]/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">PATIENT MRN</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block font-mono">{mrn}</span>
          </div>
          <div className="bg-[#181F2E]/70 p-2.5 rounded-xl border border-slate-800/80">
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">LAST VISIT</span>
            <span className="text-xs font-semibold text-slate-200 mt-0.5 block">{lastVisit}</span>
          </div>
        </div>

        {/* Previous Visit Summary */}
        <div className="bg-[#181F2E]/60 p-3 rounded-xl border border-slate-800/80 space-y-1 text-left">
          <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">PREVIOUS VISIT</span>
          <p className="text-xs font-semibold text-teal-300">14 Jul 2025 — {doctorName}</p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            BP slightly elevated 130/85. Advised low-sodium diet. Follow-up consultation scheduled.
          </p>
        </div>

        {/* Live Session Notes */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">SESSION NOTES</span>
            <button
              onClick={() => setIsEditingNote(!isEditingNote)}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isEditingNote ? 'Cancel' : 'Add Note'}</span>
            </button>
          </div>

          {isEditingNote ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Document clinical observations or recommendations..."
                className="w-full h-20 bg-[#0B0F17] border border-teal-500/40 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
              />
              <button
                onClick={handleSaveNote}
                className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          ) : savedNotes.length > 0 ? (
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {savedNotes.map((n, i) => (
                <div key={i} className="bg-[#181F2E] p-2 rounded-lg text-xs text-slate-300 border border-slate-800">
                  <span className="text-[10px] text-teal-400 font-mono block">{n.time}</span>
                  {n.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#181F2E]/40 p-3 rounded-xl border border-slate-800/60 text-center">
              <p className="text-[11px] text-slate-500">
                No notes yet. Tap "Add Note" to begin documenting this session.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default ConsultationSidebar
