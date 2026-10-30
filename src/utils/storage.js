import { processComplaint } from './aiEngine.js';

const STORAGE_KEY = 'civicaction_complaints';

export function loadComplaints() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveComplaints(complaints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function getComplaints() {
  return loadComplaints() || [];
}

export function addComplaint(complaint, allComplaints) {
  const ai = processComplaint(complaint, allComplaints);
  const enriched = {
    ...complaint,
    category: ai.detectedCategory,
    aiSummary: ai.aiSummary,
    priorityScore: ai.priorityScore,
    priority: ai.priority,
    priorityReasons: ai.priorityReasons,
    duplicates: ai.duplicates,
    actionBrief: ai.actionBrief,
    aiProcessedAt: ai.processedAt,
    statusHistory: [
      { status: 'pending', date: complaint.createdAt, note: 'Complaint received and queued for review.' },
    ],
  };
  const updated = [enriched, ...allComplaints];
  saveComplaints(updated);
  return enriched;
}

export function updateComplaint(id, updates, allComplaints) {
  const updated = allComplaints.map(c => {
    if (c.id !== id) return c;
    const newC = { ...c, ...updates, updatedAt: new Date().toISOString() };
    if (updates.status && updates.status !== c.status) {
      newC.statusHistory = [
        ...(c.statusHistory || []),
        { status: updates.status, date: new Date().toISOString(), note: updates.statusNote || `Status updated to ${updates.status}.` },
      ];
    }
    return newC;
  });
  saveComplaints(updated);
  return updated;
}

export function generateId() {
  const prefix = 'CA';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getStats(complaints) {
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
    critical: complaints.filter(c => c.priority === 'critical').length,
  };
}
