/**
 * CivicAction AI – Rule-Based AI Processing Engine
 * 
 * This module implements complaint intelligence using deterministic rule-based
 * algorithms. It does NOT use any external AI model or API.
 * All processing is done locally in the browser using JavaScript.
 */

// ─── Category Detection ───────────────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  road: ['pothole', 'road', 'highway', 'street', 'pavement', 'crack', 'asphalt', 'traffic', 'signal', 'divider', 'speed breaker', 'broken road', 'damaged road'],
  water: ['water', 'pipe', 'leakage', 'leak', 'supply', 'tap', 'drinking water', 'contaminated', 'muddy water', 'no water', 'water shortage', 'burst pipe'],
  garbage: ['garbage', 'waste', 'trash', 'dump', 'rubbish', 'litter', 'bin', 'collection', 'overflowing', 'stink', 'smell', 'odor', 'sanitation', 'dirty'],
  electricity: ['electricity', 'power', 'electric', 'outage', 'blackout', 'wire', 'transformer', 'voltage', 'current', 'meter', 'bill', 'electric pole', 'no power'],
  drainage: ['drainage', 'drain', 'sewer', 'sewage', 'waterlog', 'waterlogging', 'flooded', 'flooding', 'blocked drain', 'overflow', 'stagnant water', 'manhole'],
  streetlight: ['streetlight', 'street light', 'lamp', 'light', 'dark', 'darkness', 'bulb', 'lighting', 'no light', 'broken light', 'lamp post'],
};

