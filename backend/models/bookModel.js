import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    sizes: { type: Array, default: ["Paperback"] }, // Format / Sizes: ["Paperback", "Hardcover", "E-Book"]
    outOfStockSizes: { type: Array, default: [] }, // Specific formats out of stock: ["Hardcover"]
    image: { type: mongoose.Schema.Types.Mixed, required: true }, // Accepts both String URL or Array of URLs
    inStock: { type: Boolean, default: true },
    date: { type: Number, required: true }
});

const bookModel = mongoose.models.book || mongoose.model("book", bookSchema);
export default bookModel;
