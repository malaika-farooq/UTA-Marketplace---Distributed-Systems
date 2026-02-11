#!/bin/bash

# Generate proper bcrypt hashes for password123 and update the database

echo "Generating bcrypt hashes using the auth service container..."

# Use the auth service to generate hashes
docker exec uta-marketplace-auth node -e "
const bcrypt = require('bcrypt');
const password = 'password123';

(async () => {
  const hash1 = await bcrypt.hash(password, 10);
  const hash2 = await bcrypt.hash(password, 10);
  const hash3 = await bcrypt.hash(password, 10);

  console.log('Generated hashes:');
  console.log('Alice:', hash1);
  console.log('Bob:', hash2);
  console.log('Carol:', hash3);

  // Update database directly
  const { Client } = require('pg');
  const client = new Client({
    host: 'postgres',
    port: 5432,
    user: 'uta',
    password: 'uta',
    database: 'uta_marketplace'
  });

  await client.connect();

  await client.query(\"UPDATE users SET password_hash = \$1 WHERE email = 'alice@uta.edu'\", [hash1]);
  await client.query(\"UPDATE users SET password_hash = \$1 WHERE email = 'bob@uta.edu'\", [hash2]);
  await client.query(\"UPDATE users SET password_hash = \$1 WHERE email = 'carol@uta.edu'\", [hash3]);

  console.log('\\nPasswords updated in database!');
  console.log('You can now login with:');
  console.log('  Email: alice@uta.edu, bob@uta.edu, or carol@uta.edu');
  console.log('  Password: password123');

  await client.end();
})();
"

echo ""
echo "Done! Try logging in now."
