const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/IrnHackProfiles";

mongoose.connect(MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }).then(() =>
        console.log(`Successfully connected to the databse ${MONGODB_URI}`))
            .catch(err => {
                console.error(`An error ocurred trying to connect to the database ${MONGODB_URI}: `,
                    error);
                process.exit(1);
            });

