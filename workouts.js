import express from "express"
import { addCategories,addActivityType,addActivity,getAllActivities,getAllCategories,getActivityTypeForCat,getActivitiesForType, getActivity, getUserByIdFromMeasurements, getLatestWeight, getMetsValue, calcCalorie, saveUserWorkout, getUserActivity, getCaloriesArr, getUserLatestActivity ,getUserSingleActivity, deleteUsersSingleActivity, editAndSaveUserWorkout} from "./helper.js"
const router = express.Router()
import { ObjectId } from "mongodb";
import { auth } from "./customauth.js"

router
.route("/addCategories")
.post(async(request, response)=>{
    
    const result = await addCategories(request.body)
    response.send({msg:"category added", result})
})

router
.route("/addActivityType")
.post(async(request, response)=>{
    
    const result = await addActivityType(request.body)
    response.send({msg:"activity type added", result})
})

router
.route("/addActivities")
.post(async(request, response)=>{
    
    const receivedActivity = request.body
    
    const modifiedActivity = {...receivedActivity, activityLevels: receivedActivity.activityLevels.map((item)=>{return {...item, mets:parseInt(item.mets), id: new ObjectId()}})}
    
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
    
    const {workoutSummary} = request.body
    
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    const userCurrWeight = await getLatestWeight(userId)
    
    let totalCalories = 0
    for(let i = 0; i<workoutSummary.length; i++){
        
        const result = await getMetsValue(workoutSummary[i].activityName)
        
        const data = result.activityLevels.find((item)=>{
            return item.name === workoutSummary[i].levels
        })

        const calories =  calcCalorie(parseInt(workoutSummary[i].duration), data.mets, userCurrWeight[0].weightData.weightInt)
        totalCalories = totalCalories + calories
    }
    
    const resultantData = await saveUserWorkout({...request.body, totalCalories:parseFloat(totalCalories.toFixed(2)), workoutDate: new Date(parseFloat(request.body.workoutDate) * 1000).toISOString()})
    response.send(resultantData)
})

router.route("/editworkout")
.put(auth,async(request, response)=>{
    const userId = request.user.id
    
    const {workoutSummary, workoutId} = request.body
    
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    const userCurrWeight = await getLatestWeight(userId)
    
    let totalCalories = 0
    for(let i = 0; i<workoutSummary.length; i++){
        
        const result = await getMetsValue(workoutSummary[i].activityName)
        
        const data = result.activityLevels.find((item)=>{
            return item.name === workoutSummary[i].levels
        })

        const calories =  calcCalorie(parseInt(workoutSummary[i].duration), data.mets, userCurrWeight[0].weightData.weightInt)
        totalCalories = totalCalories + calories
    }
    
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