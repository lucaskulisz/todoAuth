const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const Task = require("./models/Task");
const secret = 'secret1234'; 
const mongoose = require("mongoose");
const User = require("./models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const connect = async function () {
  try {
    const connectionParams = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: "lucaskulisz",
      pass: "5BCL2KOUHOtGE3HV",
    };

    await mongoose.connect(
      "mongodb+srv://lucaskulisz:5BCL2KOUHOtGE3HV@cluster0.cwllt6j.mongodb.net/?retryWrites=true&w=majority",
      connectionParams
    );
        console.log("Connected to the MongoDB database using Mongoose.");

  }catch (error) {
    console.log("Could not connect to the database.", error);
  }
  }
connect();


const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ extended: true }));
app.use(cors({
  credentials: true,
  origin: "http://localhost:5173",
}));


const port = process.env.PORT || 5500;
app.listen(port, () => console.log(`Listening on port ${port}...`));


app.get("/api/tasks/user", (req, res) => {
  if (!req.cookies.token) {
    return res.json({});
  }
  const payload = jwt.verify(req.cookies.token, secret);
  User.findById(payload.id)
    .then(userInfo => {
      if (!userInfo) {
        return res.json({})
      }
      res.json({ id: userInfo._id, email: userInfo.email });
    });
});

app.post("/api/tasks/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ password: hashedPassword, email });
  user.save().then(userInfo => {
    jwt.sign({ id: userInfo._id, email: userInfo.email }, secret,
      (error, token) => {
        if (error) {
          console.log(error);
          res.sendStatus(500);
        } else {
          res.cookie("token", token).json({ id: userInfo._id, email: userInfo.email });
        }
      });
  });
});


app.post("/api/tasks/login", (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then(userInfo => {
      if (!userInfo) {
        return res.sendStatus(401);
      }
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        const payload = { userId: userInfo._id };
        jwt.sign(payload, secret, (error, token) => {
          if (error) {
            console.log(error);
            res.sendStatus(500);
          } else {
            res.cookie("token", token).json({ id: userInfo._id, email: userInfo.email });
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      res.sendStatus(500);
    });
});

app.post("/api/tasks/logout", (req, res) => {
  res.cookie("token", "").send();
});

app.get("/api/tasks/", async (req, res) => {
  try {
    const payload = jwt.verify(req.cookies.token, secret);
    const tasks = await Task.find({ user: new mongoose.Types.ObjectId(payload.userId) }).exec();
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/api/tasks/", async (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);
  const task = new Task({
    category: req.body.category,
    description: req.body.description,
    task: req.body.task,
    done: false,
    user: new mongoose.Types.ObjectId(payload.userId),
  });
  task.save().then(task => {
    res.json(task);
  });
});


app.put("/api/tasks/:id", async (req, res) => {
  const payload = jwt.verify(req.cookies.token, secret);
  Task.updateOne({
    _id: new mongoose.Types.ObjectId(req.body.id),
    user: new mongoose.Types.ObjectId(payload.id)
  }, {
    done: req.body.done,
  }).then(() => {
    res.sendStatus(200);
  });
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    res.send(task);
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Error deleting task");
  }
}) 