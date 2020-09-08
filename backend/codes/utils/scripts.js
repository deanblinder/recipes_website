
var express = require("express");
var router = express.Router();
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("../modules/DButils");


//--------------user---------------------------------


//return all the info about the my recipe
async function myRecipeInfo(id1) {
    let myRecipe = await DButils.execQuery(`SELECT * FROM recipes WHERE recipe_id = '${id1}'`);
    const {
        recipe_id, author, recipe_name, picture, isVegan, isGlutenFree,timeToMake,likes,ingredients,instructions,isVegi
    } =  myRecipe[0];
    return {
        recipe_id: recipe_id,
        author: author,
        recipe_name: recipe_name,
        picture: picture,
        isVegan: isVegan,
        isGlutenFree: isGlutenFree,
        timeToMake: timeToMake,
        likes: likes,
        ingredients: ingredients,
        instructions: instructions,
        isVegi:isVegi
           }

}

async function myFamilyRecipeInfo(recipeName) {
    let myRecipe = await DButils.execQuery(`SELECT * FROM my_family_recipes WHERE recipe_name = '${recipeName}'`);
    const {
        owner, customary_time, prepare_method, picture, user_id, ingredients,instructions,recipe_name
    } =  myRecipe[0];
    return {
        owner: owner,
        customary_time: customary_time,
        prepare_method: prepare_method,
        picture: picture,
        user_id: user_id,
        ingredients: ingredients,
        instructions: instructions,
        recipe_name:recipe_name
    }

}



function getIngredientsRecipe(ing){
    let ourIngredients = ing.split(",");
    return ourIngredients;
}

function getInstructionsRecipe(ing){
    let ourInstruction = ing.split(".");
    return ourInstruction;
}

//return favorite recipe

async function getFavoriteRecipe(recipe_id,user_id) {
    const favoriteRecipe = await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
    const {
        id, title
    } =  favoriteRecipe.data;
    return {
        id: id,
        title: title,
        user_id: user_id
    }
}



//return all the info about the recipe
async function getRecipeInfo(id1) {

        const lastWatchedRecipes = await axios.get(`${api_domain}/${id1}/information`, {
            params: {
                apiKey: process.env.spooncular_apiKey
            }
        });
        const {
            id, title, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree,image,analyzedInstructions,extendedIngredients,servings
        } =  lastWatchedRecipes.data;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            image: image,
            extendedIngredients: extendedIngredients,
            analyzedInstructions:analyzedInstructions,
            servings:servings

        }

}

async function getFullRecipeInfo(id1) {
let analyzedInstructionsArr=[];
let extendedIngredientsArr=[];
    const lastWatchedRecipes = await axios.get(`${api_domain}/${id1}/information`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
    const {
        analyzedInstructions
    }=lastWatchedRecipes.data;

    const {
        extendedIngredients
    }=lastWatchedRecipes.data;

    analyzedInstructions[0].steps.forEach(instruction=>{
       const {step,num}=instruction;
        analyzedInstructionsArr.push({step: step,number: num});
    });
    extendedIngredients.forEach(Ingredients=>{
        const {amount,unit,name}=Ingredients;
        extendedIngredientsArr.push({amount: amount,unit: unit,name: name});
    });

    const {
        id, title, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree,image,servings
    } =  lastWatchedRecipes.data;
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: aggregateLikes,
        vegetarian: vegetarian,
        vegan: vegan,
        glutenFree: glutenFree,
        image: image,
        extendedIngredientsArr,
        analyzedInstructionsArr,
        servings:servings

    }

}


function getRecipe(id) {
    return axios.get(`${api_domain}/${id}/information`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
}

//--------------recipes---------------------------------



async function extractToListById (search_results) {
    let recipes = search_results.data.results;
    let id_res = [];
    let i=0;
    while(i<recipes.length){
        id_res[i]=recipes[i].id;
        i++
    }

    // recipes.map((recipe) => {
    //     id_res.push(recipe.id);
    // });

    return id_res;
}

 async function searchForRecipes(search_params) {
    let search_response = await axios.get(
        `https://api.spoonacular.com/recipes/search?apiKey=${process.env.spooncular_apiKey}`,
        {
            params: search_params
        }
    );

    const recipes_id_list =await extractToListById(search_response);
    let i=0;
    let info_arr =new Array(recipes_id_list.length);

    while (i<recipes_id_list.length) {
        info_arr[i]=(await getRecipeInfo(recipes_id_list[i]));
        i++;
    }
    return info_arr;
}


  function extractMoreParams(query_params, params) {
    const params_list = ["diet", "cuisine", "intolerance"];
    params_list.forEach((param) => {
        if(query_params[param])
            params[param] = query_params[param];
    });
}




//return 3 rendom
async function getRandom() {
    const random_recipes = await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return random_recipes.data.recipes.map((recipe) => {
        const {
            id, title, readyInMinutes, aggregateLikes, vegetarian, vegan, glutenFree,image
        } = recipe;
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            aggregateLikes: aggregateLikes,
            vegetarian: vegetarian,
            vegan: vegan,
            glutenFree: glutenFree,
            image: image,
            isWatched: 0,
            isInFav:0

        };
    });
}
async function getInstruction(id1){
    const instructionsRecipes = await axios.get(`${api_domain}/${id1}/information`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
    const {
        instructions
    } =  instructionsRecipes.data;
    return {
        instructions: instructions
    }
}


async function getServing(id1){
    const servingsRecipes = await axios.get(`${api_domain}/${id1}/information`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
    const {
        servings
    } =  servingsRecipes.data;
    return {
        servings: servings
    }
}


async function isInLastWatched(recipe_id,userIdToSend){
    let allWatched = await DButils.execQuery(`SELECT recipe_id FROM last_watch_recipes WHERE user_id=${userIdToSend}`);
    let i=0;
    while (i<allWatched.length){
        if(allWatched[i].recipe_id===recipe_id){
            return true;

        }
        i++;
    }
    return false;
}

async function  isInFavorite(recipe_id,myID){

    let allFav = await DButils.execQuery(`SELECT recipe_id FROM my_favorite_recipes where user_id='${myID}'`);
    if(allFav.length===0){
        return false;
    }
    let i=0;
    while (i<allFav.length){
        if(allFav[i].recipe_id===recipe_id){
            return true;
        }
        i++;
    }
    return false;
}
module.exports = {router,getFullRecipeInfo,searchForRecipes,extractMoreParams,getRandom,getRecipeInfo,getIngredientsRecipe,getFavoriteRecipe,isInLastWatched,isInFavorite,myRecipeInfo,getInstructionsRecipe,myFamilyRecipeInfo };