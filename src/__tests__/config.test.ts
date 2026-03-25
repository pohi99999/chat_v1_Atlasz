import { config } from '../lib/config.js';

function testConfig() {
  console.log('Testing config loading...');
  
  if (!config) {
    throw new Error('Config object is missing!');
  }

  if (config.name !== 'Atlasz') {
    throw new Error(`Expected name "Atlasz", but got "${config.name}"`);
  }

  if (config.voice !== 'nova') {
    throw new Error(`Expected voice "nova", but got "${config.voice}"`);
  }

  console.log('✅ Config test passed!');
}

try {
  testConfig();
} catch (error) {
  console.error('❌ Config test failed:');
  console.error(error.message);
  process.exit(1);
}
