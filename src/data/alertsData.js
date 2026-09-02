// Alerts Data - Pre-generated alerts for the system

import phcData from './phcData';

const alertTemplates = [
  { type: 'stock_critical', severity: 'critical', icon: 'AlertTriangle', category: 'Medicine Stock',
    getMessage: (phc, med) => `${med} stock critically low at ${phc.name} — only ${Math.round(Math.random() * 50 + 10)} units remaining` },
  { type: 'stock_low', severity: 'warning', icon: 'Package', category: 'Medicine Stock',
    getMessage: (phc, med) => `${med} stock below reorder level at ${phc.name} — restock recommended within ${Math.round(Math.random() * 5 + 2)} days` },
  { type: 'bed_full', severity: 'critical', icon: 'Bed', category: 'Bed Availability',
    getMessage: (phc) => `${phc.name} has reached ${Math.round(85 + Math.random() * 15)}% bed occupancy — consider patient diversion` },
  { type: 'staff_shortage', severity: 'warning', icon: 'Users', category: 'Staff',
    getMessage: (phc, role) => `${role} vacancy at ${phc.name} — ${Math.round(Math.random() * 2 + 1)} position(s) unfilled` },
  { type: 'staff_critical', severity: 'critical', icon: 'UserX', category: 'Staff',
    getMessage: (phc) => `No Medical Officer available at ${phc.name} today — immediate attention required` },
  { type: 'demand_spike', severity: 'warning', icon: 'TrendingUp', category: 'Patient Load',
    getMessage: (phc) => `Patient footfall at ${phc.name} increased by ${Math.round(20 + Math.random() * 30)}% this week — resource adjustment needed` },
  { type: 'expiry_warning', severity: 'info', icon: 'Clock', category: 'Medicine Stock',
    getMessage: (phc, med) => `${med} batch at ${phc.name} expiring in ${Math.round(Math.random() * 30 + 15)} days — plan redistribution or usage` },
  { type: 'prediction_alert', severity: 'warning', icon: 'Brain', category: 'AI Prediction',
    getMessage: (phc, med) => `AI predicts ${med} stock-out at ${phc.name} within ${Math.round(Math.random() * 7 + 3)} days based on current consumption rate` },
  { type: 'redistribution', severity: 'info', icon: 'ArrowLeftRight', category: 'Redistribution',
    getMessage: (phc, nearby) => `AI suggests transferring surplus medicines from ${nearby} to ${phc.name} — ${Math.round(30 + Math.random() * 50)}km distance` },
];

const medicines = ['Paracetamol', 'Amoxicillin', 'Metformin', 'ORS Packets', 'Ibuprofen', 'Ciprofloxacin', 'Amlodipine', 'Insulin', 'Iron + Folic Acid', 'Azithromycin'];
const roles = ['Medical Officer', 'Staff Nurse', 'Pharmacist', 'Lab Technician', 'ANM'];

function generateAlerts() {
  const alerts = [];
  const now = new Date();

  phcData.forEach((phc, phcIdx) => {
    const numAlerts = phc.riskLevel === 'critical' ? 4 : phc.riskLevel === 'warning' ? 2 : 1;

    for (let i = 0; i < numAlerts; i++) {
      const templateIdx = (phcIdx * 3 + i * 7) % alertTemplates.length;
      const template = alertTemplates[templateIdx];
      const hoursAgo = Math.round(Math.random() * 72);
      const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

      const med = medicines[(phcIdx + i) % medicines.length];
      const role = roles[(phcIdx + i) % roles.length];
      const nearbyPhc = phcData[(phcIdx + 1) % phcData.length];

      let message;
      if (template.type.includes('staff')) message = template.getMessage(phc, role);
      else if (template.type === 'redistribution') message = template.getMessage(phc, nearbyPhc.name);
      else message = template.getMessage(phc, med);

      alerts.push({
        id: `ALR-${String(alerts.length + 1).padStart(4, '0')}`,
        ...template,
        phcId: phc.id,
        phcName: phc.name,
        state: phc.state,
        district: phc.district,
        message,
        timestamp: timestamp.toISOString(),
        timeAgo: hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`,
        isRead: Math.random() > 0.4,
        isResolved: Math.random() > 0.7,
      });
    }
  });

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export { generateAlerts, alertTemplates };
