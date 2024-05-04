const Customer = require('../models/customerModel');
const factory = require('./handlerFactory');


exports.getCustomer = factory.getOne(Customer);

exports.getAllCustomers = factory.getAll(Customer);

exports.updateCustomer = factory.updateOne(Customer);

exports.deleteCustomer = factory.deleteOne(Customer);
