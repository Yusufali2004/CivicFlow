# CIVICFLOW — Smart City Incident & Emergency Response Analytics

CIVICFLOW is a full-stack smart city emergency management platform designed for urban civic operations (modeled with fictional Bengaluru city areas). It coordinates incident reporting, emergency unit dispatch, and real-time operational analytics while demonstrating **real MongoDB Multi-Document ACID Transactions**.

---

## 🏛️ System Architecture & Tech Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                    CIVICFLOW WEB CLIENT                     │
   │  React 18 • Vite • Tailwind CSS • Recharts • Clean SVG UI   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ REST / JSON (HTTP Proxy)
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    NODE.JS + EXPRESS API                    │
   │  Controllers • Mongoose ORM • Aggregations • Audit Ledger   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │ Mongoose Session & Transactions
                                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             MONGODB (Atlas / Replica Set Mode)               │
   │   [incidents]  ◄───►  [responseUnits]  ◄───►  [responseEvents]│
   └─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, SVG Icon Library
- **Backend**: Node.js (ES Modules), Express.js, CORS, Dotenv
- **Database**: MongoDB Atlas (or local Replica Set with Mongoose)
- **Data Integrity**: MongoDB Multi-Document ACID Transactions (`session.startTransaction()`, `session.commitTransaction()`, `session.abortTransaction()`)
- **Analytics Engine**: Native MongoDB Aggregation Pipelines (`$group`, `$project`, `$cond`, `$lookup`, `$divide`, `$subtract`)

---

## 📂 MongoDB Collections & Data Models

### 1. `incidents`
Tracks all reported urban emergencies and anomalies across Bengaluru city sectors.
- `incidentNumber`: String (unique identifier, e.g., `INC-1001`)
- `title`: String (e.g., *"Multi-vehicle collision near Sony World Junction"*)
- `type`: Enum `['Accident', 'Traffic Jam', 'Road Blockage', 'Signal Failure', 'Fire', 'Medical Emergency']`
- `severity`: Enum `['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']`
- `status`: Enum `['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']`
- `area`: Enum `['Whitefield', 'Koramangala', 'Indiranagar', 'Hebbal', 'Yelahanka', 'HSR Layout', 'BTM Layout', 'Marathahalli']`
- `locationDetails`: String (street landmarks, junctions, metro pillars)
- `description`: String
- `assignedUnit`: ObjectId ref to `ResponseUnit` (null when unassigned)
- `reportedAt`: Date (timestamp of initial report)
- `resolvedAt`: Date (timestamp of closure)
- `responseNotes`: String

### 2. `responseUnits`
Tracks emergency vehicles and specialized field response units.
- `unitCode`: String (unique badge, e.g., `AMB-101`, `POL-201`, `FIR-301`, `TRF-401`)
- `type`: Enum `['Ambulance', 'Police', 'Fire Truck', 'Traffic Unit']`
- `status`: Enum `['AVAILABLE', 'DISPATCHED', 'BUSY']`
- `stationArea`: Enum (base station jurisdiction in Bengaluru)
- `vehicleNumber`: String (registration plate, e.g., `KA-01-ME-1101`)
- `contactNumber`: String (hotline contact)
- `currentIncident`: ObjectId ref to `Incident` (null if available)

### 3. `responseEvents`
Immutable audit ledger recording the lifecycle of incident management.
- `incidentId`: ObjectId ref to `Incident`
- `unitId`: ObjectId ref to `ResponseUnit`
- `eventType`: Enum `['REPORTED', 'DISPATCHED', 'ARRIVED', 'RESOLVED']`
- `timestamp`: Date
- `notes`: String
- `actor`: String (e.g., *"Central Dispatch Hub"*, *"Citizen Telemetry"*)

---

## ⚡ Core Feature: MongoDB Multi-Document Transactions

### Why Transactions in Smart City Dispatch?
In an emergency dispatch system, dispatching a unit requires **atomic synchronization across three separate collections**:
1. Marking the **incident** as `ASSIGNED`.
2. Marking the **response unit** as `DISPATCHED`.
3. Creating an immutable **response event** audit log.

If a server crashes or a validation fails halfway (for example, if another dispatcher grabs the ambulance concurrently), a non-transactional database would leave an ambulance marked `DISPATCHED` while the incident remains unassigned, or vice-versa.

