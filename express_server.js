const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
const { urlForUser, userExist, generateRandomString } = require("./helper.js")

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: ["noKeyeah"],
  })
);


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
  tester: { longURL: "http://www.lighthouselabs.ca", userId: "test" },
  test2: { longURL: "http://www.google.com", userId: "test1" },
};

let error = null;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls")
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const urls = urlForUser(req.session.user_id, urlDatabase);
  if(!users[req.session.user_id]) {
    error = "noLogin"
  }
  const templateVars = { user: users[req.session.user_id], urls, error};
  if(error === "noLogin") {
    return res.render("error", templateVars)
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (users[req.session.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const sURL = req.params.shortURL;
  const id = req.session.user_id
  const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, error};
  if(!users[req.session.user_id]){
    templateVars.error = "noLogin";
    return res.render("error",templateVars);
  }
  if(!urlDatabase[sURL]){
    templateVars.error = "noURL"
    return res.render("error",templateVars);
  }
  if (Object.keys(urlForUser(id, urlDatabase)).indexOf(sURL) === -1) {
    templateVars.error = "noAccess"
    return res.render("error",templateVars);
  }
  templateVars["longURL"] = urlDatabase[sURL].longURL
  return res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]){
    error = "noURL"
  }
  if (error === "noURL") {
    const templateVars = {error, user: users[req.session.user_id]}
    return res.render("error",templateVars)
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: req.body.longURL, userId: req.session.user_id, error};
  const templateVars = { user: users[req.session.user_id], error};
  if(!users[req.session.user_id]){
    templateVars.error = "noLogin";
    return res.render("error",templateVars);
  }
  res.redirect(`/urls/${newKey}`);
});

app.post("/urls/:id", (req, res) => {
  const templateVars = {shortURL: req.params.id, error, user: users[req.session.user_id]}
  if (Object.keys(urlForUser(req.session.user_id, urlDatabase)).indexOf(req.params.id) === -1) {
    templateVars.error = "noAccess"
    return res.render("error",templateVars);
  }
  if(!users[req.session.user_id]){
    templateVars.error = "noLogin";
    return res.render("error",templateVars);
  }
  if (!req.body.longURL) {
    return res.redirect("/urls");
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (!users[req.session.user_id]) {
    const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
  } else {
    res.redirect("/")
  } 
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("registration", templateVars);
});

app.post("/login", (req, res) => {
  let user = userExist(req.body.email, users);
  if (user && req.body.password) {
    if (bcrypt.compareSync(req.body.password, users[user].hashed)) {
      req.session.user_id = user;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("incorrect email or password");
    }
  } else {
    res.status(403);
    res.send("incorrect email or password");
  }
});


app.post("/register", (req, res) => {
  if (req.body.email && req.body.password && !userExist(req.body.email,users)) {
    const idstr = generateRandomString();
    users[idstr] = {
      id: idstr,
      email: req.body.email,
      hashed: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = idstr;
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("Error");
  }
});












app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users[req.session.user_id] || Object.keys(urlForUser(req.session.user_id, urlDatabase)).indexOf(req.params.shortURL) === -1) {
    return res.status(401).send("Unauthorized");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});




app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
