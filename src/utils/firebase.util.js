const admin = require("firebase-admin");
const path = require("path");
admin.initializeApp({
  credential: admin.credential.cert("firebaseConfig.json"),
});

const sendMessage = (to, data, notification = {}) =>
  admin.messaging().sendToDevice(
    to, // device fcm tokens...
    {
      data,
      notification,
    },
    {
      // Required for background/quit data-only messages on iOS
      contentAvailable: true,
      // Required for background/quit data-only messages on Android
      priority: "high",
    }
  );

const getTokensList = (chat, userId) =>
  chat.participants
    .filter(
      (participant) =>
        !!participant.firebaseToken && (!userId || participant?._id != userId)
    )
    .map(({ firebaseToken }) => firebaseToken);

module.exports = {
  admin,
  sendMessage,
  getTokensList,
};
