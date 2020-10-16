const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, 
        ref: "IHUSers",
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        index:{ expires:1000*60*15}
    }
});

module.exports = model("Session", sessionSchema);
