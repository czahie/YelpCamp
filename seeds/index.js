import mongoose from "mongoose";
import cities from "./cities.js";
import { places, descriptors } from "./seedHelpers.js";
import { Campground } from "../models/campgroud.js";
("../models/campground");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const campsNum = 50;

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < campsNum; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: "https://source.unsplash.com/collection/483251",
            descripttion:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi libero nobis, quis iusto maiores minima beatae tempore iste, nihil voluptatum in debitis minus pariatur rem illo similique. Dolorum, nihil dolor!",
            price,
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    console.log(`Generated ${campsNum} camps randomly`);
});
