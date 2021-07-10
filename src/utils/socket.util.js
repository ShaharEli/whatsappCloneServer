const getSocketsList = (chat, userId) =>
  chat.participants
    .filter(
      (participant) =>
        !!participant.socketId && (!userId || participant?._id != userId)
    )
    .map(({ socketId }) => socketId);

module.exports = { getSocketsList };
