const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlForUser = (id) => {
  const urlUser ={};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      urlUser[url] = urlDatabase[url]
    }
  }
  return urlUser;
};
const userExist = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  test1: {
    id: "test1",
    email: "test1@test1.com",
    password: "test1",
  },
  test: {
    id: "test",
    email: "test@test.com",
    password: "test"
  }
};

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userId : "test"},
  "9sm5xK": {longURL: "http://www.google.com", userId: "test1"},
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const urls = urlForUser(req.cookies["user_id"]);
  const templateVars = { user: users[req.cookies["user_id"]], urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (users[req.cookies["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("registration", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.cookies["user_id"]] || Object.keys(urlForUser(req.cookies["user_id"])).indexOf(req.params.shortURL)=== -1 ) {
    return res.status(401).send("Unauthorized")
  }
  if(! urlDatabase[req.params.shortURL]) {
    return res.status(404).send("shortURL not found")
  }
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password && !userExist(req.body.email)) {
    const idstr = generateRandomString();
    users[idstr] = {
      id: idstr,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("user_id", idstr).redirect("/urls");
  } else {
    res.status(400);
    res.send("Error");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users[req.cookies["user_id"]] || Object.keys(urlForUser(req.cookies["user_id"])).indexOf(req.params.shortURL)=== -1 ) {
    return res.status(401).send("Unauthorized")
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!users[req.cookies["user_id"]] || Object.keys(urlForUser(req.cookies["user_id"])).indexOf(req.params.id)=== -1 ) {
    return res.status(401).send("Unauthorized")
  }
  if (!req.body.longURL) {
    return res.redirect("/urls")
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  newKey = generateRandomString();
  urlDatabase[newKey] = {longURL : req.body.longURL, userId: req.cookies["user_id"]};
  res.redirect(`/urls/${newKey}`);
});

app.post("/login", (req, res) => {
  let user = userExist(req.body.email);
  if (user && users[user].password === req.body.password) {
    res.cookie("user_id", user).redirect("/urls");
  } else {
    res.status(403);
    res.send("incorrect email or password");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
