// Synthetic PHC Dataset — Modeled after Kaggle India Health Centre Directory
// 50+ Primary Health Centres across 10 Indian states

const phcData = [
  // Maharashtra
  { id: 'PHC-MH-001', name: 'PHC Shirdi', state: 'Maharashtra', district: 'Ahmednagar', lat: 19.7668, lng: 74.4773, type: 'PHC', beds: 12, bedsOccupied: 9, established: 2005, buildingCondition: 'Good', riskLevel: 'warning', population: 28000 },
  { id: 'PHC-MH-002', name: 'PHC Phaltan', state: 'Maharashtra', district: 'Satara', lat: 17.9847, lng: 74.4320, type: 'PHC', beds: 8, bedsOccupied: 3, established: 2001, buildingCondition: 'Good', riskLevel: 'healthy', population: 22000 },
  { id: 'PHC-MH-003', name: 'PHC Karjat', state: 'Maharashtra', district: 'Raigad', lat: 18.9105, lng: 73.3251, type: 'PHC', beds: 10, bedsOccupied: 8, established: 2008, buildingCondition: 'Fair', riskLevel: 'critical', population: 31000 },
  { id: 'PHC-MH-004', name: 'PHC Ambejogai', state: 'Maharashtra', district: 'Beed', lat: 18.7350, lng: 76.3864, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2003, buildingCondition: 'Poor', riskLevel: 'critical', population: 19000 },
  { id: 'PHC-MH-005', name: 'PHC Wai', state: 'Maharashtra', district: 'Satara', lat: 17.9526, lng: 73.8903, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2010, buildingCondition: 'Good', riskLevel: 'healthy', population: 25000 },

  // Karnataka
  { id: 'PHC-KA-001', name: 'PHC Channapatna', state: 'Karnataka', district: 'Ramanagara', lat: 12.6513, lng: 77.2066, type: 'PHC', beds: 10, bedsOccupied: 7, established: 2006, buildingCondition: 'Good', riskLevel: 'warning', population: 27000 },
  { id: 'PHC-KA-002', name: 'PHC Sira', state: 'Karnataka', district: 'Tumkur', lat: 13.7421, lng: 76.9076, type: 'PHC', beds: 8, bedsOccupied: 2, established: 2004, buildingCondition: 'Good', riskLevel: 'healthy', population: 20000 },
  { id: 'PHC-KA-003', name: 'PHC Kundapura', state: 'Karnataka', district: 'Udupi', lat: 13.6272, lng: 74.6917, type: 'PHC', beds: 12, bedsOccupied: 10, established: 2002, buildingCondition: 'Fair', riskLevel: 'critical', population: 33000 },
  { id: 'PHC-KA-004', name: 'PHC Gokak', state: 'Karnataka', district: 'Belgaum', lat: 16.1678, lng: 74.8258, type: 'PHC', beds: 6, bedsOccupied: 4, established: 2007, buildingCondition: 'Good', riskLevel: 'warning', population: 18000 },
  { id: 'PHC-KA-005', name: 'PHC Mandya', state: 'Karnataka', district: 'Mandya', lat: 12.5218, lng: 76.8951, type: 'PHC', beds: 10, bedsOccupied: 3, established: 2009, buildingCondition: 'Good', riskLevel: 'healthy', population: 24000 },

  // Tamil Nadu
  { id: 'PHC-TN-001', name: 'PHC Kanchipuram', state: 'Tamil Nadu', district: 'Kanchipuram', lat: 12.8342, lng: 79.7036, type: 'PHC', beds: 14, bedsOccupied: 11, established: 2003, buildingCondition: 'Good', riskLevel: 'warning', population: 35000 },
  { id: 'PHC-TN-002', name: 'PHC Thanjavur', state: 'Tamil Nadu', district: 'Thanjavur', lat: 10.7870, lng: 79.1378, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2005, buildingCondition: 'Good', riskLevel: 'healthy', population: 26000 },
  { id: 'PHC-TN-003', name: 'PHC Dindigul', state: 'Tamil Nadu', district: 'Dindigul', lat: 10.3673, lng: 77.9803, type: 'PHC', beds: 8, bedsOccupied: 7, established: 2001, buildingCondition: 'Poor', riskLevel: 'critical', population: 21000 },
  { id: 'PHC-TN-004', name: 'PHC Tiruvannamalai', state: 'Tamil Nadu', district: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747, type: 'PHC', beds: 12, bedsOccupied: 6, established: 2008, buildingCondition: 'Good', riskLevel: 'healthy', population: 29000 },
  { id: 'PHC-TN-005', name: 'PHC Sivaganga', state: 'Tamil Nadu', district: 'Sivaganga', lat: 10.4335, lng: 78.4836, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2006, buildingCondition: 'Fair', riskLevel: 'warning', population: 17000 },

  // Rajasthan
  { id: 'PHC-RJ-001', name: 'PHC Pushkar', state: 'Rajasthan', district: 'Ajmer', lat: 26.4898, lng: 74.5511, type: 'PHC', beds: 8, bedsOccupied: 6, established: 2004, buildingCondition: 'Fair', riskLevel: 'warning', population: 23000 },
  { id: 'PHC-RJ-002', name: 'PHC Bundi', state: 'Rajasthan', district: 'Bundi', lat: 25.4305, lng: 75.6499, type: 'PHC', beds: 10, bedsOccupied: 8, established: 2002, buildingCondition: 'Poor', riskLevel: 'critical', population: 30000 },
  { id: 'PHC-RJ-003', name: 'PHC Nagaur', state: 'Rajasthan', district: 'Nagaur', lat: 27.2024, lng: 73.7350, type: 'PHC', beds: 6, bedsOccupied: 2, established: 2010, buildingCondition: 'Good', riskLevel: 'healthy', population: 15000 },
  { id: 'PHC-RJ-004', name: 'PHC Jhunjhunu', state: 'Rajasthan', district: 'Jhunjhunu', lat: 28.1289, lng: 75.3998, type: 'PHC', beds: 8, bedsOccupied: 5, established: 2007, buildingCondition: 'Good', riskLevel: 'warning', population: 21000 },
  { id: 'PHC-RJ-005', name: 'PHC Baran', state: 'Rajasthan', district: 'Baran', lat: 25.1012, lng: 76.5132, type: 'PHC', beds: 10, bedsOccupied: 9, established: 2003, buildingCondition: 'Poor', riskLevel: 'critical', population: 28000 },

  // Uttar Pradesh
  { id: 'PHC-UP-001', name: 'PHC Fatehpur', state: 'Uttar Pradesh', district: 'Fatehpur', lat: 25.9304, lng: 80.8130, type: 'PHC', beds: 12, bedsOccupied: 10, established: 2001, buildingCondition: 'Poor', riskLevel: 'critical', population: 38000 },
  { id: 'PHC-UP-002', name: 'PHC Sultanpur', state: 'Uttar Pradesh', district: 'Sultanpur', lat: 26.2648, lng: 82.0727, type: 'PHC', beds: 8, bedsOccupied: 3, established: 2006, buildingCondition: 'Good', riskLevel: 'healthy', population: 25000 },
  { id: 'PHC-UP-003', name: 'PHC Hardoi', state: 'Uttar Pradesh', district: 'Hardoi', lat: 27.3951, lng: 80.1313, type: 'PHC', beds: 10, bedsOccupied: 8, established: 2004, buildingCondition: 'Fair', riskLevel: 'warning', population: 32000 },
  { id: 'PHC-UP-004', name: 'PHC Banda', state: 'Uttar Pradesh', district: 'Banda', lat: 25.4767, lng: 80.3367, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2003, buildingCondition: 'Poor', riskLevel: 'critical', population: 20000 },
  { id: 'PHC-UP-005', name: 'PHC Mainpuri', state: 'Uttar Pradesh', district: 'Mainpuri', lat: 27.2346, lng: 79.0211, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2009, buildingCondition: 'Good', riskLevel: 'healthy', population: 26000 },

  // Gujarat
  { id: 'PHC-GJ-001', name: 'PHC Dahod', state: 'Gujarat', district: 'Dahod', lat: 22.8337, lng: 74.2527, type: 'PHC', beds: 10, bedsOccupied: 7, established: 2005, buildingCondition: 'Good', riskLevel: 'warning', population: 27000 },
  { id: 'PHC-GJ-002', name: 'PHC Palanpur', state: 'Gujarat', district: 'Banaskantha', lat: 24.1710, lng: 72.4381, type: 'PHC', beds: 8, bedsOccupied: 3, established: 2007, buildingCondition: 'Good', riskLevel: 'healthy', population: 22000 },
  { id: 'PHC-GJ-003', name: 'PHC Chhota Udepur', state: 'Gujarat', district: 'Chhota Udepur', lat: 22.3092, lng: 74.0143, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2002, buildingCondition: 'Fair', riskLevel: 'critical', population: 18000 },
  { id: 'PHC-GJ-004', name: 'PHC Morbi', state: 'Gujarat', district: 'Morbi', lat: 22.8173, lng: 70.8370, type: 'PHC', beds: 12, bedsOccupied: 5, established: 2008, buildingCondition: 'Good', riskLevel: 'healthy', population: 30000 },
  { id: 'PHC-GJ-005', name: 'PHC Dang', state: 'Gujarat', district: 'Dang', lat: 20.7537, lng: 73.6832, type: 'PHC', beds: 8, bedsOccupied: 7, established: 2004, buildingCondition: 'Poor', riskLevel: 'critical', population: 16000 },

  // Madhya Pradesh
  { id: 'PHC-MP-001', name: 'PHC Shivpuri', state: 'Madhya Pradesh', district: 'Shivpuri', lat: 25.4236, lng: 77.6613, type: 'PHC', beds: 10, bedsOccupied: 8, established: 2003, buildingCondition: 'Fair', riskLevel: 'critical', population: 29000 },
  { id: 'PHC-MP-002', name: 'PHC Mandla', state: 'Madhya Pradesh', district: 'Mandla', lat: 22.5970, lng: 80.3718, type: 'PHC', beds: 8, bedsOccupied: 3, established: 2006, buildingCondition: 'Good', riskLevel: 'healthy', population: 21000 },
  { id: 'PHC-MP-003', name: 'PHC Tikamgarh', state: 'Madhya Pradesh', district: 'Tikamgarh', lat: 24.7393, lng: 78.8304, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2005, buildingCondition: 'Poor', riskLevel: 'warning', population: 17000 },
  { id: 'PHC-MP-004', name: 'PHC Betul', state: 'Madhya Pradesh', district: 'Betul', lat: 21.9104, lng: 77.8990, type: 'PHC', beds: 10, bedsOccupied: 6, established: 2008, buildingCondition: 'Good', riskLevel: 'warning', population: 24000 },
  { id: 'PHC-MP-005', name: 'PHC Dhar', state: 'Madhya Pradesh', district: 'Dhar', lat: 22.5971, lng: 75.3025, type: 'PHC', beds: 12, bedsOccupied: 10, established: 2002, buildingCondition: 'Fair', riskLevel: 'critical', population: 34000 },

  // Kerala
  { id: 'PHC-KL-001', name: 'PHC Alappuzha', state: 'Kerala', district: 'Alappuzha', lat: 9.4981, lng: 76.3388, type: 'PHC', beds: 14, bedsOccupied: 6, established: 2004, buildingCondition: 'Good', riskLevel: 'healthy', population: 30000 },
  { id: 'PHC-KL-002', name: 'PHC Palakkad', state: 'Kerala', district: 'Palakkad', lat: 10.7867, lng: 76.6548, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2006, buildingCondition: 'Good', riskLevel: 'healthy', population: 25000 },
  { id: 'PHC-KL-003', name: 'PHC Wayanad', state: 'Kerala', district: 'Wayanad', lat: 11.6854, lng: 76.1320, type: 'PHC', beds: 8, bedsOccupied: 6, established: 2009, buildingCondition: 'Good', riskLevel: 'warning', population: 19000 },
  { id: 'PHC-KL-004', name: 'PHC Kasaragod', state: 'Kerala', district: 'Kasaragod', lat: 12.4996, lng: 74.9869, type: 'PHC', beds: 10, bedsOccupied: 5, established: 2007, buildingCondition: 'Good', riskLevel: 'healthy', population: 23000 },
  { id: 'PHC-KL-005', name: 'PHC Idukki', state: 'Kerala', district: 'Idukki', lat: 9.8494, lng: 76.9710, type: 'PHC', beds: 6, bedsOccupied: 4, established: 2005, buildingCondition: 'Fair', riskLevel: 'warning', population: 15000 },

  // West Bengal
  { id: 'PHC-WB-001', name: 'PHC Bankura', state: 'West Bengal', district: 'Bankura', lat: 23.2324, lng: 87.0718, type: 'PHC', beds: 10, bedsOccupied: 8, established: 2003, buildingCondition: 'Fair', riskLevel: 'critical', population: 28000 },
  { id: 'PHC-WB-002', name: 'PHC Purulia', state: 'West Bengal', district: 'Purulia', lat: 23.3331, lng: 86.3650, type: 'PHC', beds: 8, bedsOccupied: 6, established: 2005, buildingCondition: 'Poor', riskLevel: 'warning', population: 24000 },
  { id: 'PHC-WB-003', name: 'PHC Cooch Behar', state: 'West Bengal', district: 'Cooch Behar', lat: 26.3228, lng: 89.4483, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2007, buildingCondition: 'Good', riskLevel: 'healthy', population: 22000 },
  { id: 'PHC-WB-004', name: 'PHC Malda', state: 'West Bengal', district: 'Malda', lat: 25.0108, lng: 88.1411, type: 'PHC', beds: 12, bedsOccupied: 10, established: 2002, buildingCondition: 'Poor', riskLevel: 'critical', population: 35000 },
  { id: 'PHC-WB-005', name: 'PHC Birbhum', state: 'West Bengal', district: 'Birbhum', lat: 23.8604, lng: 87.6200, type: 'PHC', beds: 8, bedsOccupied: 5, established: 2006, buildingCondition: 'Fair', riskLevel: 'warning', population: 20000 },

  // Odisha
  { id: 'PHC-OD-001', name: 'PHC Koraput', state: 'Odisha', district: 'Koraput', lat: 18.8135, lng: 82.7122, type: 'PHC', beds: 8, bedsOccupied: 7, established: 2004, buildingCondition: 'Poor', riskLevel: 'critical', population: 26000 },
  { id: 'PHC-OD-002', name: 'PHC Kendrapara', state: 'Odisha', district: 'Kendrapara', lat: 20.5020, lng: 86.4195, type: 'PHC', beds: 10, bedsOccupied: 4, established: 2006, buildingCondition: 'Good', riskLevel: 'healthy', population: 23000 },
  { id: 'PHC-OD-003', name: 'PHC Kalahandi', state: 'Odisha', district: 'Kalahandi', lat: 19.9135, lng: 83.1649, type: 'PHC', beds: 6, bedsOccupied: 5, established: 2003, buildingCondition: 'Poor', riskLevel: 'critical', population: 19000 },
  { id: 'PHC-OD-004', name: 'PHC Dhenkanal', state: 'Odisha', district: 'Dhenkanal', lat: 20.6618, lng: 85.5979, type: 'PHC', beds: 10, bedsOccupied: 6, established: 2008, buildingCondition: 'Good', riskLevel: 'warning', population: 25000 },
  { id: 'PHC-OD-005', name: 'PHC Ganjam', state: 'Odisha', district: 'Ganjam', lat: 19.3860, lng: 85.0510, type: 'PHC', beds: 12, bedsOccupied: 5, established: 2005, buildingCondition: 'Good', riskLevel: 'healthy', population: 28000 },
];

export default phcData;
