const router = require("express").Router();
const passport = require("passport");
const db = require("../db");
const weeds = require("../weed.json");
let weed_data = require("../weeddata.json");

require("../passport-local.js")(passport);

router.get("/", (req, res) => {
  res.redirect("/login");
});

router.get(
  "/login",
  (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
    next();
  },
  (req, res) => {
    res.render("login");
  }
);

router.get(
  "/dashboard",
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    next();
  },
  async (req, res) => {
    let weeds = await db.Weed.find().sort({ price: -1 });
    let user = await db.Smoker.findOne({ username: req.user.username });
    // console.log(user);
    res.render("dashboard", {
      username: user.username,
      cartItems: user.shopping_cart,
      weeds,
    });
  }
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureFlash: true,
    failureRedirect: "/login",
  })
);

router.post("/addweed", async (req, res) => {
  console.log(req.body);
  let result = await db.Weed.create(req.body.weedItem);
  console.log("Result", result);
  res.redirect("/dashboard");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

router.get("/api/weeds", async (req, res) => {
  res.json({ weeds: await db.Weed.find() });
});

router.get("/populatedb", (req, res) => {
  // weeds.forEach((w) => {
  //   db.Weed.create(w).then((res) => {
  //     console.log("item added");
  //   });
  // });
  res.redirect("/");
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  console.log("category/:category fired", category);
  let data = [];
  switch (category) {
    case "expensive":
      let expensive = await db.Weed.find().sort({ price: -1 });
      data = expensive.slice(0, 10);
      break;

    case "cheapest":
      let cheapest = await db.Weed.find().sort({ price: 1 });
      data = cheapest.slice(0, 10);
      break;

    case "newest":
      let newest = await db.Weed.find().sort();
      data = newest.slice(0, 10);
      break;

    default:
      console.log("unknown param");
  }
  console.log(data);
  res.render("category", { weeds: data, category });
});

// router.get("/cheapest", async (req, res) => {
//   let expensive = await db.Weed.find().sort({ price: 1 });
//   expensive = expensive.slice(0, 10);
//   res.json({ cheapest: await db.Weed.find().sort({ price: 1 }) });
//   res.render("category", { weed: expensive });
// });

router.get("/format", (req, res) => {
  // weed_data = weed_data.map((w) => ({
  //   ...w,
  //   weed_image: weeds[(Math.random() * weeds.length - 1) | 0].weed_image,
  //   weed_name:
  //     Math.random() > 0.5
  //       ? w.weed_name.split(" ")[0]
  //       : w.weed_name.split(" ")[0] + " " + w.weed_name.split(" ")[1],
  // }));
  // weed_data.forEach((w) => {
  //   db.Weed.create(w).then(() => console.log("weed inserted"));
  // });
  // res.json({ weeds: weed_data, inserted: true });
  res.json({ msg: "This route is no loger in service! :(" });
});

router.get("/weedinfo/:id", async (req, res) => {
  console.log(req.params.id);
  let weedInfo = await db.Weed.findOne({ _id: req.params.id });
  res.render("weedInfo", { weedInfo });
  // res.json({ msg: "request for weed info", weed_id: req.params.id });
});

router.get("/addtocart/:id", async (req, res) => {
  // console.log(req.headers["auth-smoker"]);
  let smoker = req.headers["auth-smoker"];
  console.log("ID", req.params.id);
  let weed = await db.Weed.findOne({ _id: req.params.id });
  console.log("Weed to Add", weed);
  res.json({ status: 301, msg: "success, but still under construction" });
  let result = await db.Smoker.findOneAndUpdate({
    username: smoker,
    $push: { shopping_cart: weed },
  });
  console.log("Result", result);
});

router.get("/remove/:id", async (req, res) => {
  let smoker = req.headers["auth-smoker"];
  console.log("ID", req.params.id);

  let dbUser = await db.Smoker.findOne({ username: smoker });
  if (!dbUser) {
    return res.json({ status: 403, msg: "invalid shopper!" });
  } else {
    console.log("dbUSER fired!");
    // dbUser.shopping_cart.map((u) => console.log(u.weed_name));
    // dbUser.shopping_cart.forEach((w) => {
    //   console.log(w.weed_name, req.params.id);
    //   if (w.weed_name === req.params.id) {
    //     console.log("Match!!");
    //   }
    // });
    let hydratedCart = dbUser.shopping_cart.filter(
      (i) => i.weed_id != req.params.id
    );
    console.log("FIlterdCart", hydratedCart);
    let result = await db.Smoker.findOneAndUpdate(
      { username: smoker },
      { $set: { shopping_cart: hydratedCart } }
    );
    console.log("Result", result);
    res.json({ status: 200 });
  }
});

module.exports = router;
