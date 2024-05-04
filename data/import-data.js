const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Customer = require('./../models/customerModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// Get data from json file
const customers = JSON.parse(fs.readFileSync(`${__dirname}/customer.json`, 'utf-8'));

// Import data
const importData = async () => {
  try {
    await Customer.create(customers, { validateBeforeSave: false });
    console.log('Data migrated successfully!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from db
const deleteData = async () => {
  try {
    await Customer.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
