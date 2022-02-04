const router = require("express").Router();
const passport = require("passport");
const db = require("../db");
const weeds = require("../weed.json");
let weed_data = require("../weeddata.json");

require("../utils/passport-local.js")(passport);

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
    console.log(req.user);
    // if (!req.user) {
    //   console.log("lost track of your user");
    //   res.json({ status: 305 });
    //   return;
    // }
    let weeds = await db.Weed.find().sort({ price: -1 });

    let user = await db.Smoker.findOne({ username: req.user.username });
    console.log(user);
    if (!user) {
      console.log("uh-oh, we lost track of you, redirecting back to /login");
      req.logOut();
      res.redirect("/login");
      return;
    }
    // res.json({ msg: "temp status, under construction" });

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
  // console.log(req.headers);
  let smoker = req.headers["auth-smoker"];
  console.log("ID", req.params.id, smoker);
  let weed = await db.Weed.findOne({ _id: req.params.id });
  console.log("Weed to Add", weed);
  var { weed_name, weed_image, price, quantity, weed_id } = weed;
  var weedObj = { weed_name, weed_image, price, quantity, weed_id };
  let result = await db.Smoker.findOneAndUpdate({
    username: smoker,
    $push: { shopping_cart: weedObj },
  });
  console.log("Result", result);
  res.json({ status: 301, msg: `${weed_name} has been added to your cart 😎` });
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

router.get("/clearcart/:username", (req, res) => {
  db.Smoker.findOneAndUpdate(
    { username: req.params.username },
    { $set: { shopping_cart: [] } }
  ).then((dbuser) => {
    console.log("Clear cart for", dbuser);
    res.json({ user: dbuser, status: "200?" });
  });
});

router.get("/flushweed", (req, res) => {
  // db.Weed.find().then((weeds) => {
  //   weeds.forEach((weed) => {
  //     db.Weed.findOneAndUpdate(
  //       { weed_name: weed.weed_name },
  //       { $set: { weed_id: (Math.random() * 1000) | 0 } }
  //     ).then(() => {
  //       console.log("updated");
  //     });
  //   });
  // });
  res.json({ status: 240 });
});

module.exports = router;
