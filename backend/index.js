require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();


const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB = process.env.MONGO_DB;
const BASE_URL = process.env.BASE_URL;


app.use(cors());
app.use(express.json());


mongoose
  .connect(MONGO_URI, { dbName: MONGO_DB })
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.log(" Mongo Error:", err));


const storage = multer.diskStorage({
  destination: process.env.UPLOAD_FOLDER,
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

app.use("/images", express.static(process.env.UPLOAD_FOLDER));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `${BASE_URL}/images/${req.file.filename}`,
  });
});


const Products = mongoose.model("Products", {
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const User = mongoose.model("User", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: { type: Object },
  date: { type: Date, default: Date.now },
});


const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Access Denied" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    res.status(401).send({ errors: "Invalid Token" });
  }
};


app.post("/addproducts", async (req, res) => {
  let products = await Products.find({});
  let id = products.length ? products[products.length - 1].id + 1 : 1;

  const product = new Products({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true, product });
});

app.get("/allproduct", async (req, res) => {
  let products = await Products.find({});
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  let products = await Products.find({});
  let newcollection = products.slice(1).slice(-8);
  res.send(newcollection);
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Products.find({ category: "women" });
  res.send(products.slice(0, 4));
});


app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();

    const token = jwt.sign(
      { user: { id: user._id } },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign(
      { user: { id: user._id, name: user.name, email: user.email } },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
});


app.post("/addcart", fetchUser, async (req, res) => {
  const userData = await User.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;

  await User.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

  res.send("Added");
});

app.post("/removeFromcart", fetchUser, async (req, res) => {
  const userData = await User.findById(req.user.id);

  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;

  await User.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });

  res.send("Removed");
});

app.post("/getcart", fetchUser, async (req, res) => {
  const userData = await User.findById(req.user.id);
  res.json(userData.cartData);
});
app.post("/removeproduct", async (req, res) => {
  try {
    const { id } = req.body;
    await Products.findOneAndDelete({ id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});



app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
