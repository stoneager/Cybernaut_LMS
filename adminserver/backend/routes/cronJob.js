const cron = require('node-cron');
const LessonPlan = require('./models/LessonPlan');
const AdminBatch = require('./models/AdminBatch');

// Schedule it every day at 2AM server time
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running daily LessonPlan generator...');

  const batches = await AdminBatch.find();

  for (const batch of batches) {
    const lastLesson = await LessonPlan.findOne({ batchId: batch._id }).sort({ day: -1 });

    const nextDay = lastLesson ? lastLesson.day + 1 : 1;
    const today = new Date();

    const newLesson = new LessonPlan({
      batchId: batch._id,
      day: nextDay,
      date: today,
      meetingLink: "",
      quiz: "",
      codingQuestion: ""
    });

    await newLesson.save();
    console.log(`✅ Added Day ${nextDay} for Batch ${batch._id}`);
  }

  console.log('🎯 Daily LessonPlan generation completed.');
});
