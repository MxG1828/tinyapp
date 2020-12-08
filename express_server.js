const express = require ("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}!`);
})

app.get("/u/:shortURL", (req, res) => {
  const longUrl = urlDatabase[req.params.shortURL];
  res.redirect(longUrl);
})

app.get("/", (req, res) => {
  res.send("Hello!");
})

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
})

app.post("/urls/:id", (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls')
})

app.post("/urls", (req, res) => {
  newKey = generateRandomString()
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

function generateRandomString() {
    return Math.random().toString(36).substring(2,8);
}