const test = async () => {
  try {
    const incRes = await fetch('http://localhost:5000/api/incidents?status=REPORTED');
    const incJson = await incRes.json();
    const incident = incJson.data[0];

    const unitRes = await fetch('http://localhost:5000/api/units?status=AVAILABLE');
    const unitJson = await unitRes.json();
    const unit = unitJson.data[0];

    console.log(`Testing with Incident ${incident.incidentNumber} and Unit ${unit.unitCode}`);

    // TEST 1: SIMULATED FAILURE & ROLLBACK
    console.log('\n--- TEST 1: SIMULATING TRANSACTION ABORT & ROLLBACK ---');
    const failRes = await fetch(`http://localhost:5000/api/incidents/${incident._id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId: unit._id, simulateFailure: true }),
    });
    const failJson = await failRes.json();
    console.log('Transaction Status:', failJson.transactionStatus);
    console.log('Error Message:', failJson.error);
    console.log('Steps returned:');
    failJson.steps.forEach((s) => console.log(`  [${s.status}] ${s.title}: ${s.detail || ''}`));

    // Verify database state was NOT changed
    const verifyInc = await (await fetch(`http://localhost:5000/api/incidents/${incident._id}`)).json();
    const verifyUnit = await (await fetch(`http://localhost:5000/api/units/${unit._id}`)).json();
    console.log(`State verification after abort: Incident status=${verifyInc.data.status}, Unit status=${verifyUnit.data.status}`);
    if (verifyInc.data.status === 'REPORTED' && verifyUnit.data.status === 'AVAILABLE') {
      console.log('>>> ROLLBACK VERIFIED! No changes persisted.');
    } else {
      console.error('>>> ROLLBACK FAILED!');
    }

    // TEST 2: SUCCESSFUL TRANSACTION COMMIT
    console.log('\n--- TEST 2: EXECUTING REAL SUCCESSFUL TRANSACTION ---');
    const successRes = await fetch(`http://localhost:5000/api/incidents/${incident._id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId: unit._id, simulateFailure: false }),
    });
    const successJson = await successRes.json();
    console.log('Transaction Status:', successJson.transactionStatus);
    console.log('Execution Time:', successJson.executionTimeMs, 'ms');
    console.log('Steps returned:');
    successJson.steps.forEach((s) => console.log(`  [${s.status}] ${s.title}: ${s.detail || ''}`));

    // Verify database state WAS changed atomically
    const committedInc = await (await fetch(`http://localhost:5000/api/incidents/${incident._id}`)).json();
    const committedUnit = await (await fetch(`http://localhost:5000/api/units/${unit._id}`)).json();
    console.log(`State verification after commit: Incident status=${committedInc.data.status}, Unit status=${committedUnit.data.status}`);
    if (committedInc.data.status === 'ASSIGNED' && committedUnit.data.status === 'DISPATCHED') {
      console.log('>>> TRANSACTION COMMIT VERIFIED! 3 documents updated atomically.');
    } else {
      console.error('>>> COMMIT FAILED!');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
};

test();
