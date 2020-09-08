var express = require("express");
var router = express.Router();
const DButils = require("../codes/modules/DButils");
const bcrypt = require("bcrypt");
const axios1 = require("axios");
const axios = require("express");
const api_domain = "https://api.spoonacular.com/recipes";
const script = require("../codes/utils/scripts");


router. use(async function (req, res, next) {
  try{
    if(req.session && req.session.user_id){
      const id = req.session.user_id;
      const user = (await DButils.execQuery(`SELECT * FROM [dbo].[users] WHERE user_id=${id}`));
      if(user.length>0){
        console.log(user[0]);
        req.user = user[0];
        next();
      }
    } else{
      res.sendStatus(401);
    }
  } catch(err) {
    next(err)
  }
});

router.get("/myRecipePreview/id/:id", async (req, res, next) => {
  try {

    let temp=req.params.id;
    const recipe = await script.myRecipeInfo(temp);
    if(recipe){
      res.status(200).send({recipe_id:recipe.recipe_id,  author: recipe.author ,recipe_name: recipe.recipe_name,picture: recipe.picture,readyInMinutes: recipe.isVegan,isVegan: recipe.vegan,isGlutenFree: recipe.isGlutenFree,timeToMake:recipe.timeToMake, likes:recipe.likes,ingredients:recipe.ingredients,instructions:recipe.instructions, isVegi:recipe.isVegi});
    }
    else{
      res.status(404).send("could not find recipe with this id");
    }
  } catch (error) {
    next(error);
  }
});


router.get("/getPersonalRecipePreview",async  (req,res,next)=> {
  try {
    let recipe_id = req.params.id;
    let recipe =await script.getRecipeInfo(recipe_id);
    if(recipe){
      res.status(201).send({recipe});
    }
    else{
      res.status(404).send("recipe not found");
    }
  } catch (error) {
    next(error);
  }
});


router.get("/getPreview",async  (req,res,next)=> {
  try {
   let recipe_id = req.body.recipe_id;
    let recipe =await script.getFullRecipeInfo(recipe_id);
    if(recipe){
      res.status(201).send({recipe});
    }
    else{
      res.status(404).send("recipe not found");
    }
  } catch (error) {
    next(error);
  }
});


router.get("/myFamilyRecipePreview/recipeName/:name", async (req, res, next) => {
  try {
    let temp=req.params.name;
    const recipe = await script.myFamilyRecipeInfo(temp);
    if(recipe){
      res.status(200).send({owner:recipe.owner,  customary_time: recipe.customary_time ,prepare_method: recipe.prepare_method,picture: recipe.picture,user_id: recipe.user_id,ingredients: recipe.ingredients,instructions: recipe.instructions,recipe_name:recipe.recipe_name});
    }
    else{
      res.status(404).send("could not find recipe with this id");
    }
  } catch (error) {
    next(error);
  }
});



router.get('/getMyFamilyRecipes',async (req,res,next)=>{

  try{
    const myFamilyRecipes =await DButils.execQuery( `SELECT * FROM my_family_recipes where user_id='${req.session.user_id}'`);
    let i=0;
    let toSend = [];
    while(i<myFamilyRecipes.length){
      let recipe = {};
      recipe["owner"] =myFamilyRecipes[i].owner;
      recipe["customary_time"] = myFamilyRecipes[i].customary_time;
      recipe["prepare_method"]= myFamilyRecipes[i].prepare_method;
      recipe["picture"]= myFamilyRecipes[i].picture;
      recipe["id"]= myFamilyRecipes[i].user_id;
      recipe["ingredientsRecipe"] = await script.getIngredientsRecipe(myFamilyRecipes[i].ingredients);
      recipe["instructionsRecipe"] = await script.getInstructionsRecipe(myFamilyRecipes[i].instructions);
      recipe["recipe_name"] = myFamilyRecipes[i].recipe_name;
      toSend[i]=recipe;
      i++;
    }
    res.send({familyRecipes: toSend});
  }
  catch (error) {
    next(error)
  }
});

router.get("/lastThreeWatchedRecipes",async  (req,res,next)=> {
    try {
     // let userId = req.session;
      const lastWatchedArr = await DButils.execQuery(`SELECT top 3 recipe_id FROM last_watch_recipes WHERE user_id='${req.session.user_id}'order by watched_time desc  `);
      let toSend=[];
      let len;
      if(lastWatchedArr.length<3){
        len =lastWatchedArr.length;
      }
      else{
        len = 3;
      }
      let i=0;
      while (i<len){
        let t=lastWatchedArr[i].recipe_id;
        toSend[i] = await script.getRecipeInfo(t);
        i++;
      }
      //res.send({toSend});
      res.status(200).send(toSend);
  } catch (error) {
    next(error);
  }
});



router.get("/allLastWatchedRecipesId",async  (req,res,next)=> {
  try {
    // let userId = req.session;
    const lastWatchedArr = await DButils.execQuery(`SELECT recipe_id FROM last_watch_recipes WHERE user_id='${req.session.user_id}'order by watched_time desc  `);
    res.status(200).send(lastWatchedArr);
  } catch (error) {
    next(error);
  }
});




router.get("/getProfilePic",async  (req,res,next)=> {
  try {
    // let userId = req.session;
    const pic = await DButils.execQuery(`SELECT profile_pic FROM users WHERE user_id='${req.session.user_id}'`);
    res.status(200).send(pic);
  } catch (error) {
    next(error);
  }
});

