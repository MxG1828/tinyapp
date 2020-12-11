const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { urlForUser, userExist, generateRandomString } = require("./helper");
const { users } = require("./data");
const { urlDatabase } = require("./data");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["noKeyeah"],
  })
);

let error = null;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if (!!req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  //urls of the current user
  const urls = urlForUser(req.session.user_id, urlDatabase);
  const templateVars = { user: users[req.session.user_id], urls, error };
  //if not login, error
  if (!req.session.user_id) {
    templateVars.error = "noLogin";
    return res.render("error", templateVars);
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  //if not login, error
  if (!req.session.user_id) {
    res.render("login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const sURL = req.params.shortURL;
  const id = req.session.user_id;
  const templateVars = { user: users[id], shortURL: sURL, error };
  //if not login
  if (!id) {
    templateVars.error = "noLogin";
    return res.render("error", templateVars);
  }
  //if short url does not exist
  if (!urlDatabase[sURL]) {
    templateVars.error = "noURL";
    return res.render("error", templateVars);
  }
  //if user dont have access to url
  if (Object.keys(urlForUser(id, urlDatabase)).indexOf(sURL) === -1) {
    templateVars.error = "noAccess";
    return res.render("error", templateVars);
  }
  templateVars["longURL"] = urlDatabase[sURL].longURL;
  templateVars["date"] = urlDatabase[sURL].date;
  templateVars["visits"] = urlDatabase[sURL].visits;
  templateVars["uniVisit"] = urlDatabase[sURL].uniVisit;
  return res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    error = "noURL";
    const templateVars = { error, user: users[req.session.user_id] };
    return res.render("error", templateVars);
  }
  //if new ip, store ip, and add 1 unique visit
  if (urlDatabase[req.params.shortURL].ipVisited.indexOf(req.ip) === -1) {
    urlDatabase[req.params.shortURL].ipVisited.push(req.ip);
    urlDatabase[req.params.shortURL].uniVisit += 1;
  }
  urlDatabase[req.params.shortURL].visits += 1;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
    date: new Date(Date.now()).toLocaleDateString(),
    visits: 0,
    uniVisit: 0,
    ipVisited:[]
  };
  const templateVars = { user: users[req.session.user_id], error };
  //if not login, error
  if (!req.session.user_id) {
    templateVars.error = "noLogin";
    return res.render("error", templateVars);
  }
  res.redirect(`/urls/${newKey}`);
});

app.post("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, error, user: users[req.session.user_id] };
  //if not login
  if (!req.session.user_id) {
    templateVars.error = "noLogin";
    return res.render("error", templateVars);
  }
  //if user dont have access
  if (Object.keys(urlForUser(req.session.user_id, urlDatabase)).indexOf(req.params.id) === -1) {
    templateVars.error = "noAccess";
    return res.render("error", templateVars);
  }
  //if submit empty form, nothing change, just back to /urls (with the current button position, it is really easy to misclick)
  if (!req.body.longURL) {
    return res.redirect("/urls");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, error, user: users[req.session.user_id] };
  //if not login
  if (!req.session.user_id) {
    templateVars.error = "noLogin";
    return res.render("error", templateVars);
  }
  //if no access
  if (Object.keys(urlForUser(req.session.user_id, urlDatabase)).indexOf(req.params.shortURL) === -1) {
    templateVars.error = "noAccess";
    return res.render("error", templateVars);
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  //if not login
  if (!users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
      error,
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  //if not login
  if (!users[req.session.user_id]) {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let user = userExist(req.body.email, users);
  const templateVars = { error, user: users[req.session.user_id] };
  //if email does not exist, or empty password
  if (!user || !req.body.password) {
    templateVars.error = "incorrect";
    return res.render("error", templateVars);
  }
  //checking password
  if (!bcrypt.compareSync(req.body.password, users[user].hashed)) {
    templateVars.error = "incorrect";
    return res.render("error", templateVars);
  }
  req.session.user_id = user;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id], error };
  // if email or password is empty
  if (!req.body.email || !req.body.password) {
    templateVars.error = "empty";
    return res.render("error", templateVars);
  }
  //if email used
  if (userExist(req.body.email, users)) {
    templateVars.error = "exist";
    return res.render("error", templateVars);
  }
  const idstr = generateRandomString();
  users[idstr] = {
    id: idstr,
    email: req.body.email,
    hashed: bcrypt.hashSync(req.body.password, 10),
  };
  req.session.user_id = idstr;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
