import bcrypt from 'bcrypt';

const password = 'password123';
const saltRounds = 10;

async function generateHashes() {
  console.log('Generating bcrypt hashes for password: "password123"\n');

  // Generate 3 different hashes for the 3 users
  for (let i = 1; i <= 3; i++) {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`User ${i} hash: '${hash}'`);
  }

  console.log('\nYou can use any of these hashes in the seed.sql file.');
  console.log('Each hash is different due to the random salt, but all will validate "password123"');
}

generateHashes();
