require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

const deleteFilesAfterDate = async () => {
  console.log("Starting cleanup for files created after Jan 1, 2026...");
  
  const cutoffDate = Math.floor(new Date('2026-01-01').getTime() / 1000);
  let deletedCount = 0;

  try {
    const list = await openai.files.list();

    for await (const file of list) {
      if (file.created_at >= cutoffDate) {
        console.log(`Deleting: ${file.filename} (ID: ${file.id})`);
        
        try {
          await openai.files.delete(file.id);
          deletedCount++;
        } catch (delErr) {
          console.error(`Failed to delete ${file.id}:`, delErr.message);
        }
      }
    }

    console.log(`--- Cleanup Complete | Deleted: ${deletedCount} ---`);
  } catch (err) {
    console.error("Error:", err);
  }
};

deleteFilesAfterDate();