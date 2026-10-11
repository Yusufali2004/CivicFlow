// API client helper for CIVICFLOW backend

const BASE_URL = '/api';

export const fetchIncidents = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
  if (filters.area && filters.area !== 'ALL') params.append('area', filters.area);
  if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/incidents?${params.toString()}`);
  return res.json();
};

export const fetchIncidentById = async (id) => {
  const res = await fetch(`${BASE_URL}/incidents/${id}`);
  return res.json();
};

export const createIncident = async (data) => {
  const res = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const assignUnitWithTransaction = async (incidentId, { unitId, simulateFailure, notes, actor }) => {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unitId, simulateFailure, notes, actor }),
  });
  return res.json();
};

export const resolveIncidentWithTransaction = async (incidentId, { notes, actor } = {}) => {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, actor }),
  });
  return res.json();
};

export const fetchUnits = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
  if (filters.area && filters.area !== 'ALL') params.append('area', filters.area);

  const res = await fetch(`${BASE_URL}/units?${params.toString()}`);
  return res.json();
};

export const fetchAnalytics = async () => {
  const res = await fetch(`${BASE_URL}/analytics`);
  return res.json();
};

export const seedDatabaseApi = async () => {
  const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
  return res.json();
};