### Implementation Flow (`server/controllers/incidentController.js`)
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Find and validate Incident inside session
  const incident = await Incident.findById(incidentId).session(session);
  if (!incident || incident.status === 'RESOLVED') {
    throw new Error('Incident cannot be assigned');
  }

  // 2. Find and validate Response Unit inside session
  const unit = await ResponseUnit.findById(unitId).session(session);
  if (!unit || unit.status !== 'AVAILABLE') {
    throw new Error('Unit is not AVAILABLE');
  }

  // 3. Update Incident document
  incident.status = 'ASSIGNED';
  incident.assignedUnit = unit._id;
  await incident.save({ session });

  // 4. Update Response Unit document
  unit.status = 'DISPATCHED';
  unit.currentIncident = incident._id;
  await unit.save({ session });

  // 5. Create Response Event audit log document
  await ResponseEvent.create([
    {
      incidentId: incident._id,
      unitId: unit._id,
      eventType: 'DISPATCHED',
      timestamp: new Date(),
      notes: `Dispatched ${unit.type} (${unit.unitCode}) to ${incident.area}`,
      actor: 'Smart City Dispatcher Console'
    }
  ], { session });

  // 6. Commit transaction atomically
  await session.commitTransaction();
  session.endSession();
} catch (error) {
  // 7. Atomic rollback on ANY error
  await session.abortTransaction();
  session.endSession();
  throw error;
}
```

---

## 📊 MongoDB Aggregation Pipelines

All analytics are calculated in the database using MongoDB Aggregation Pipelines (`server/controllers/analyticsController.js`):

1. **Incidents by Area**:
   ```javascript
   Incident.aggregate([
     { $group: { _id: "$area", count: { $sum: 1 } } },
     { $project: { area: "$_id", count: 1, _id: 0 } },
     { $sort: { count: -1 } }
   ]);
   ```
2. **Active vs. Resolved Ratio (`$cond`)**:
   ```javascript
   Incident.aggregate([
     {
       $group: {
         _id: { $cond: [{ $eq: ["$status", "RESOLVED"] }, "Resolved", "Active"] },
         count: { $sum: 1 }
       }
     },
     { $project: { status: "$_id", count: 1, _id: 0 } }
   ]);
   ```
3. **Average Resolution Time (Time Difference in Minutes)**:
   ```javascript
   Incident.aggregate([
     { $match: { resolvedAt: { $ne: null }, reportedAt: { $ne: null } } },
     {
       $project: {
         durationMinutes: {
           $divide: [{ $subtract: ["$resolvedAt", "$reportedAt"] }, 60000]
         }
       }
     },
     { $group: { _id: null, avgMinutes: { $avg: "$durationMinutes" } } }
   ]);
   ```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- Internet connection (for MongoDB Atlas or automatic local replica set)

### 1. MongoDB Atlas Setup (Recommended)
1. Log into [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Free Shared Cluster (M0).
3. Under **Database Access**, create a database user (e.g., `admin` with a secure password).
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or your current IP.
5. Under **Deployment > Database**, click **Connect > Drivers**, and copy the connection string.
6. In `server/.env`, set:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/civicflow?retryWrites=true&w=majority
   ```
> **Note**: If you leave `MONGODB_URI` blank, CIVICFLOW automatically starts an **in-memory MongoDB Replica Set**, enabling multi-document transactions out of the box with zero setup!

### 2. Running Backend & Frontend
Open two terminals (or run from root):

**Terminal 1 — Backend:**
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Resetting / Seeding Data
- Click the **"Reset Seed Data"** button in the top navigation bar.
- Or run in terminal:
  ```bash
  cd server
  npm run seed
  ```
This populates 15 realistic incidents, 8 response units, and 30 response events across Bengaluru areas.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | List incidents (with status, area, severity filters) |
| `POST` | `/api/incidents` | Log a new incident |
| `GET` | `/api/incidents/:id` | Get incident details & timeline events |
| `POST` | `/api/incidents/:id/assign` | **Assign unit inside MongoDB Transaction** |
| `POST` | `/api/incidents/:id/resolve` | **Resolve incident & free unit inside Transaction** |
| `GET` | `/api/units` | List emergency response units |
| `GET` | `/api/analytics` | Get aggregated metrics via MongoDB pipelines |
| `POST` | `/api/seed` | Reset database to default smart city dataset |
| `GET` | `/api/health` | Health & connection status check |