router.get("/allLastWatchedRecipes",async  (req,res,next)=> {
  try {
    // let userId = req.session;
    const lastWatchedArr = await DButils.execQuery(`SELECT recipe_id FROM last_watch_recipes WHERE user_id='${req.session.user_id}'order by watched_time desc  `);
    let toSend=[];
    let len;
    len =lastWatchedArr.length;
    let i=0;
    while (i<len){
      let t=lastWatchedArr[i].recipe_id;
      toSend[i] = await script.getRecipeInfo(t);
      i++;
    }
    res.status(200).send(toSend);
  } catch (error) {
    next(error);
  }
});


router.get("/lastWatchedRecipes",async  (req,res,next)=> {
  try {
    // let userId = req.session;
    const lastWatched = await DButils.execQuery(`SELECT top 1 recipe_id FROM last_watch_recipes WHERE user_id='${req.session.user_id}'order by watched_time desc  `);
    if(lastWatched.length===1){
      let toSend;
      let t=lastWatched[0].recipe_id;
      toSend = await script.getRecipeInfo(t);
      res.status(201).send(toSend);
    }
    else{
      res.status(404).send("recipe not found");
    }
  } catch (error) {
    next(error);
  }
});


router.get("/getMyFavoriteRecipesId", async (req, res, next) => {
  try{
    let myFavorite= await DButils.execQuery(`select recipe_id from my_favorite_recipes where user_id='${req.user.user_id}'`);
    res.status(200).send(myFavorite);

  }
  catch (error) {
    next(error)
  }
});


router.get("/getMyFavoriteRecipes", async (req, res, next) => {
  try{
    //let userId = req.body.user_id;
    let myFamilyRecipes= await DButils.execQuery(`select recipe_id from my_favorite_recipes where user_id='${req.user.user_id}'`);
    let myFavorite=[];
    let dic;
    let i=0;
    while (i<myFamilyRecipes.length){
      let rid=myFamilyRecipes[i].recipe_id;
      dic=[];
      myFavorite[i]=await script.getRecipeInfo(rid);
      i++;
    }

    //res.send({myFavorite});
    res.status(200).send(myFavorite);

  }
  catch (error) {
    next(error)
  }
});

router.get("/getMyPersonalRecipes", async (req, res, next) => {
  try{
    let myPersonalRecipes= await DButils.execQuery(`select * from recipes where author='${req.session.user_id}'`);
    let personalRecipe=[];
    let i=0;
    if(myPersonalRecipes.length>0){
      while (i<myPersonalRecipes.length){
        // let rid=myPersonalRecipes[i].recipe_id;
        // let dic=[];
        //dic[i]=(await script.getRecipeInfo(rid));
        personalRecipe[i]=myPersonalRecipes[i];
        i++;
      }
      res.status(201).send({personalRecipe});
    }
    else {
      res.status(404).send("my recipes not found");
    }


  }
  catch (error) {
    next(error)
  }
});


// logout -------------------
router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});





router.post('/addToFavorite/:id',async (req,res,next)=> {
 try {
   const  recipe_id = req.params.id;
   const myId = req.session.user_id
   let recipeToAdd;
   recipeToAdd =await script.getFavoriteRecipe(recipe_id,myId);
   let recipe_id_to_send=recipeToAdd.id;
   let title_to_send=recipeToAdd.title;
   let user_id_to_send=recipeToAdd.user_id;
   if(!await script.isInFavorite(recipe_id_to_send,myId)){
     await DButils.execQuery(`INSERT INTO my_favorite_recipes  VALUES ('${recipe_id_to_send}','${title_to_send}','${user_id_to_send}') `);
     res.status(200).send({ success: true, message: "inserted successfully" });
   }
   else {
     res.status(401).send({ success: false, message: "already in favorites"});
   }
 }
 catch (error) {
   next(error);
 }
})


router.post('/removeFromFavorite/:id',async (req,res,next)=> {
  try {
    const recipe_id = req.params.id;
    const myId = req.session.user_id
    let recipeToRemove;
    let recipeFound = await DButils.execQuery(`SELECT recipe_id FROM my_favorite_recipes  WHERE (recipe_id=${recipe_id} AND user_id = ${myId})`);
    if(recipeFound.length>0) {
      if (recipeFound[0].recipe_id == recipe_id) {
        await DButils.execQuery(`DELETE FROM my_favorite_recipes  WHERE (recipe_id=${recipe_id} AND user_id = ${myId}) `);
        // recipeToAdd =await script.getFavoriteRecipe(recipe_id,myId);
        res.status(200).send({success: true, message: "deleted successfully"});

      }
      else {
        res.status(401).send({ success: false, message: "not in favorites"});
      }
    }
    else {
      res.status(401).send({ success: false, message: "not in favorites"});
    }
  }
  catch (error) {
    next(error);
  }
})




router.post('/addToLastWatch/:id',async (req,res,next)=> {
  try {
    const  recipe_id = req.params.id;
    const myId = req.session.user_id
    let recipeToAdd;
    let date =Date.now();
    recipeToAdd =await script.getFavoriteRecipe(recipe_id,myId);
    let recipe_id_to_send=recipeToAdd.id;
    let user_id_to_send=recipeToAdd.user_id;
    if(await script.isInLastWatched(recipe_id_to_send,user_id_to_send)){
      await DButils.execQuery(`UPDATE last_watch_recipes  SET watched_time = '${date}' WHERE recipe_id ='${recipe_id_to_send}'  `);
      res.status(200).send({ success: true, message: "updated successfully" });
    }
    else {
      await DButils.execQuery(`INSERT INTO last_watch_recipes  VALUES ('${user_id_to_send}','${recipe_id_to_send}','${date}') `);
      res.status(201).send({ success: true, message: "inserted successfully" });

    }
  }
  catch (error) {
    next(error);
  }
})

module.exports = router;
