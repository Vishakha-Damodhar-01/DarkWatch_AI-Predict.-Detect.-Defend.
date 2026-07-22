import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateIncident, addIncident } from '../store/threatSlice';
import { AlertOctagon, User, ShieldAlert, CheckCircle, Terminal, HelpCircle } from 'lucide-react';
import CyberCard from '../components/CyberCard';
import axios from 'axios';

const IncidentResponse = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state) => state.threat);
  const { user } = useSelector((state) => state.auth);

  const [selectedInc, setSelectedInc] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState('Medium');
  const [isRaisingInc, setIsRaisingInc] = useState(false);

  // Sync selected incident with latest Redux state
  const currentInc = selectedInc ? incidents.find(i => i.id === selectedInc.id) : null;

  useEffect(() => {
    if (incidents.length > 0 && !selectedInc) {
      setSelectedInc(incidents[0]);
    }
  }, [incidents, selectedInc]);

  const handleUpdateStatus = async (status) => {
    if (!currentInc) return;
    const updateData = { id: currentInc.id, status, username: user?.username || 'analyst' };
    
    try {
      const token = localStorage.getItem('darkwatch_token');
      await axios.put(`/api/incidents/${currentInc.id}/update`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
    dispatch(updateIncident(updateData));
  };

  const handleAssignAnalyst = async (assignedTo) => {
    if (!currentInc) return;
    const updateData = { id: currentInc.id, assignedTo, username: user?.username || 'analyst' };

    try {
      const token = localStorage.getItem('darkwatch_token');
      await axios.put(`/api/incidents/${currentInc.id}/update`, { assignedTo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
    dispatch(updateIncident(updateData));
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !currentInc) return;

    const updateData = { 
      id: currentInc.id, 
      comment: commentText, 
      username: user?.username || 'analyst' 
    };

    try {
      const token = localStorage.getItem('darkwatch_token');
      await axios.put(`/api/incidents/${currentInc.id}/update`, { comment: commentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
    dispatch(updateIncident(updateData));
    setCommentText('');
  };

  const handleRaiseIncident = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newIncData = {
      title: newTitle,
      description: newDesc,
      severity: newSeverity,
      threatScore: newSeverity === 'Critical' ? 95 : newSeverity === 'High' ? 78 : 50,
      assignedTo: user?.username || null
    };

    try {
      const token = localStorage.getItem('darkwatch_token');
      const response = await axios.post('/api/incidents/create', newIncData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(addIncident(response.data));
      setSelectedInc(response.data);
    } catch (err) {
      // Offline fallback
      const fallbackInc = {
        id: 'inc_' + Date.now(),
        title: newTitle,
        description: newDesc,
        severity: newSeverity,
        status: 'New',
        assignedTo: user?.username || null,
        threatScore: newSeverity === 'Critical' ? 95 : newSeverity === 'High' ? 78 : 50,
        evidence: [],
        comments: [],
        timeline: [{ text: 'Incident raised manually by ' + (user?.username || 'analyst'), timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString()
      };
      dispatch(addIncident(fallbackInc));
      setSelectedInc(fallbackInc);
    }

    setNewTitle('');
    setNewDesc('');
    setIsRaisingInc(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incident List Column */}
      <div className="space-y-4">
        <CyberCard title="Active Incidents Queue" icon={AlertOctagon} headerAction={
          <button 
            onClick={() => setIsRaisingInc(true)}
            className="px-2 py-1 bg-cyber-accent hover:opacity-90 text-white font-mono text-[9px] uppercase rounded-sm font-bold transition-all"
          >
            + Raise Ticket
          </button>
        }>
          <div className="space-y-2 mt-2">
            {incidents.map((inc) => (
              <div 
                key={inc.id}
                onClick={() => {
                  setSelectedInc(inc);
                  setIsRaisingInc(false);
                }}
                className={`p-3 border rounded-sm cursor-pointer transition-all ${
                  currentInc?.id === inc.id 
                    ? 'bg-cyber-secondary border-cyber-accent/60 shadow-cyber' 
                    : 'bg-cyber-secondary/30 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-mono font-bold text-[9px] uppercase px-1.5 py-0.5 rounded-sm ${
                    inc.severity === 'Critical' ? 'bg-cyber-critical/10 border border-cyber-critical/20 text-cyber-critical' :
                    inc.severity === 'High' ? 'bg-cyber-critical/10 border border-cyber-critical/20 text-cyber-critical' :
                    inc.severity === 'Medium' ? 'bg-cyber-warning/10 border border-cyber-warning/20 text-cyber-warning' : 'bg-cyber-safe/10 border border-cyber-safe/20 text-cyber-safe'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">{inc.id}</span>
                </div>
                <h4 className="font-sans text-xs font-semibold text-slate-200 mt-2 line-clamp-1">{inc.title}</h4>
                <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400 font-mono">
                  <span>Assigned: {inc.assignedTo || 'Unassigned'}</span>
                  <span className={`font-bold uppercase ${
                    inc.status === 'Resolved' ? 'text-cyber-safe' : 'text-cyber-warning'
                  }`}>{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CyberCard>
      </div>

      {/* Incident details or Create Incident form */}
      <div className="lg:col-span-2 space-y-4">
        {isRaisingInc ? (
          <CyberCard title="RAISE NEW SECURITY TICKET" icon={ShieldAlert}>
            <form onSubmit={handleRaiseIncident} className="space-y-4 mt-2">
              <div>
                <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Ticket Title</label>
                <input 
                  type="text" required placeholder="Database perimeter intrusion alert..."
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm px-3 py-2 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Detailed Description</label>
                <textarea 
                  rows="4" required placeholder="Detail the source IP, destination asset, and ML alert signatures..."
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-cyber-secondary/50 border border-white/5 rounded-sm p-3 font-sans text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyber-accent focus:shadow-cyber transition-all"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-slate-500 uppercase mb-1.5">Initial Severity</label>
                <select 
                  value={newSeverity} onChange={(e) => setNewSeverity(e.target.value)}
                  className="bg-cyber-secondary/50 border border-white/5 rounded-sm px-3 py-1.5 font-sans text-xs text-slate-300"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-cyber-accent text-white font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 shadow-cyber">
                  Log Incident
                </button>
                <button type="button" onClick={() => setIsRaisingInc(false)} className="px-4 py-2 bg-cyber-secondary border border-white/5 text-slate-300 font-mono text-xs uppercase rounded-sm">
                  Cancel
                </button>
              </div>
            </form>
          </CyberCard>
        ) : currentInc ? (
          <div className="space-y-4">
            {/* Header description */}
            <CyberCard title={`INCIDENT WORKSPACE - ${currentInc.id}`} icon={Terminal} headerAction={
              <div className="flex gap-2">
                {/* Status selector */}
                <select 
                  value={currentInc.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="bg-cyber-secondary border border-white/5 rounded-sm px-2.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="New">NEW</option>
                  <option value="Investigating">INVESTIGATING</option>
                  <option value="Mitigated">MITIGATED</option>
                  <option value="Resolved">RESOLVED</option>
                </select>
                
                {/* Assignee selector */}
                <select 
                  value={currentInc.assignedTo || ''}
                  onChange={(e) => handleAssignAnalyst(e.target.value || null)}
                  className="bg-cyber-secondary border border-white/5 rounded-sm px-2.5 py-1 text-[10px] font-mono text-slate-300 focus:outline-none"
                >
                  <option value="">UNASSIGNED</option>
                  <option value="analyst">SOC ANALYST (DEMO)</option>
                  <option value="admin">ADMINISTRATOR</option>
                </select>
              </div>
            }>
              <div className="space-y-4 mt-2">
                <div>
                  <h3 className="text-sm font-bold text-white leading-normal">{currentInc.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{currentInc.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block uppercase">Threat Score</span>
                    <span className="text-cyber-critical font-bold">{currentInc.threatScore}% risk index</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Created At</span>
                    <span className="text-slate-400">{currentInc.createdAt.replace('T', ' ').substring(0, 16)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase">Security SLA Status</span>
                    <span className="text-cyber-safe font-bold">COMPLIANT</span>
                  </div>
                </div>
              </div>
            </CyberCard>

            {/* Timeline audit and comments logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Audit logs timeline */}
              <CyberCard title="Audit Event Logs" icon={CheckCircle}>
                <div className="space-y-3 mt-2 h-48 overflow-y-auto pr-1">
                  {currentInc.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] font-mono border-l border-white/10 pl-3 relative last:pb-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent absolute -left-[4px] top-1" />
                      <div className="flex flex-col">
                        <span className="text-slate-300 leading-normal">{event.text}</span>
                        <span className="text-slate-500 text-[8px] mt-0.5">{event.timestamp.replace('T', ' ').substring(0, 16)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CyberCard>

              {/* Security Analyst comments workspace */}
              <CyberCard title="Analyst Collaboration" icon={User}>
                <div className="flex flex-col h-48 justify-between mt-2">
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-2">
                    {currentInc.comments.length > 0 ? (
                      currentInc.comments.map((c, idx) => (
                        <div key={idx} className="bg-cyber-secondary/40 border border-white/5 rounded-sm p-2 text-[10px] font-mono">
                          <div className="flex justify-between font-bold text-cyber-accent">
                            <span>{c.user}</span>
                            <span className="text-slate-500 text-[8px] font-normal">{c.timestamp.replace('T', ' ').substring(11, 16)}</span>
                          </div>
                          <p className="text-slate-300 mt-1 leading-normal">{c.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-[10px] text-slate-500 font-mono py-10 uppercase">
                        NO COMMENTS RECORDED
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" required placeholder="Type notes..."
                      value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-cyber-secondary/50 border border-white/5 rounded-sm px-2.5 py-1 font-sans text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <button type="submit" className="px-3 py-1 bg-cyber-secondary border border-white/5 hover:border-cyber-accent/50 text-slate-300 hover:text-white font-mono text-[10px] uppercase rounded-sm">
                      Send
                    </button>
                  </form>
                </div>
              </CyberCard>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 font-mono text-xs text-slate-500 uppercase bg-cyber-cards/75 border border-white/5 rounded-sm">
            SELECT A TICKET RECORD TO EXPAND THE SECURITY TEAM WORKSPACE
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentResponse;
