const mongoose  = require ("mongoose");


const taskSchema = mongoose.Schema({
    description:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default:Date.now
    },
    done:{
        type:Boolean,
        default:false
    },
});

module.exports= mongoose.model("Task",taskSchema);