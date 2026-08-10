import express from 'express';
import { addBook, listBooks, removeBook, toggleStock, toggleFormatStock, allOrders, updateOrderStatus, clearAllOrders } from '../controllers/bookController.js';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';

const bookRouter = express.Router();

// Public / User Routes
bookRouter.get('/list', listBooks);

// Admin Authorized Routes
bookRouter.post('/add', authAdmin, upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), addBook);
bookRouter.post('/remove', authAdmin, removeBook);
bookRouter.post('/toggle-stock', authAdmin, toggleStock);
bookRouter.post('/toggle-format-stock', authAdmin, toggleFormatStock);

// Order Management Routes (Supporting both /orders and /list-orders, /update-status and /status)
bookRouter.get('/orders', authAdmin, allOrders);
bookRouter.get('/list-orders', authAdmin, allOrders);
bookRouter.post('/update-status', authAdmin, updateOrderStatus);
bookRouter.post('/status', authAdmin, updateOrderStatus);
bookRouter.post('/clear-orders', authAdmin, clearAllOrders);

export default bookRouter;
