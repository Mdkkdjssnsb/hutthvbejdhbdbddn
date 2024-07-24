const getRandomQuestion = (jsonData) => {
  const randomIndex = Math.floor(Math.random() * jsonData.length);
  return jsonData[randomIndex];
};

module.exports = { getRandomQuestion };
