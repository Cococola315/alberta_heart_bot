const { google } = require('googleapis');
const path = require('path');

// give access to google drive api
const KEYFILEPATH = path.join(__dirname, 'serviceAccountKey.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

module.exports = auth;