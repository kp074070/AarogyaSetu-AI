import 'dotenv/config';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import PHC from '../models/PHC.js';
import Medicine from '../models/Medicine.js';
import Appointment from '../models/Appointment.js';
import Alert from '../models/Alert.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadJSON(filename) {
  return JSON.parse(readFileSync(join(__dirname, filename), 'utf-8'));
}

// Seed random helpers
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      PHC.deleteMany({}),
      Medicine.deleteMany({}),
      Appointment.deleteMany({}),
      Alert.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ===== 1. SEED USERS =====
    const users = [
      { email: 'admin@demo.com', password: 'demo1234', role: 'hospital', fullName: 'Dr. Rajesh Kumar', phone: '9876543210', state: 'Maharashtra', district: 'Pune', designation: 'Chief Medical Officer', avatar: 'RK' },
      { email: 'hospital2@demo.com', password: 'demo1234', role: 'hospital', fullName: 'Dr. Ananya Sharma', phone: '9876543211', state: 'Karnataka', district: 'Bangalore Urban', designation: 'Medical Superintendent', avatar: 'AS' },
      { email: 'patient@demo.com', password: 'demo1234', role: 'customer', fullName: 'Priya Patel', phone: '9876543220', state: 'Maharashtra', district: 'Pune', bloodGroup: 'B+', age: 28, gender: 'female', avatar: 'PP' },
      { email: 'patient2@demo.com', password: 'demo1234', role: 'customer', fullName: 'Amit Singh', phone: '9876543221', state: 'Karnataka', district: 'Bangalore Urban', bloodGroup: 'O+', age: 35, gender: 'male', avatar: 'AS' },
      { email: 'patient3@demo.com', password: 'demo1234', role: 'customer', fullName: 'Sneha Reddy', phone: '9876543222', state: 'Telangana', district: 'Hyderabad', bloodGroup: 'A+', age: 42, gender: 'female', avatar: 'SR' },
    ];
    const createdUsers = await User.create(users);
    console.log(`👤 Seeded ${createdUsers.length} users`);

    // ===== 2. SEED PHCs (from Kaggle-modeled data) =====
    const phcData = loadJSON('phcData.json');
    const phcDocs = phcData.map(p => ({
      ...p,
      lastInspection: randomDate(new Date('2024-01-01'), new Date('2025-06-01')),
    }));
    const createdPHCs = await PHC.insertMany(phcDocs);
    console.log(`🏥 Seeded ${createdPHCs.length} PHCs`);

    // ===== 3. SEED MEDICINES (from Kaggle A-Z Dataset modeled data) =====
    const medicineData = loadJSON('medicineData.json');
    const medicineDocs = [];

    for (const phc of createdPHCs) {
      for (const med of medicineData) {
        const currentStock = randomInt(0, 400);
        const minimumThreshold = randomInt(30, 100);
        const dailyConsumption = randomInt(1, 15);
        const ratio = currentStock / minimumThreshold;
        let status = 'adequate';
        if (currentStock === 0) status = 'out_of_stock';
        else if (ratio < 0.5) status = 'critical';
        else if (ratio < 1) status = 'low';

        medicineDocs.push({
          ...med,
          phcId: phc.phcId,
          phcName: phc.name,
          currentStock,
          minimumThreshold,
          maximumCapacity: randomInt(300, 600),
          dailyConsumption,
          status,
          daysUntilStockout: dailyConsumption > 0 ? Math.floor(currentStock / dailyConsumption) : 999,
          lastRestocked: randomDate(new Date('2025-01-01'), new Date()),
          expiryDate: randomDate(new Date('2025-12-01'), new Date('2027-06-01')),
          batchNumber: `BATCH-${phc.phcId}-${randomInt(1000, 9999)}`,
        });
      }
    }
    // Insert in batches to avoid memory issues
    const BATCH_SIZE = 500;
    let totalMeds = 0;
    for (let i = 0; i < medicineDocs.length; i += BATCH_SIZE) {
      const batch = medicineDocs.slice(i, i + BATCH_SIZE);
      await Medicine.insertMany(batch);
      totalMeds += batch.length;
    }
    console.log(`💊 Seeded ${totalMeds} medicine stock records`);

    // ===== 4. SEED APPOINTMENTS (HMIS-modeled) =====
    const departments = ['General Medicine', 'Pediatrics', 'Obstetrics', 'Dental', 'Ophthalmology', 'ENT', 'Dermatology'];
    const doctorNames = ['Dr. Suresh Patil', 'Dr. Meena Iyer', 'Dr. Rajan Nair', 'Dr. Fatima Sheikh', 'Dr. Arun Joshi', 'Dr. Kavita Rao', 'Dr. Vikas Gupta'];
    const qualifications = ['MBBS', 'MBBS, MD', 'MBBS, MS', 'BDS', 'MBBS, DNB'];
    const conditions = [
      { condition: 'Upper Respiratory Tract Infection', code: 'J06.9', severity: 'mild' },
      { condition: 'Type 2 Diabetes Mellitus', code: 'E11', severity: 'moderate' },
      { condition: 'Essential Hypertension', code: 'I10', severity: 'moderate' },
      { condition: 'Acute Gastroenteritis', code: 'A09', severity: 'mild' },
      { condition: 'Dengue Fever', code: 'A90', severity: 'severe' },
      { condition: 'Iron Deficiency Anemia', code: 'D50', severity: 'mild' },
      { condition: 'Malaria (P. vivax)', code: 'B51', severity: 'moderate' },
      { condition: 'Pneumonia', code: 'J18.9', severity: 'severe' },
      { condition: 'Urinary Tract Infection', code: 'N39.0', severity: 'mild' },
      { condition: 'Osteoarthritis', code: 'M19.9', severity: 'moderate' },
      { condition: 'Conjunctivitis', code: 'H10', severity: 'mild' },
      { condition: 'Hypothyroidism', code: 'E03', severity: 'mild' },
    ];
    const prescriptions = [
      ['Paracetamol 500mg - 1 tab TDS x 5 days', 'Cetirizine 10mg - 1 tab HS x 5 days'],
      ['Metformin 500mg - 1 tab BD x 30 days', 'Glimepiride 2mg - 1 tab OD x 30 days'],
      ['Amlodipine 5mg - 1 tab OD x 30 days', 'Losartan 50mg - 1 tab OD x 30 days'],
      ['ORS - 1 sachet TDS x 3 days', 'Ondansetron 4mg - 1 tab SOS', 'Metronidazole 400mg - 1 tab TDS x 5 days'],
      ['IV Fluids', 'Paracetamol 500mg - 1 tab SOS', 'Complete Blood Count follow-up in 48hrs'],
      ['Iron + Folic Acid - 1 tab OD x 90 days', 'Vitamin B Complex - 1 tab OD x 30 days'],
      ['Chloroquine Phosphate as per weight', 'Paracetamol 500mg - 1 tab SOS'],
      ['Amoxicillin 500mg - 1 cap TDS x 7 days', 'Cough Syrup - 10ml TDS x 5 days'],
      ['Ciprofloxacin 500mg - 1 tab BD x 5 days', 'Plenty of fluids'],
      ['Diclofenac Gel - Apply BD', 'Calcium + Vitamin D3 - 1 tab OD x 30 days'],
    ];
    const times = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];

    const customerUsers = createdUsers.filter(u => u.role === 'customer');
    const appointmentDocs = [];

    for (const user of customerUsers) {
      const userPHCs = createdPHCs.filter(p => p.state === user.state).length > 0
        ? createdPHCs.filter(p => p.state === user.state)
        : createdPHCs.slice(0, 5);

      // 8-15 appointments per user
      const numAppointments = randomInt(8, 15);
      for (let i = 0; i < numAppointments; i++) {
        const phc = pick(userPHCs);
        const isCompleted = i < numAppointments - 2;
        const isCancelled = !isCompleted && Math.random() < 0.2;
        const status = isCancelled ? 'cancelled' : isCompleted ? 'completed' : 'upcoming';
        const date = isCompleted
          ? randomDate(new Date('2024-06-01'), new Date('2025-08-01'))
          : randomDate(new Date('2025-09-05'), new Date('2025-10-30'));

        const condIdx = randomInt(0, conditions.length - 1);
        const apt = {
          userId: user._id,
          phcId: phc.phcId,
          phcName: phc.name,
          state: phc.state,
          district: phc.district,
          department: pick(departments),
          doctor: { name: pick(doctorNames), qualification: pick(qualifications) },
          date,
          time: pick(times),
          tokenNumber: randomInt(1, 50),
          status,
          fee: pick([0, 0, 0, 10, 20, 50]),
        };

        if (status === 'completed') {
          apt.diagnosis = conditions[condIdx];
          apt.prescription = prescriptions[condIdx % prescriptions.length];
          apt.notes = `Patient follow-up ${randomInt(1, 4) === 1 ? 'required in 2 weeks' : 'as needed'}. ${pick(['Improving', 'Stable', 'Recovering well', 'Needs monitoring'])}.`;
          apt.vitals = {
            bp: `${randomInt(110, 150)}/${randomInt(70, 95)}`,
            pulse: randomInt(65, 100),
            temperature: +(97 + Math.random() * 3).toFixed(1),
            weight: randomInt(45, 90),
            spo2: randomInt(94, 100),
          };
        }

        appointmentDocs.push(apt);
      }
    }

    const createdAppointments = await Appointment.insertMany(appointmentDocs);
    console.log(`📅 Seeded ${createdAppointments.length} appointments`);

    // ===== 5. SEED ALERTS =====
    const criticalPHCs = createdPHCs.filter(p => p.riskLevel === 'critical');
    const warningPHCs = createdPHCs.filter(p => p.riskLevel === 'warning');

    const alertDocs = [];
    for (const phc of criticalPHCs) {
      alertDocs.push({
        type: 'bed_shortage', severity: 'critical',
        title: `Critical Bed Shortage — ${phc.name}`,
        message: `Only ${phc.availableBeds} of ${phc.beds} beds available. Occupancy at ${Math.round((1 - phc.availableBeds / phc.beds) * 100)}%.`,
        phcId: phc.phcId, phcName: phc.name, state: phc.state, district: phc.district,
      });
      alertDocs.push({
        type: 'staff_shortage', severity: 'critical',
        title: `Staff Shortage — ${phc.name}`,
        message: `Only ${phc.doctors} doctor(s) serving ${phc.population.toLocaleString()} population. Immediate recruitment needed.`,
        phcId: phc.phcId, phcName: phc.name, state: phc.state, district: phc.district,
      });
    }
    for (const phc of warningPHCs) {
      alertDocs.push({
        type: 'critical_stock', severity: 'warning',
        title: `Low Medicine Stock — ${phc.name}`,
        message: `Multiple essential medicines running low. Restocking recommended within 7 days.`,
        phcId: phc.phcId, phcName: phc.name, state: phc.state, district: phc.district,
      });
    }
    // System alerts
    alertDocs.push({
      type: 'outbreak', severity: 'warning',
      title: 'Dengue Cases Rising — Maharashtra',
      message: 'Dengue cases have increased 35% in the last 2 weeks across Pune and Nashik districts. Enhanced surveillance recommended.',
      state: 'Maharashtra', relatedEntity: 'Dengue Fever',
    });
    alertDocs.push({
      type: 'redistribution', severity: 'info',
      title: 'AI Redistribution Recommendation',
      message: 'Transfer 200 units of Paracetamol from PHC Gandhinagar (surplus) to PHC Kutch (critical shortage).',
      relatedEntity: 'Paracetamol 500mg',
    });

    const createdAlerts = await Alert.insertMany(alertDocs);
    console.log(`🔔 Seeded ${createdAlerts.length} alerts`);

    console.log('\n✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   Users:        ${createdUsers.length}`);
    console.log(`   PHCs:         ${createdPHCs.length}`);
    console.log(`   Medicines:    ${totalMeds}`);
    console.log(`   Appointments: ${createdAppointments.length}`);
    console.log(`   Alerts:       ${createdAlerts.length}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
