import mongoose from 'mongoose';

const LogisticsPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trackingUrlTemplate: { type: String, required: true }, // e.g. "https://bluedart.com/track?id={tracking_id}"
});

const SettingsSchema = new mongoose.Schema({
  id: { type: String, required: true, default: 'global' },
  logisticsPartners: { type: [LogisticsPartnerSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
