module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  verbose: true,
  transformIgnorePatterns: ["/node_modules/"],
};
