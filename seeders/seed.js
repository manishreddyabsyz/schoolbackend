
// const User= require("../models").User; 
// const bcrypt = require('bcrypt');

// const seedUsers = async () => {
//   try {
//     await User.bulkCreate([
//       {
//         username: 'manish',
//         password: await bcrypt.hash('manish@123', 10), 
//         role: 'Admin'
//       },
//       {
//         username: 'kapil',
//         password: await bcrypt.hash('kapil@123', 10),
//         role: 'Teacher'
//       },
//       {
//         username: 'harish',
//         password: await bcrypt.hash('harish@123', 10),
//         role: 'Student'
//       }
//     ]);

//     console.log('Test users inserted successfully');
//   } catch (error) {
//     console.error('Error seeding users:', error);
//   }
// };

// module.exports={seedUsers}
