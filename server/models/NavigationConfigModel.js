const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    path: { type: String, required: true, trim: true },
    language: { type: String, default: 'javascript', trim: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: true }
);

const NavigationSectionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
    topics: { type: [TopicSchema], default: [] },
  },
  { timestamps: true }
);

NavigationSectionSchema.index({ order: 1, category: 1 });

module.exports = mongoose.model('NavigationSection', NavigationSectionSchema);
