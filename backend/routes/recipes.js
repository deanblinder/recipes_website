var express = require("express");
var router = express.Router();
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("../codes/modules/DButils");
const bcrypt = require("bcrypt");
const script = require("../codes/utils/scripts");

// get recipe info-----------
router.get("/Information/id/:id", async (req, res, next) => {
  try {

    let temp=req.params.id;
    const recipe = await script.getRecipeInfo(temp);
    if(recipe){
      res.status(200).send({extendedIngredients:recipe.extendedIngredients,  aggregateLikes: recipe.aggregateLikes ,title: recipe.title,image: recipe.image,readyInMinutes: recipe.readyInMinutes,vegan: recipe.vegan,glutenFree: recipe.glutenFree,analyzedInstructions:recipe.analyzedInstructions,servings: recipe.servings});
    }
    else{
      res.status(404).send("could not find recipe with this id");
    }
  } catch (error) {
    next(error);
  }
});


router.get("/getThreeRandomRecipe", async (req, res, next) => {
  try {
    const recipe = await script.getRandom();
    res.status(200).send({recipe});
  } catch (error) {
    next(error);
  }
});
//
// router.get('/ingredients/:id', async(req, res) => {
//   try{
//     const id = req.params.id;
//     let ingredients = await script.getIngrediants(id);
//     res.status(200).send({ingredients,success:true});
//   }catch(error){
//     res.status(404).send({ message: "recipes not found", success: false });
//   }
// });

router.post("/addLikeToRecipe", async function (req, res,next) {
  try{
    let recipe_id = req.body.recipe_id;
    let recipe = await DButils.execQuery(`SELECT recipe_id, likes FROM recipes WHERE recipe_id = '${recipe_id}'`);
    let likes = recipe[0].likes+1;
    await DButils.execQuery(`UPDATE recipes SET likes=${likes} WHERE recipe_id = ${recipe_id}`);
    res.status(200).send('like added');
  }
  catch (error) {
    next(error);
  }

});


router.get("/search/query/:searchQuery/number/:num", async (req, res, next) => {
try{
  // req.params.searchQuery="";
  params = {};
  params.query =req.params.searchQuery;
  params.number =req.params.num;
  params.instructionsRequired =true;
if(!(params.number==5 || params.number==10 || params.number==15)){
  params.number=5;
}
  script.extractMoreParams(req.query, params);

  let recipes_info =  await script.searchForRecipes(params);
  if(recipes_info.length>0) {
    res.status(200).send(recipes_info);
  }
  else {
    res.sendStatus(204);
  }
}
catch (error) {
  next(error);
}
});

module.exports = router;

