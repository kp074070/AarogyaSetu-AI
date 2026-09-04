// Hospital Profile Data — Synthetic hospital profiles
// Modeled after "Hospitals In India (Anonymized)" Kaggle dataset
// Fields: hospitalId, name, type, rating, reviewCount, specializations, coordinates, contactInfo

import phcData from './phcData';

const specializations = [
  'General Medicine', 'Pediatrics', 'Obstetrics & Gynecology', 'Orthopedics',
  'Dermatology', 'ENT', 'Ophthalmology', 'Dental', 'Emergency Care',
  'Preventive Care', 'Ayurveda', 'Homeopathy', 'Physiotherapy',
  'Mental Health', 'Nutrition & Dietetics',
];

const facilities = [
  'X-Ray', 'Ultrasound', 'ECG', 'Blood Bank', 'Laboratory',
  'Pharmacy', 'Ambulance', 'ICU', 'Operation Theatre', 'Delivery Room',
  'Vaccination Centre', 'Telemedicine', 'AYUSH Unit', 'Dental Chair',
];

function generateHospitalProfiles() {
  return phcData.map((phc, idx) => {
    const seed = phc.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;

    // Rating based on risk level and building condition
    let baseRating;
    if (phc.riskLevel === 'healthy') baseRating = 3.8 + rng(1) * 1.0;
    else if (phc.riskLevel === 'warning') baseRating = 3.0 + rng(1) * 1.0;
    else baseRating = 2.2 + rng(1) * 1.0;
    const rating = Math.round(baseRating * 10) / 10;

    // Review count
    const reviewCount = Math.round(20 + rng(2) * 280);

    // Select 3-6 specializations
    const numSpecs = 3 + Math.floor(rng(3) * 4);
    const specs = [];
    for (let i = 0; i < numSpecs; i++) {
      const specIdx = Math.floor(rng(i * 5 + 10) * specializations.length);
      if (!specs.includes(specializations[specIdx])) specs.push(specializations[specIdx]);
    }

    // Select 4-8 facilities
    const numFac = 4 + Math.floor(rng(4) * 5);
    const facs = [];
    for (let i = 0; i < numFac; i++) {
      const facIdx = Math.floor(rng(i * 7 + 20) * facilities.length);
      if (!facs.includes(facilities[facIdx])) facs.push(facilities[facIdx]);
    }

    // Operating hours
    const isOpen24x7 = rng(5) > 0.6;
    const operatingHours = isOpen24x7 ? '24x7' : '8:00 AM – 4:00 PM';

    // Distance (simulate from user's location — Mumbai)
    const userLat = 19.076;
    const userLng = 72.8777;
    const distKm = Math.round(
      Math.sqrt(Math.pow((phc.lat - userLat) * 111, 2) + Math.pow((phc.lng - userLng) * 85, 2)) * 10
    ) / 10;

    // Contact
    const phone = `+91 ${Math.floor(70000 + rng(6) * 29999)} ${Math.floor(10000 + rng(7) * 89999)}`;

    return {
      ...phc,
      rating,
      reviewCount,
      specializations: specs,
      facilities: facs,
      operatingHours,
      distance: distKm,
      phone,
      email: `admin@${phc.id.toLowerCase().replace(/-/g, '')}.phc.gov.in`,
      website: `https://${phc.state.toLowerCase().replace(/ /g, '')}.phc.gov.in/${phc.id.toLowerCase()}`,
      lastInspection: new Date(2024, Math.floor(rng(8) * 12), Math.floor(1 + rng(9) * 27)).toISOString().split('T')[0],
      ambulanceAvailable: rng(10) > 0.3,
      telemedicineEnabled: rng(11) > 0.4,
      ayushUnit: rng(12) > 0.5,
      waitTime: phc.riskLevel === 'critical' ? `${30 + Math.floor(rng(13) * 60)} min` : `${10 + Math.floor(rng(13) * 30)} min`,
      availableBeds: phc.beds - phc.bedsOccupied,
    };
  });
}

function getNearbyPHCs(userState, limit = 10) {
  const profiles = generateHospitalProfiles();
  // Prioritize same state, then sort by distance
  return profiles
    .sort((a, b) => {
      if (a.state === userState && b.state !== userState) return -1;
      if (b.state === userState && a.state !== userState) return 1;
      return a.distance - b.distance;
    })
    .slice(0, limit);
}

function searchPHCs(query, stateFilter, riskFilter) {
  let results = generateHospitalProfiles();

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.specializations.some(s => s.toLowerCase().includes(q))
    );
  }

  if (stateFilter && stateFilter !== 'all') {
    results = results.filter(p => p.state === stateFilter);
  }

  if (riskFilter && riskFilter !== 'all') {
    results = results.filter(p => p.riskLevel === riskFilter);
  }

  return results;
}

export { specializations, facilities, generateHospitalProfiles, getNearbyPHCs, searchPHCs };
