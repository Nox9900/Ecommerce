import mongoose from "mongoose";
import { Hero } from "../models/hero.model.js";
import { Category } from "../models/category.model.js";
import { connectDB } from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const INITIAL_HERO = {
    title: "Summer Sale",
    subtitle: "Up to 50% off on selected items",
    label: "New Collection",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    displayOrder: 1,
    isActive: true,
};

const INITIAL_CATEGORIES = [
    { name: "Electronics", icon: "laptop-outline", displayOrder: 1 },
    { name: "Accessories", icon: "laptop", displayOrder: 2 },
    { name: "Fashion", icon: "shirt-outline", displayOrder: 3 },
    { name: "Sports", icon: "basketball-outline", displayOrder: 4 },
    { name: "Books", icon: "book-outline", displayOrder: 5 },
];

async function seed() {
    try {
        await connectDB();

        console.log("Cleaning old data...");
        await Hero.deleteMany({});
        await Category.deleteMany({});

        console.log("Seeding Hero...");
        await Hero.create(INITIAL_HERO);

        console.log("Seeding Categories...");
        await Category.insertMany(INITIAL_CATEGORIES);

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seed();
