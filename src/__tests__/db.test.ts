import { db } from '../lib/db.js';

async function testDatabase() {
  console.log('Testing vector database loading...');
  
  await db.init();
  
  if (!db.documents) {
    throw new Error('Documents table missing!');
  }

  if (!db.memories) {
    throw new Error('Memories table missing!');
  }

  console.log('✅ Database test passed!');
}

testDatabase().catch(err => {
  console.error('❌ Database test failed:');
  console.error(err.message);
  process.exit(1);
});
