var server = require('./server');
var ds = server.dataSources['pg-db'];
var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
ds.autoupdate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});

// run this file to create the tables
// node ./server/create_user.js