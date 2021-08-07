//Important Modules
const express = require("express");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const tools = require("./tools.js");
const db = new sqlite3.Database("./users.db");
const server = express();
const PORT = process.env.PORT || 3001;

//Important Middleware
server.use(cors());
server.use(express.json());
server.use((req, res, next) => {
  if (req.body.u) {
    req.body.u = req.body.u.toLowerCase();
  }

  if (req.body.nu) {
    req.body.nu = req.body.nu.toLowerCase();
  }

  if (req.query.u) {
    req.query.u = req.query.u.toLowerCase();
  }

  console.log(`${req.method} Received With Body:`, req.body);
  next();
});

//Handling Requests

server.get("/", (req, res, next) => {
  res.json({res:"You Have Reached Login Api."})
})

//Get Request For Users Route
server.get("/users", (req, res, next) => {
  if (req.query.u && req.query.p) {
    //If we are provided with username and password
    db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [req.query.u, req.query.p],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else {
          //Verify if username and password exists
          if (row) {
            res.status(200).json({ res: row });
          } else {
            res.status(404).json({ err: "User Not Found" });
          }
        }
      }
    );
  } else if (req.query.u) {
    db.get(
      "SELECT username FROM users WHERE username = ?",
      [req.query.u],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else if (req.query.u && row) {
          res.status(200).json({ res: row.username });
        } else {
          res.status(400).json({ err: "Bad Request" });
        }
      }
    );
  } else {
    //Send Back A List Of All Usernames
    db.all("SELECT username FROM users", (err, rows) => {
      if (err) {
        res.status(500).json({ err: "Server Error" });
      } else {
        res.status(200).json({ res: tools.objsPropToArray(rows, "username") });
      }
    });
  }
});

server.post("/users", (req, res, next) => {
  if (!req.body.b) {
    req.body.b = "I Have No Bio";
  }

  if (req.body.u && req.body.p && req.body.fn && req.body.ln) {
    db.get(
      "SELECT username FROM users WHERE username = ?",
      [req.body.u],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else if (!row) {
          db.run(
            "INSERT INTO users(username, password, firstname, lastname, bio) VALUES( ?, ?, ?, ?, ? )",
            [req.body.u, req.body.p, req.body.fn, req.body.ln, req.body.b],
            (err) => {
              if (err) {
                res.status(500).json({ err: "Server Error" });
              } else {
                db.get(
                  "SELECT * FROM users WHERE username = ?",
                  [req.body.u],
                  (err, row) => {
                    if (err) {
                      res.status(500).json({ err: "Server Error" });
                    } else {
                      res.status(201).json({ res: row });
                    }
                  }
                );
              }
            }
          );
        } else {
          res.status(400).json({ err: "Bad Request" });
        }
      }
    );
  }
});

server.put("/users", (req, res, next) => {
  //nu stands for new username
  if (req.body.u) {
    //If New Username already exists set new username to previous username
    db.get(
      "SELECT username FROM users WHERE username = ?",
      [req.body.nu],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else if (row) {
          req.body.nu = req.body.u;
        }
      }
    );

    db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [req.body.u, req.body.p],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else if (row) {
          let user = row;

          if (req.body.nu) {
            user.username = req.body.nu;
          }
          if (req.body.np) {
            user.password = req.body.np;
          }
          if (req.body.fn) {
            user.firstname = req.body.fn;
          }
          if (req.body.ln) {
            user.lastname = req.body.ln;
          }
          if (req.body.b) {
            user.bio = req.body.b;
          }

          db.run(
            "UPDATE users SET username = ?, password = ?, firstname = ?, lastname = ?, bio = ? WHERE username = ?",
            [
              user.username,
              user.password,
              user.firstname,
              user.lastname,
              user.bio,
              req.body.u,
            ],
            (err) => {
              if (err) {
                res.status(500).json({ err: "Server Error" });
              } else {
                db.get(
                  "SELECT * FROM users WHERE username = ?",
                  [user.username],
                  (err, row) => {
                    if (err) {
                      res.status(500).json({ err: "Server Error" });
                    } else {
                      res.status(200).json({ res: row });
                    }
                  }
                );
              }
            }
          );
        } else {
          res.status(404).json({ err: "User Not Found" });
        }
      }
    );
  } else {
    res.staus(400).json({ err: "Bad Request" });
  }
});

server.delete("/users", (req, res, next) => {
  if (req.body.u && req.body.p) {
    db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [req.body.u, req.body.p],
      (err, row) => {
        if (err) {
          res.status(500).json({ err: "Server Error" });
        } else if (row) {
          db.run(
            "DELETE FROM users WHERE username = ? ",
            [req.body.u],
            (err) => {
              if (err) {
                res.status(500).json({ err: "Server Error" });
              } else {
                res.status(200).json({ res: req.body.u });
              }
            }
          );
        } else {
          res.status(404).json({ err: "User Not Found" });
        }
      }
    );
  } else {
    res.status(400).json({ err: "Bad Request" });
  }
});

server.listen(PORT, () => {
  console.log("Server Is Up");
});
