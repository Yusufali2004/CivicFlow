import mongoose from 'mongoose';
import { Incident } from '../models/Incident.js';
import { ResponseUnit } from '../models/ResponseUnit.js';
import { ResponseEvent } from '../models/ResponseEvent.js';

export const seedDatabase = async () => {
  console.log('Seeding CIVICFLOW database with smart city data...');

  // Clear existing collections
  await Incident.deleteMany({});
  await ResponseUnit.deleteMany({});
  await ResponseEvent.deleteMany({});

  // 1. Seed 8 Response Units
  const unitsData = [
    {
      unitCode: 'AMB-101',
      type: 'Ambulance',
      status: 'AVAILABLE',
      stationArea: 'Koramangala',
      vehicleNumber: 'KA-01-ME-1101',
      contactNumber: '+91 98451 10001',
    },
    {
      unitCode: 'AMB-102',
      type: 'Ambulance',
      status: 'AVAILABLE',
      stationArea: 'Indiranagar',
      vehicleNumber: 'KA-03-ME-1102',
      contactNumber: '+91 98451 10002',
    },
    {
      unitCode: 'POL-201',
      type: 'Police',
      status: 'AVAILABLE',
      stationArea: 'Whitefield',
      vehicleNumber: 'KA-04-PO-2001',
      contactNumber: '+91 98452 20001',
    },
    {
      unitCode: 'POL-202',
      type: 'Police',
      status: 'AVAILABLE',
      stationArea: 'HSR Layout',
      vehicleNumber: 'KA-05-PO-2002',
      contactNumber: '+91 98452 20002',
    },
    {
      unitCode: 'FIR-301',
      type: 'Fire Truck',
      status: 'AVAILABLE',
      stationArea: 'Hebbal',
      vehicleNumber: 'KA-02-FR-3001',
      contactNumber: '+91 98453 30001',
    },
    {
      unitCode: 'FIR-302',
      type: 'Fire Truck',
      status: 'AVAILABLE',
      stationArea: 'Marathahalli',
      vehicleNumber: 'KA-53-FR-3002',
      contactNumber: '+91 98453 30002',
    },
    {
      unitCode: 'TRF-401',
      type: 'Traffic Unit',
      status: 'AVAILABLE',
      stationArea: 'BTM Layout',
      vehicleNumber: 'KA-01-TR-4001',
      contactNumber: '+91 98454 40001',
    },
    {
      unitCode: 'TRF-402',
      type: 'Traffic Unit',
      status: 'AVAILABLE',
      stationArea: 'Yelahanka',
      vehicleNumber: 'KA-50-TR-4002',
      contactNumber: '+91 98454 40002',
    },
  ];

  const createdUnits = await ResponseUnit.insertMany(unitsData);
  const unitMap = {};
  createdUnits.forEach((u) => {
    unitMap[u.unitCode] = u;
  });

  const now = Date.now();
  const minutesAgo = (m) => new Date(now - m * 60 * 1000);

  // 2. Seed 15 Incidents
  // Mix: Some REPORTED (ready for live demo!), some ASSIGNED, some RESOLVED
  const incidentsData = [
    // 1. High-priority accident (REPORTED - Perfect for Demo step 3!)
    {
      incidentNumber: 'INC-1001',
      title: 'Multi-vehicle collision near Sony World Junction',
      type: 'Accident',
      severity: 'HIGH',
      status: 'REPORTED',
      area: 'Koramangala',
      locationDetails: 'Sony World Junction, 80ft Road, 4th Block',
      description: 'Two cars and a motorcycle collided. Lane blocked, minor injuries reported.',
      reportedAt: minutesAgo(12),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 2. Medical Emergency (REPORTED)
    {
      incidentNumber: 'INC-1002',
      title: 'Pedestrian collapsed near Metro Pillar 180',
      type: 'Medical Emergency',
      severity: 'CRITICAL',
      status: 'REPORTED',
      area: 'Indiranagar',
      locationDetails: '100ft Road near CMH Road intersection',
      description: 'Senior citizen unconscious on sidewalk. Immediate ambulance required.',
      reportedAt: minutesAgo(8),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 3. Traffic Jam (REPORTED)
    {
      incidentNumber: 'INC-1003',
      title: 'Heavy gridlock at Silk Board Flyover ramp',
      type: 'Traffic Jam',
      severity: 'MEDIUM',
      status: 'REPORTED',
      area: 'BTM Layout',
      locationDetails: 'Silk Board flyover towards Electronic City',
      description: 'Breakdown of a city bus caused a 2.5 km traffic backup.',
      reportedAt: minutesAgo(25),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 4. Fire incident (REPORTED)
    {
      incidentNumber: 'INC-1004',
      title: 'Dry grass blaze near Outer Ring Road service lane',
      type: 'Fire',
      severity: 'HIGH',
      status: 'REPORTED',
      area: 'Marathahalli',
      locationDetails: 'Near Kalamandir underpass, ORR',
      description: 'Spreading grass fire near electrical transformer.',
      reportedAt: minutesAgo(15),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 5. Signal Failure (REPORTED)
    {
      incidentNumber: 'INC-1005',
      title: 'Automated traffic signal blacked out',
      type: 'Signal Failure',
      severity: 'LOW',
      status: 'REPORTED',
      area: 'Whitefield',
      locationDetails: 'ITPL Main Road & Hope Farm Junction',
      description: 'Signal controller power outage causing vehicular confusion.',
      reportedAt: minutesAgo(40),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 6. Road Blockage (REPORTED)
    {
      incidentNumber: 'INC-1006',
      title: 'Uprooted eucalyptus tree across dual carriageway',
      type: 'Road Blockage',
      severity: 'HIGH',
      status: 'REPORTED',
      area: 'Hebbal',
      locationDetails: 'Bellary Road approaching Hebbal Flyover',
      description: 'Heavy rain tree fall blocking both airport bound lanes.',
      reportedAt: minutesAgo(30),
      assignedUnit: null,
      resolvedAt: null,
    },
    // 7. Accident (ASSIGNED to POL-202)
    {
      incidentNumber: 'INC-1007',
      title: 'Delivery van rear-ended auto-rickshaw',
      type: 'Accident',
      severity: 'MEDIUM',
      status: 'ASSIGNED',
      area: 'HSR Layout',
      locationDetails: '27th Main Road, Sector 1',
      description: 'Traffic stalled, police unit coordinating dispute resolution.',
      reportedAt: minutesAgo(50),
      assignedUnit: unitMap['POL-202']._id,
      resolvedAt: null,
      responseNotes: 'Unit POL-202 dispatched to survey scene and clear flow.',
    },
    // 8. Fire Incident (ASSIGNED to FIR-301)
    {
      incidentNumber: 'INC-1008',
      title: 'Kitchen flue fire in commercial complex',
      type: 'Fire',
      severity: 'CRITICAL',
      status: 'ASSIGNED',
      area: 'Hebbal',
      locationDetails: 'Kempapura Main Road, 2nd Floor',
      description: 'Dense smoke from restaurant chimney. Fire tenders deployed.',
      reportedAt: minutesAgo(45),
      assignedUnit: unitMap['FIR-301']._id,
      resolvedAt: null,
      responseNotes: 'Unit FIR-301 dispatched with water tender.',
    },
    // 9. Signal Failure (ASSIGNED to TRF-402)
    {
      incidentNumber: 'INC-1009',
      title: 'Traffic lights blinking amber continuously',
      type: 'Signal Failure',
      severity: 'LOW',
      status: 'ASSIGNED',
      area: 'Yelahanka',
      locationDetails: 'NES Junction, BBMP Office circle',
      description: 'Manual traffic control required during peak hour.',
      reportedAt: minutesAgo(55),
      assignedUnit: unitMap['TRF-402']._id,
      resolvedAt: null,
      responseNotes: 'TRF-402 personnel conducting manual traffic routing.',
    },
    // 10. Accident (RESOLVED)
    {
      incidentNumber: 'INC-1010',
      title: 'Minor scratch collision between cab and SUV',
      type: 'Accident',
      severity: 'LOW',
      status: 'RESOLVED',
      area: 'Whitefield',
      locationDetails: 'EPIP Zone, Near Inorbit Mall',
      description: 'Vehicles moved to curb, amicable settlement reached.',
      reportedAt: minutesAgo(180),
      assignedUnit: null,
      resolvedAt: minutesAgo(155),
      responseNotes: 'Traffic normal, police spot check completed.',
    },
    // 11. Medical Emergency (RESOLVED)
    {
      incidentNumber: 'INC-1011',
      title: 'Cardiac emergency at corporate campus',
      type: 'Medical Emergency',
      severity: 'CRITICAL',
      status: 'RESOLVED',
      area: 'Koramangala',
      locationDetails: 'Koramangala Club Road, 6th Block',
      description: 'Patient stabilized on-scene and transported to St. John’s Hospital.',
      reportedAt: minutesAgo(240),
      assignedUnit: null,
      resolvedAt: minutesAgo(215),
      responseNotes: 'Patient safely admitted to ICU.',
    },
    // 12. Road Blockage (RESOLVED)
    {
      incidentNumber: 'INC-1012',
      title: 'Construction gravel spillage on main road',
      type: 'Road Blockage',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      area: 'Indiranagar',
      locationDetails: '12th Main Road, Near HAL 2nd Stage',
      description: 'Debris swept off road surface by civic sweeping truck.',
      reportedAt: minutesAgo(300),
      assignedUnit: null,
      resolvedAt: minutesAgo(270),
      responseNotes: 'Road cleared and opened for public transit.',
    },
    // 13. Fire (RESOLVED)
    {
      incidentNumber: 'INC-1013',
      title: 'Garbage dump smoke near lake perimeter',
      type: 'Fire',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      area: 'BTM Layout',
      locationDetails: 'Madiwala Lake perimeter trail',
      description: 'Waste fire doused with chemical foam.',
      reportedAt: minutesAgo(360),
      assignedUnit: null,
      resolvedAt: minutesAgo(335),
      responseNotes: 'Fire extinguished completely.',
    },
    // 14. Traffic Jam (RESOLVED)
    {
      incidentNumber: 'INC-1014',
      title: 'VIP motorcade transit congestion',
      type: 'Traffic Jam',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      area: 'Hebbal',
      locationDetails: 'Hebbal Esteem Mall flyover junction',
      description: 'Convoy passed, normal vehicular dispersal achieved.',
      reportedAt: minutesAgo(420),
      assignedUnit: null,
      resolvedAt: minutesAgo(395),
      responseNotes: 'Congestion cleared.',
    },
    // 15. Medical Emergency (RESOLVED)
    {
      incidentNumber: 'INC-1015',
      title: 'Cyclist heat stroke incident',
      type: 'Medical Emergency',
      severity: 'HIGH',
      status: 'RESOLVED',
      area: 'Yelahanka',
      locationDetails: 'Major Sandeep Unnikrishnan Road',
      description: 'IV fluids administered on spot, transferred to local clinic.',
      reportedAt: minutesAgo(480),
      assignedUnit: null,
      resolvedAt: minutesAgo(460),
      responseNotes: 'Cyclist recuperated and released.',
    },
  ];

  const createdIncidents = await Incident.insertMany(incidentsData);
  const incMap = {};
  createdIncidents.forEach((inc) => {
    incMap[inc.incidentNumber] = inc;
  });

  // Update unit status for the 3 currently ASSIGNED units
  await ResponseUnit.findByIdAndUpdate(unitMap['POL-202']._id, {
    status: 'DISPATCHED',
    currentIncident: incMap['INC-1007']._id,
  });
  await ResponseUnit.findByIdAndUpdate(unitMap['FIR-301']._id, {
    status: 'DISPATCHED',
    currentIncident: incMap['INC-1008']._id,
  });
  await ResponseUnit.findByIdAndUpdate(unitMap['TRF-402']._id, {
    status: 'DISPATCHED',
    currentIncident: incMap['INC-1009']._id,
  });

  // 3. Seed 30 Response Events
  const eventsData = [
    // Events for INC-1001 (REPORTED)
    {
      incidentId: incMap['INC-1001']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(12),
      notes: 'Citizen reported road accident via Smart City Emergency Hotline.',
      actor: 'Public Citizen',
    },
    // Events for INC-1002 (REPORTED)
    {
      incidentId: incMap['INC-1002']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(8),
      notes: 'Metro security guard triggered medical panic button.',
      actor: 'BMRCL Security',
    },
    // Events for INC-1003 (REPORTED)
    {
      incidentId: incMap['INC-1003']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(25),
      notes: 'Traffic flow sensor camera detected static vehicle cluster > 20 mins.',
      actor: 'AI Vision Sensor Hub',
    },
    // Events for INC-1004 (REPORTED)
    {
      incidentId: incMap['INC-1004']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(15),
      notes: 'Smoke detector array alerted ORR disaster cell.',
      actor: 'Environmental Sensor Node',
    },
    // Events for INC-1005 (REPORTED)
    {
      incidentId: incMap['INC-1005']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(40),
      notes: 'Automated telemetry flagged grid power interruption.',
      actor: 'Smart Grid Telemetry',
    },
    // Events for INC-1006 (REPORTED)
    {
      incidentId: incMap['INC-1006']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(30),
      notes: 'Bengaluru traffic police patrol reported fallen branch blocking lanes.',
      actor: 'BTP Highway Patrol',
    },
    // Events for INC-1007 (REPORTED -> DISPATCHED)
    {
      incidentId: incMap['INC-1007']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(50),
      notes: 'Minor collision reported at HSR 27th Main.',
      actor: 'Commuter App',
    },
    {
      incidentId: incMap['INC-1007']._id,
      unitId: unitMap['POL-202']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(46),
      notes: 'Dispatched Police Unit POL-202 from HSR police station.',
      actor: 'Central Dispatch Hub',
    },
    {
      incidentId: incMap['INC-1007']._id,
      unitId: unitMap['POL-202']._id,
      eventType: 'ARRIVED',
      timestamp: minutesAgo(41),
      notes: 'Police Unit POL-202 arrived at incident site.',
      actor: 'Field Unit Officer',
    },
    // Events for INC-1008 (REPORTED -> DISPATCHED)
    {
      incidentId: incMap['INC-1008']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(45),
      notes: 'Restaurant manager called fire dispatch.',
      actor: 'Building Manager',
    },
    {
      incidentId: incMap['INC-1008']._id,
      unitId: unitMap['FIR-301']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(42),
      notes: 'Fire Truck FIR-301 dispatched with foam suppression kit.',
      actor: 'Fire Control Command',
    },
    {
      incidentId: incMap['INC-1008']._id,
      unitId: unitMap['FIR-301']._id,
      eventType: 'ARRIVED',
      timestamp: minutesAgo(35),
      notes: 'FIR-301 arrived at site. Fire fighting underway.',
      actor: 'Fire Station Chief',
    },
    // Events for INC-1009 (REPORTED -> DISPATCHED)
    {
      incidentId: incMap['INC-1009']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(55),
      notes: 'Signal outage reported by junction marshal.',
      actor: 'Traffic Warden',
    },
    {
      incidentId: incMap['INC-1009']._id,
      unitId: unitMap['TRF-402']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(50),
      notes: 'Traffic unit TRF-402 assigned to direct vehicles manually.',
      actor: 'Traffic Control Room',
    },
    // Events for INC-1010 (REPORTED -> DISPATCHED -> ARRIVED -> RESOLVED)
    {
      incidentId: incMap['INC-1010']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(180),
      notes: 'Car collision near Inorbit Mall.',
      actor: 'Mall Security',
    },
    {
      incidentId: incMap['INC-1010']._id,
      unitId: unitMap['POL-201']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(176),
      notes: 'Dispatched POL-201 for investigation.',
      actor: 'Central Dispatch Hub',
    },
    {
      incidentId: incMap['INC-1010']._id,
      unitId: unitMap['POL-201']._id,
      eventType: 'ARRIVED',
      timestamp: minutesAgo(169),
      notes: 'POL-201 reached location.',
      actor: 'Unit POL-201',
    },
    {
      incidentId: incMap['INC-1010']._id,
      unitId: unitMap['POL-201']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(155),
      notes: 'Dispute solved. Unit POL-201 returned to available pool.',
      actor: 'Lead Patrol Officer',
    },
    // Events for INC-1011 (REPORTED -> DISPATCHED -> ARRIVED -> RESOLVED)
    {
      incidentId: incMap['INC-1011']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(240),
      notes: 'Heart patient emergency call.',
      actor: 'Corporate HR',
    },
    {
      incidentId: incMap['INC-1011']._id,
      unitId: unitMap['AMB-101']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(237),
      notes: 'Ambulance AMB-101 mobilized with paramedic crew.',
      actor: 'Emergency EMS Desk',
    },
    {
      incidentId: incMap['INC-1011']._id,
      unitId: unitMap['AMB-101']._id,
      eventType: 'ARRIVED',
      timestamp: minutesAgo(230),
      notes: 'AMB-101 reached patient. Vitals stabilized.',
      actor: 'Paramedic Lead',
    },
    {
      incidentId: incMap['INC-1011']._id,
      unitId: unitMap['AMB-101']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(215),
      notes: 'Patient handed over to emergency ward. Unit AMB-101 sanitized and available.',
      actor: 'St. Johns Triage',
    },
    // Events for INC-1012 (REPORTED -> DISPATCHED -> RESOLVED)
    {
      incidentId: incMap['INC-1012']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(300),
      notes: 'Gravel spill causing skid hazard.',
      actor: 'Civic Monitor',
    },
    {
      incidentId: incMap['INC-1012']._id,
      unitId: unitMap['TRF-401']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(295),
      notes: 'TRF-401 cordoned off slippery lane.',
      actor: 'Traffic Hub',
    },
    {
      incidentId: incMap['INC-1012']._id,
      unitId: unitMap['TRF-401']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(270),
      notes: 'Cleaners completed debris removal.',
      actor: 'BBMP Field Supervisor',
    },
    // Events for INC-1013 (REPORTED -> DISPATCHED -> RESOLVED)
    {
      incidentId: incMap['INC-1013']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(360),
      notes: 'Lake trail smoke spotted.',
      actor: 'Morning Walkers Association',
    },
    {
      incidentId: incMap['INC-1013']._id,
      unitId: unitMap['FIR-302']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(355),
      notes: 'FIR-302 unit moved to lake boundary.',
      actor: 'Fire Control Command',
    },
    {
      incidentId: incMap['INC-1013']._id,
      unitId: unitMap['FIR-302']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(335),
      notes: 'Doused landfill smolder. Hazard neutralized.',
      actor: 'Fire Station Officer',
    },
    // Events for INC-1014 (REPORTED -> DISPATCHED -> RESOLVED)
    {
      incidentId: incMap['INC-1014']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(420),
      notes: 'VIP convoy causing temporary gridlock.',
      actor: 'Traffic CCTV',
    },
    {
      incidentId: incMap['INC-1014']._id,
      unitId: unitMap['TRF-401']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(415),
      notes: 'TRF-401 opened green corridor.',
      actor: 'Traffic Control Room',
    },
    {
      incidentId: incMap['INC-1014']._id,
      unitId: unitMap['TRF-401']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(395),
      notes: 'Vehicular movement restored to normal speed.',
      actor: 'Traffic Inspector',
    },
    // Events for INC-1015 (REPORTED -> DISPATCHED -> RESOLVED)
    {
      incidentId: incMap['INC-1015']._id,
      eventType: 'REPORTED',
      timestamp: minutesAgo(480),
      notes: 'Heat stroke emergency for cyclist.',
      actor: 'Passerby',
    },
    {
      incidentId: incMap['INC-1015']._id,
      unitId: unitMap['AMB-102']._id,
      eventType: 'DISPATCHED',
      timestamp: minutesAgo(475),
      notes: 'AMB-102 rushed with hydration kit.',
      actor: 'EMS Desk',
    },
    {
      incidentId: incMap['INC-1015']._id,
      unitId: unitMap['AMB-102']._id,
      eventType: 'RESOLVED',
      timestamp: minutesAgo(460),
      notes: 'Patient stable, case closed.',
      actor: 'Medical Officer',
    },
  ];

  await ResponseEvent.insertMany(eventsData);

  console.log(`Database seeded successfully!`);
  console.log(`- ${createdUnits.length} Response Units`);
  console.log(`- ${createdIncidents.length} Incidents`);
  console.log(`- ${eventsData.length} Response Events`);

  return {
    unitsCount: createdUnits.length,
    incidentsCount: createdIncidents.length,
    eventsCount: eventsData.length,
  };
};
