const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/investintel').then(() => {
  mongoose.connection.db.collection('stockcaches').deleteMany({}).then(() => {
    console.log('Cache cleared');
    process.exit(0);
  });
});
