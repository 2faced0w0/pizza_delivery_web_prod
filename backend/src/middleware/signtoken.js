const jwt = require('jsonwebtoken');

// Define your payload (the data you want to sign)
const payload = {
  userId: '2',
  username: 'admin',
  role: 'admin'
};

// Define your secret key (keep this highly secure in a real application)
const secretKey = '92090298fbbe2217627564bdcd7e0cfa57e3af9fdd713c5fd8059082156ac870'; // Replace with a strong, randomly generated key

// Define options for signing (optional)
const options = {
  expiresIn: '1h' // Token expires in 1 hour
};

// Sign the token
const token = jwt.sign(payload, secretKey, options);

// Log the generated token to the console
console.log('Generated JWT:', token);