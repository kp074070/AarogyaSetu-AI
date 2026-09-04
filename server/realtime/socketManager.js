import Medicine from '../models/Medicine.js';
import PHC from '../models/PHC.js';

export function initSocketManager(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // Join room for specific PHC updates
    socket.on('joinPHC', (phcId) => {
      socket.join(`phc:${phcId}`);
      console.log(`📌 ${socket.id} joined room phc:${phcId}`);
    });

    socket.on('leavePHC', (phcId) => {
      socket.leave(`phc:${phcId}`);
    });
  });

  // Simulate real-time stock fluctuations every 30 seconds
  setInterval(async () => {
    try {
      // Pick a random medicine and slightly adjust its stock
      const count = await Medicine.countDocuments();
      if (count === 0) return;

      const randomSkip = Math.floor(Math.random() * Math.min(count, 500));
      const medicine = await Medicine.findOne().skip(randomSkip);
      if (!medicine) return;

      // Simulate daily consumption
      const consumed = Math.floor(Math.random() * medicine.dailyConsumption);
      medicine.currentStock = Math.max(0, medicine.currentStock - consumed);
      await medicine.save();

      io.emit('stockUpdate', {
        medicineId: medicine._id,
        name: medicine.name,
        phcId: medicine.phcId,
        phcName: medicine.phcName,
        currentStock: medicine.currentStock,
        status: medicine.status,
        consumed,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Silently ignore simulation errors
    }
  }, 30000);

  // Simulate bed availability changes every 45 seconds
  setInterval(async () => {
    try {
      const count = await PHC.countDocuments();
      if (count === 0) return;

      const randomSkip = Math.floor(Math.random() * count);
      const phc = await PHC.findOne().skip(randomSkip);
      if (!phc) return;

      // Randomly adjust beds ±1
      const change = Math.random() > 0.5 ? 1 : -1;
      phc.availableBeds = Math.max(0, Math.min(phc.beds, phc.availableBeds + change));
      await phc.save();

      io.emit('bedUpdate', {
        phcId: phc.phcId,
        phcName: phc.name,
        availableBeds: phc.availableBeds,
        beds: phc.beds,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      // Silently ignore simulation errors
    }
  }, 45000);
}
