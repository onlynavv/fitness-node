import { ObjectId } from "mongodb"
import {client} from "./index.js"
import bcrypt from "bcrypt"

async function addCategories(data){
    return await client.db("fitness").collection("category").insertOne(data)
}

async function addActivityType(data){
    return await client.db("fitness").collection("activitytype").insertOne(data)
}

async function addActivity(data){
    return await client.db("fitness").collection("activities").insertOne(data)
}

async function getAllActivities(){
    return await client.db("fitness").collection("activities").find({}).toArray()
}

async function getAllCategories(){
    return await client.db("fitness").collection("category").find({}).toArray()
}

async function getActivityTypeForCat(id){
    return await client.db("fitness").collection("activitytype").find({catId:id}).toArray()
}

async function getActivitiesForType(id){
    return await client.db("fitness").collection("activities").find({typeId:id},{projection: {activityName:1}}).toArray()
}

async function getActivity(id){
    return await client.db("fitness").collection("activities").findOne({"_id":ObjectId(id)})
}

// measurements

async function addMeasurementsType(data){
    return await client.db("fitness").collection("measurementsType").insertOne(data)
}

async function addUsersWeight(userMeasureInfo){
    return await client.db("fitness").collection("userMeasurementsInfo").insertOne(userMeasureInfo)
}

async function updateUsersWeight(userId, weightInfoData){
    console.log(userId, weightInfoData)
    return await client.db("fitness").collection("userMeasurementsInfo").updateOne({userId:userId},{$push:{"weightData":weightInfoData}})
}

// calculate calories burned function

function calcCalorie (t,met, weight){
    return (t*met*3.5*weight) / 200
}

// save user workout
async function saveUserWorkout(data){
    return await client.db("fitness").collection("userActivities").insertOne(data)
}

// get user by id
async function getUserByIdFromMeasurements(userId){
    return await client.db("fitness").collection("userMeasurementsInfo").findOne({userId:userId})
}

// get users latest weight
async function getLatestWeight(userId){
    return await client.db("fitness").collection("userMeasurementsInfo").aggregate([
        {
            $match:{
                "userId":userId
            }
        },
        {
            $unwind:'$weightData'
        },
        {
            $sort:{
                'weightData.dateData': -1
            }
        },
        {
            $limit: 1
        }
    ]).toArray()
}

// get mets value from activity
async function getMetsValue(activityName){
    return await client.db("fitness").collection("activities").findOne({activityName})
}

async function getUserActivity(userId){
    return await client.db("fitness").collection("userActivities").find({userId:userId}).sort({workoutDate:-1}).toArray()
}

async function getUserLatestActivity(userId){
    return await client.db("fitness").collection("userActivities").find({userId:userId}).sort({workoutDate:-1}).limit(1).toArray()
}
// get user activity by date

async function getUserActivityByDate(data){
    return await client.db("fitness").collection("userActivities").aggregate([
        {
            $addFields:{
                stringDate:{$dateToString:{format: "%Y-%m-%d", date:"$workoutDate"}}
            }
        },
        {
            $match:{"stringDate":data}
        },
        {
            $project:{"stringDate":0}
        }
    ]).toArray()
}

async function getCaloriesArr(userId){
    return await client.db("fitness").collection("userActivities").find({userId:userId},{projection: {totalCalories:1, workoutDate:1}}).toArray()
}

// user login & signup

async function getByUserName(username){
    return await client.db("fitness").collection("users").findOne({username:username})
}

async function genPassword(password){
    const NO_OF_ROUNDS = 10
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS)
    console.log(salt)
    const hashedPassword = await bcrypt.hash(password, salt)
    console.log(hashedPassword)
    return hashedPassword
}

async function createUser(data) {
    return await client.db("fitness").collection("users").insertOne(data);
}

export {addCategories, addActivityType, addActivity, getAllActivities, getAllCategories, getActivityTypeForCat, getActivitiesForType, getActivity, getByUserName, genPassword, createUser, addMeasurementsType, addUsersWeight, getUserByIdFromMeasurements, updateUsersWeight, getLatestWeight, getMetsValue, calcCalorie, saveUserWorkout, getUserActivity, getUserActivityByDate, getCaloriesArr, getUserLatestActivity}