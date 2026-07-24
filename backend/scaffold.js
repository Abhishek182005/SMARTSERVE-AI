import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  'Restaurant', 'Branch', 'Employee', 'Customer', 'MenuCategory', 'MenuItem',
  'Inventory', 'Supplier', 'PurchaseOrder', 'Table', 'Reservation', 'Order',
  'OrderItem', 'Payment', 'Invoice', 'Review'
];

const createModel = (name) => {
  return `import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('${name}', schema);
`;
};

const createController = (name) => {
  const lowerName = name.toLowerCase();
  return `import ${name} from '../models/${name}.js';

export const get${name}s = async (req, res) => {
  try {
    const data = await ${name}.find();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create${name} = async (req, res) => {
  try {
    const data = await ${name}.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
};

const createRoute = (name) => {
  return `import express from 'express';
import { get${name}s, create${name} } from '../controllers/${name.toLowerCase()}Controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, get${name}s)
  .post(protect, create${name});

export default router;
`;
};

const run = () => {
  const modelsDir = path.join(__dirname, 'models');
  const controllersDir = path.join(__dirname, 'controllers');
  const routesDir = path.join(__dirname, 'routes');

  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir);
  if (!fs.existsSync(controllersDir)) fs.mkdirSync(controllersDir);
  if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);

  models.forEach(name => {
    // Only write if it doesn't exist
    const mPath = path.join(modelsDir, name + '.js');
    const cPath = path.join(controllersDir, name.toLowerCase() + 'Controller.js');
    const rPath = path.join(routesDir, name.toLowerCase() + 'Routes.js');
    
    if(!fs.existsSync(mPath)) fs.writeFileSync(mPath, createModel(name));
    if(!fs.existsSync(cPath)) fs.writeFileSync(cPath, createController(name));
    if(!fs.existsSync(rPath)) fs.writeFileSync(rPath, createRoute(name));
  });

  console.log('Scaffolding complete');
};

run();
