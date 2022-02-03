import express from "express"
import { addCategories,addActivityType,addActivity,getAllActivities,getAllCategories,getActivityTypeForCat,getActivitiesForType, getActivity, getUserByIdFromMeasurements, getLatestWeight, getMetsValue, calcCalorie, saveUserWorkout, getUserActivity, getCaloriesArr, getUserLatestActivity ,getUserSingleActivity, deleteUsersSingleActivity, editAndSaveUserWorkout} from "./helper.js"
const router = express.Router()
import { ObjectId } from "mongodb";
import { auth } from "./customauth.js"
import cors from "cors"

const app = express()
app.use(cors())

router
.route("/addCategories")
.post(async(request, response)=>{
    console.log(request.body)
    const result = await addCategories(request.body)
    response.send({msg:"category added", result})
})

router
.route("/addActivityType")
.post(async(request, response)=>{
    console.log(request.body)
    const result = await addActivityType(request.body)
    response.send({msg:"activity type added", result})
})

router
.route("/addActivities")
.post(async(request, response)=>{
    console.log(request.body)
    const receivedActivity = request.body
    console.log(receivedActivity)
    const modifiedActivity = {...receivedActivity, activityLevels: receivedActivity.activityLevels.map((item)=>{return {...item, mets:parseInt(item.mets), id: new ObjectId()}})}
    console.log(modifiedActivity)
    const result = await addActivity(modifiedActivity)
    response.send({msg:"activity added", result, modifiedActivity})
})

router.route("/getAllActivities")
.get(async(request, response)=>{
    const data = await getAllActivities()
    response.send({msg:"received all activities", data})
})

router.route("/getAllCategories")
.get(async(request, response)=>{
    const data = await getAllCategories()
    response.send({msg:"received all categories", data})
})

router.route("/getActivityTypeForCat/:id")
.get(async(request, response)=>{
    const {id} = request.params
    const data = await getActivityTypeForCat(id)
    response.send(data)
})

router.route("/getActivitiesForType/:id")
.get(async(request, response)=>{
    const {id} = request.params
    const data = await getActivitiesForType(id)
    response.send(data)
})

router.route("/getActivity/:id")
.get(async(request, response)=>{
    const {id} = request.params
    const data = await getActivity(id)
    response.send(data)
})

router.route("/getUserSingleActivity/:id")
.get(auth, async(request, response)=>{
    const {id} = request.params
    const result = await getUserSingleActivity(id)
    response.send(result)
})

router.route("/saveworkout")
.post(auth,async(request, response)=>{
    const userId = request.user.id
    console.log(request.user)
    console.log(request.body)
    const {workoutSummary} = request.body
    console.log(workoutSummary)
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    const userCurrWeight = await getLatestWeight(userId)
    console.log(userFromMeasureInfo)
    console.log(userCurrWeight[0].weightData.weightInt, "77")
    let totalCalories = 0
    for(let i = 0; i<workoutSummary.length; i++){
        console.log(workoutSummary[i])
        const result = await getMetsValue(workoutSummary[i].activityName)
        console.log(result, "83")
        const data = result.activityLevels.find((item)=>{
            return item.name === workoutSummary[i].levels
        })

        const calories =  calcCalorie(parseInt(workoutSummary[i].duration), data.mets, userCurrWeight[0].weightData.weightInt)
        totalCalories = totalCalories + calories
    }
    console.log(totalCalories.toFixed(2))
    console.log({...request.body, totalCalories:parseFloat(totalCalories.toFixed(2)), workoutDate: new Date(parseFloat(request.body.workoutDate) * 1000).toISOString()})
    const resultantData = await saveUserWorkout({...request.body, totalCalories:parseFloat(totalCalories.toFixed(2)), workoutDate: new Date(parseFloat(request.body.workoutDate) * 1000).toISOString()})
    response.send(resultantData)
})

router.route("/editworkout")
.put(auth,async(request, response)=>{
    const userId = request.user.id
    console.log(request.user)
    console.log(request.body)
    const {workoutSummary, workoutId} = request.body
    console.log(workoutSummary)
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    const userCurrWeight = await getLatestWeight(userId)
    console.log(userFromMeasureInfo)
    console.log(userCurrWeight[0].weightData.weightInt, "77")
    let totalCalories = 0
    for(let i = 0; i<workoutSummary.length; i++){
        console.log(workoutSummary[i])
        const result = await getMetsValue(workoutSummary[i].activityName)
        console.log(result, "83")
        const data = result.activityLevels.find((item)=>{
            return item.name === workoutSummary[i].levels
        })

        const calories =  calcCalorie(parseInt(workoutSummary[i].duration), data.mets, userCurrWeight[0].weightData.weightInt)
        totalCalories = totalCalories + calories
    }
    console.log(totalCalories.toFixed(2))
    console.log({totalCalories:parseFloat(totalCalories.toFixed(2))})
    const resultantData = await editAndSaveUserWorkout({workoutSummary, totalCalories:parseFloat(totalCalories.toFixed(2))}, workoutId)
    response.send(resultantData)
})

router.route("/getUserActivity")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const result = await getUserActivity(userId)
    response.send(result)
})

router.route("/getCalories")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const result = await getCaloriesArr(userId)
    response.send(result)
})

router.route("/getUserLatestActivity")
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const result = await getUserLatestActivity(userId)
    response.send(result)
})

router.route("/deleteUserSingleActivity/:id")
.delete(auth, async(request, response)=>{
    const {id} = request.params
    const result = await deleteUsersSingleActivity(id)
    response.send(result)
})

export const workoutRouter = router