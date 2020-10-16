/**
username, type String,
password, type String
campus, type String. Possible values: Madrid, Barcelona, Miami, Paris, Berlin, Amsterdam, México, Sao Paulo, Lisbon,
course, type String. Possible values: Web Dev, UX/UI, Data Analytics.
image, type String.
 */

const { Schema, model, Model } = require('mongoose');
const userSchema = new Schema(
    {
        username: {
            type: String,
            required:true,
        },
         passwordHash: {
            type: String,
            required:true,
        },
        campus: {
            type: String,
            enum: ["Madrid", "Barcelona", "Miami", "Paris", "Berlin", "Amsterdam", "México", "Sao Paulo", "Lisbon"],            
        },
        course: {
            type: String,
            enum:["Web Dev", "UX/UI", "Data Analytics"],
        },
        image: {
            type:String
        }
    },
    {
        timestamps:true,
    });


module.exports = model("IHUSers", userSchema);