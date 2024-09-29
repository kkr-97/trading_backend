const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");
const { UserModel } = require("./models/UserModel");

const verifyUser = require("./middleware/verifyUser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

require("dotenv").config();
const port = process.env.PORT || 3002;
const uri = process.env.MONGODB_URI;

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.post(
  "/register",
  [
    check("email", "Please include a valid email").isEmail(),
    check("username", "username is required").not().isEmpty(),
    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.errors[0].msg });
      }
      const { username, password, email } = req.body;

      const userDate = await UserModel.findOne({ email: email });

      if (userDate) {
        res.status(400).json({ message: "User Already Registered" });
        return;
      }

      const salt = await bcrypt.genSalt(7);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
      });

      const token = jwt.sign({ username }, process.env.SECRET_TOKEN, {
        expiresIn: "1h",
      });
      await newUser.save();
      res.json({ token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e });
    }
  }
);

app.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.errors[0].msg });
    }

    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ message: "User Not Found" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid Password" });
      }
      const token = jwt.sign(
        { username: user.username },
        process.env.SECRET_TOKEN,
        {
          expiresIn: 360000,
        }
      );
      res.status(200).json({ token });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e });
    }
  }
);

app.get("/protected_route", verifyUser, (req, res) => {
  res.json({ message: "This is a protected route" });
});

app.get("/holdings", verifyUser, async (req, res) => {
  const holdings = await HoldingsModel.find();
  res.json(holdings);
});

app.get("/positions", verifyUser, async (req, res) => {
  const positions = await PositionsModel.find();
  res.json(positions);
});

app.get("/orders", verifyUser, async (req, res) => {
  const orders = await OrdersModel.find();
  res.json(orders);
});

app.post("/buyStock", verifyUser, async (req, res) => {
  const { name, qty, net, price } = req.body;

  try {
    const holding = await HoldingsModel.findOne({ name });

    const newStock = new OrdersModel({
      date: new Date().toLocaleString(),
      name: name,
      price,
      qty: qty,
      net: net,
      mode: "Buy",
    });
    newStock.save();

    if (!holding) {
      const newHolding = new HoldingsModel({
        name: name,
        qty: qty,
        avg: price,
        price: price,
        net: net,
        day: net,
      });
      newHolding.save();
    } else {
      (holding.qty = parseInt(holding.qty) + parseInt(qty)),
        (holding.price = (
          parseFloat(holding.price) +
          parseFloat(price) / 2
        ).toFixed(2));
      holding.net = net;
      holding.save();
    }
    res.status(200).json({
      message: `You successfully purchased ${qty} stocks of ${name} !!`,
    });
  } catch (e) {
    console.error("Error: ", e);
  }
});

app.post("/sellStock", verifyUser, async (req, res) => {
  const { name, qty, price } = req.body;
  const holding = await HoldingsModel.findOne({ name });

  try {
    if (!holding) {
      res.status(400).json({ message: "Stock Doesnot exist in your holdings" });
      return;
    }

    if (holding.qty < qty) {
      res
        .status(400)
        .json({ message: `Please select Quantity less than ${holding.qty}` });
    } else {
      holding.qty -= qty;
      if (holding.qty === 0) {
        await HoldingsModel.deleteOne({ name: name });
      } else {
        await holding.save();
      }
      const newStock = new OrdersModel({
        date: new Date().toLocaleString(),
        name: name,
        price: price,
        qty: qty,
        mode: "Sell",
      });

      await newStock.save();
      res
        .status(200)
        .json({ message: `You successfully sold ${qty} stocks of ${name} !!` });
    }
  } catch (e) {
    res.status(500).json({ message: e });
    console.error(e);
  }
});

const connectDB = async () => {
  await mongoose
    .connect(uri)
    .then(() => console.log("MongoDB Connected..."))
    .catch((e) => console.error("Connection Error: ", e));
};

app.listen(port, () => {
  connectDB();
  console.log(`Server is running in ${port} port`);
});
