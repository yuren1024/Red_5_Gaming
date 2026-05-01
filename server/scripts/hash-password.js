const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

bcrypt
  .hash(password, 12)
  .then((hash) => {
    console.log(hash);
  })
  .catch((error) => {
    console.error("Failed to hash password:", error);
    process.exit(1);
  });
