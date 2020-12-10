const urlForUser = (id, data) => {
  const urlUser = {};
  for (let url in data) {
    if (data[url].userId === id) {
      urlUser[url] = data[url];
    }
  }
  return urlUser;
};
const userExist = (email,database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
};
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = {urlForUser, userExist, generateRandomString}