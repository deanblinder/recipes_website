var express = require("express");
var router = express.Router();
const DButils = require("../codes/modules/DButils");
const bcrypt = require("bcrypt");







router.post("/Register", async (req, res, next) => {
    try {
        let userInformation = {
            username: req.body.username,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            country: req.body.country,
            confirmation_password: req.body.confirmation_password,
            email: req.body.email,
            profile_pic: req.body.profile_pic
        }
        const users = await DButils.execQuery("SELECT username FROM users");

        if (users.find((x) => x.username === userInformation.username))
            throw {status: 409, message: "Username taken"};

        // add the new username
        let hash_password = bcrypt.hashSync(
            req.body.password,
            parseInt(process.env.bcrypt_saltRounds)
        );
        await DButils.execQuery(
            //default,
            `INSERT INTO users VALUES ('${req.body.username}', '${hash_password}', '${req.body.first_name}','${req.body.last_name}','${req.body.country}','${req.body.confirmation_password}','${req.body.email}','${req.body.profile_pic}')`
        );
        res.status(201).send({message: "user created", success: true});
    } catch (error) {
        next(error);
    }

});

router.post("/Login", async (req, res, next) => {
    try {
        // check that username exists
        const users = await DButils.execQuery("SELECT username FROM users");
        if (!users.find((x) => x.username === req.body.username))
            throw { status: 401, message: "Username or Password incorrect" };

        // check that the password is correct
        const user = (
            await DButils.execQuery(
                `SELECT * FROM users WHERE username = '${req.body.username}'`
            )
        )[0];
         if (!bcrypt.compareSync(req.body.password, user.password)) {
            throw { status: 401, message: "Username or Password incorrect" };
        }

        // Set cookie
        req.session.user_id = user.user_id;
         req.session.username=user.username;
         req.session.image= user.profile_pic;
        res.status(200).send({ message: "login succeeded", success: true });
    } catch (error) {
        next(error);
    }
    next();
});

router.post("/Logout", function (req, res) {
    req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
    res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;