export function detectCategory(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.filter(kw => lower.includes(kw)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'other';
}

// ─── Summarization ────────────────────────────────────────────────────────────

export function summarizeComplaint(title, description, category) {
  const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const firstSentence = sentences[0] || description.substring(0, 120);
  const wordCount = description.split(/\s+/).length;

  if (wordCount <= 20) return description;

  const urgencyWords = ['urgent', 'immediate', 'danger', 'hazard', 'critical', 'emergency', 'serious', 'severe'];
  const hasUrgency = urgencyWords.some(w => description.toLowerCase().includes(w));

  let summary = firstSentence;
  if (summary.length > 150) summary = summary.substring(0, 147) + '...';

  const catLabels = { road: 'Road issue', water: 'Water supply issue', garbage: 'Garbage/sanitation issue', electricity: 'Electricity issue', drainage: 'Drainage issue', streetlight: 'Streetlight issue', other: 'Civic issue' };
  const prefix = catLabels[category] || 'Civic issue';
  const urgencyTag = hasUrgency ? ' [URGENT]' : '';

  return `${prefix}${urgencyTag}: ${summary}`;
}

// ─── Priority Scoring ─────────────────────────────────────────────────────────

const URGENCY_KEYWORDS = {
  critical: ['emergency', 'danger', 'hazardous', 'accident', 'fatal', 'injury', 'collapse', 'explosion', 'fire', 'critical'],
  high: ['urgent', 'immediate', 'flood', 'flooding', 'sewage overflow', 'no water', 'blackout', 'pothole', 'broken', 'severe'],
  medium: ['inconvenience', 'problem', 'issue', 'damaged', 'poor', 'bad', 'weeks', 'months'],
  low: ['minor', 'small', 'slight', 'cosmetic', 'suggestion'],
};

const CATEGORY_BASE_PRIORITY = {
  road: 65,
  water: 70,
  drainage: 75,
  electricity: 70,
  garbage: 50,
  streetlight: 45,
  other: 40,
};

const IMPACT_KEYWORDS = ['residents', 'area', 'community', 'public', 'people', 'everyone', 'whole', 'entire', 'all', 'colony', 'neighborhood', 'street'];

export function scorePriority(title, description, category) {
  const text = `${title} ${description}`.toLowerCase();
  let score = CATEGORY_BASE_PRIORITY[category] || 40;
  const reasons = [];

  // Urgency boost
  if (URGENCY_KEYWORDS.critical.some(w => text.includes(w))) {
    score += 30;
    reasons.push('Contains critical/emergency keywords (+30)');
  } else if (URGENCY_KEYWORDS.high.some(w => text.includes(w))) {
    score += 20;
    reasons.push('Contains high-urgency keywords (+20)');
  } else if (URGENCY_KEYWORDS.medium.some(w => text.includes(w))) {
    score += 10;
    reasons.push('Contains medium-urgency keywords (+10)');
  } else if (URGENCY_KEYWORDS.low.some(w => text.includes(w))) {
    score -= 5;
    reasons.push('Minor issue keywords (-5)');
  }

  // Public impact
  const impactCount = IMPACT_KEYWORDS.filter(w => text.includes(w)).length;
  if (impactCount >= 3) {
    score += 15;
    reasons.push(`High public impact (${impactCount} impact keywords, +15)`);
  } else if (impactCount >= 1) {
    score += 8;
    reasons.push(`Moderate public impact (${impactCount} impact keyword(s), +8)`);
  }

  // Description length (more detail = more serious)
  const wordCount = description.split(/\s+/).length;
  if (wordCount > 80) { score += 5; reasons.push('Detailed description (+5)'); }
  else if (wordCount < 10) { score -= 5; reasons.push('Very short description (-5)'); }

  // Category base
  reasons.unshift(`Base score for "${category}" category: ${CATEGORY_BASE_PRIORITY[category] || 40}`);

  score = Math.max(0, Math.min(100, score));

  let priority;
  if (score >= 80) priority = 'critical';
  else if (score >= 60) priority = 'high';
  else if (score >= 40) priority = 'medium';
  else priority = 'low';

  return { score, priority, reasons };
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

export function detectDuplicates(complaint, allComplaints, threshold = 0.45) {
  const newTokens = tokenize(`${complaint.title} ${complaint.description}`);
  const duplicates = [];

  for (const existing of allComplaints) {
    if (existing.id === complaint.id) continue;
    const existTokens = tokenize(`${existing.title} ${existing.description}`);
    const sim = jaccardSimilarity(newTokens, existTokens);
    if (sim >= threshold) {
      duplicates.push({ id: existing.id, similarity: Math.round(sim * 100), title: existing.title });
    }
  }

  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

// ─── Action Brief ─────────────────────────────────────────────────────────────

const DEPARTMENT_MAP = {
  road: 'PWD (Public Works Department)',
  water: 'Water Supply & Sanitation Board',
  garbage: 'Municipal Solid Waste Management',
  electricity: 'State Electricity Distribution Company',
  drainage: 'Stormwater Drainage Authority',
  streetlight: 'Urban Lighting Division',
  other: 'General Administration Dept.',
};

const ACTION_TEMPLATES = {
  road: ['Inspect reported road section and assess damage extent', 'Deploy pothole repair crew within 48 hours for critical areas', 'Place warning signs/barricades for immediate hazard mitigation', 'Schedule asphalt repair or road resurfacing'],
  water: ['Dispatch plumber team to inspect reported pipe/supply issue', 'Test water quality if contamination is suspected', 'Provide alternative water supply if outage exceeds 24 hours', 'Repair or replace damaged pipeline'],
  garbage: ['Schedule urgent garbage pickup from reported location', 'Clear any illegal dump site', 'Inspect and repair overflowing bins', 'Increase collection frequency for the area'],
  electricity: ['Dispatch electrician to inspect reported fault', 'Restore power supply and check transformer load', 'Inspect exposed or damaged wiring for safety', 'Log fault in grid management system'],
  drainage: ['Inspect and clear blocked drains and manholes', 'Pump out stagnant/flooded water immediately', 'Check and repair drainage pipe integrity', 'Coordinate with flood management if area is waterlogged'],
  streetlight: ['Inspect non-functional street light(s)', 'Replace faulty bulbs or LED units', 'Repair damaged lamp post if structurally unsafe', 'Update street light maintenance log'],
  other: ['Assign complaint to appropriate department head', 'Conduct site inspection within 3 working days', 'Provide interim response to citizen', 'Escalate if unresolved after 7 days'],
};

export function generateActionBrief(complaint) {
  const { category, priority, title, description } = complaint;
  const dept = DEPARTMENT_MAP[category] || DEPARTMENT_MAP.other;
  const actions = ACTION_TEMPLATES[category] || ACTION_TEMPLATES.other;
  const sla = priority === 'critical' ? '24 hours' : priority === 'high' ? '48 hours' : priority === 'medium' ? '5 working days' : '10 working days';

  return {
    assignedDepartment: dept,
    recommendedActions: actions,
    estimatedSLA: sla,
    summary: `This ${priority}-priority complaint regarding ${category} infrastructure requires attention from ${dept}. Recommended SLA: ${sla}.`,
  };
}

// ─── Full AI Processing Pipeline ──────────────────────────────────────────────

export function processComplaint(complaint, allComplaints = []) {
  const category = complaint.category !== 'other' ? complaint.category : detectCategory(`${complaint.title} ${complaint.description}`);
  const summary = summarizeComplaint(complaint.title, complaint.description, category);
  const { score, priority, reasons } = scorePriority(complaint.title, complaint.description, category);
  const duplicates = detectDuplicates(complaint, allComplaints);
  const actionBrief = generateActionBrief({ ...complaint, category, priority });

  return {
    detectedCategory: category,
    aiSummary: summary,
    priorityScore: score,
    priority,
    priorityReasons: reasons,
    duplicates,
    actionBrief,
    processedAt: new Date().toISOString(),
  };
}
