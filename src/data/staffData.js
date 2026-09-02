// Staff Availability Dataset for PHCs

const staffRoles = [
  { role: 'Medical Officer', sanctioned: 2, icon: 'Stethoscope' },
  { role: 'Staff Nurse', sanctioned: 4, icon: 'Heart' },
  { role: 'Pharmacist', sanctioned: 1, icon: 'Pill' },
  { role: 'Lab Technician', sanctioned: 1, icon: 'FlaskConical' },
  { role: 'ANM (Auxiliary Nurse Midwife)', sanctioned: 3, icon: 'Baby' },
  { role: 'Health Worker (Male)', sanctioned: 2, icon: 'UserCheck' },
  { role: 'Health Worker (Female)', sanctioned: 2, icon: 'UserCheck' },
  { role: 'Driver', sanctioned: 1, icon: 'Truck' },
  { role: 'Cleaner/Support', sanctioned: 2, icon: 'Brush' },
];

function generateStaffData(phcId, riskLevel) {
  const seed = phcId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;

  let fillRate;
  if (riskLevel === 'critical') fillRate = 0.35 + rng(1) * 0.25;
  else if (riskLevel === 'warning') fillRate = 0.55 + rng(1) * 0.25;
  else fillRate = 0.75 + rng(1) * 0.25;

  return staffRoles.map((role, idx) => {
    const roleFillRate = Math.min(1, fillRate + (rng(idx * 7) - 0.5) * 0.3);
    const inPosition = Math.min(role.sanctioned, Math.max(0, Math.round(role.sanctioned * roleFillRate)));
    const onLeave = rng(idx * 11) > 0.7 ? Math.min(inPosition, Math.round(rng(idx * 13) * 1.5)) : 0;
    const available = inPosition - onLeave;
    const vacant = role.sanctioned - inPosition;

    return {
      ...role,
      phcId,
      inPosition,
      onLeave,
      available,
      vacant,
      status: vacant > 0 ? (vacant >= role.sanctioned * 0.5 ? 'critical' : 'understaffed') : 'adequate',
    };
  });
}

function getStaffSummary(phcId, riskLevel) {
  const staff = generateStaffData(phcId, riskLevel);
  const totalSanctioned = staff.reduce((sum, s) => sum + s.sanctioned, 0);
  const totalInPosition = staff.reduce((sum, s) => sum + s.inPosition, 0);
  const totalAvailable = staff.reduce((sum, s) => sum + s.available, 0);
  const totalVacant = staff.reduce((sum, s) => sum + s.vacant, 0);
  const fillRate = ((totalInPosition / totalSanctioned) * 100).toFixed(1);

  return { totalSanctioned, totalInPosition, totalAvailable, totalVacant, fillRate, details: staff };
}

export { staffRoles, generateStaffData, getStaffSummary };
