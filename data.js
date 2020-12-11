const bcrypt = require("bcrypt");

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashed: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  test1: {
    id: "test1",
    email: "test1@test1.com",
    hashed: bcrypt.hashSync("test1", 10),
  },
  test: {
    id: "test",
    email: "test@test.com",
    hashed: bcrypt.hashSync("test", 10),
  },
};

const urlDatabase = {
  tester: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "test",
    date: "test",
    visits: 0,
    uniVisit: 0,
    ipVisited: []
  },
  test2: {
    longURL: "http://www.google.com",
    userId: "test1",
    date: "test1",
    visits: 0,
    uniVisit: 0,
    ipVisited: []
  },
};

module.exports = { urlDatabase, users }