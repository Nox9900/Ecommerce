import { Hero } from "../models/hero.model.js";

// Public: Get the most relevant active hero section
export async function getActiveHero(req, res) {
    try {
        const hero = await Hero.findOne({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json(hero);
    } catch (error) {
        console.error("Error fetching active hero:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Get all hero sections
export async function getAllHeroes(req, res) {
    try {
        const heroes = await Hero.find().sort({ displayOrder: 1 });
        res.status(200).json(heroes);
    } catch (error) {
        console.error("Error fetching all heroes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Create hero section
export async function createHero(req, res) {
    try {
        const hero = await Hero.create(req.body);
        res.status(201).json(hero);
    } catch (error) {
        console.error("Error creating hero:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Update hero section
export async function updateHero(req, res) {
    try {
        const { id } = req.params;
        const hero = await Hero.findByIdAndUpdate(id, req.body, { new: true });
        if (!hero) return res.status(404).json({ message: "Hero not found" });
        res.status(200).json(hero);
    } catch (error) {
        console.error("Error updating hero:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// Admin: Delete hero section
export async function deleteHero(req, res) {
    try {
        const { id } = req.params;
        const hero = await Hero.findByIdAndDelete(id);
        if (!hero) return res.status(404).json({ message: "Hero not found" });
        res.status(200).json({ message: "Hero deleted successfully" });
    } catch (error) {
        console.error("Error deleting hero:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
