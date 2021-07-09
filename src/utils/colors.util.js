const getRandomColor = () => {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateColor = (room) => {
  let color;
  while (true) {
    color = getRandomColor();
    const isColorUsed =
      Object.keys(room.sockets)
        .map((key) => room.sockets[key]["color"])
        .findIndex((usedColor) => color === usedColor) !== -1;
    if (!isColorUsed) return color;
  }
};

module.exports = {
  generateColor,
  getRandomColor,
};
