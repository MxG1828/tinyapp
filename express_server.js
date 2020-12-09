const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());



const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
}
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const userExist = (email) => {
  for(let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
}
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/login", (req,res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login",templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("registration", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
    res.send('Error');
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

app.post("/login", (req, res) => {
  let user = userExist(req.body.email);
  if (user && users[user].password === req.body.password) {
    res.cookie("user_id", user).redirect("/urls");
  } else {
    res.status(403)
    res.send('incorrect email or password')
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
