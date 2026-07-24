import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pairs = [
  { route: 'notificationRoutes.js', controller: 'notificationController.js' },
  { route: 'payrollRoutes.js', controller: 'employeeController.js' },
  { route: 'attendanceRoutes.js', controller: 'employeeController.js' },
  { route: 'loyaltyRoutes.js', controller: 'loyaltyController.js' },
  { route: 'financialRoutes.js', controller: 'financialController.js' },
  { route: 'analyticsRoutes.js', controller: 'analyticsController.js' },
  { route: 'branchRoutes.js', controller: 'branchController.js' },
  { route: 'supplierRoutes.js', controller: 'supplierController.js' },
  { route: 'reviewRoutes.js', controller: 'reviewController.js' },
  { route: 'inventoryRoutes.js', controller: 'inventoryController.js' },
  { route: 'tableRoutes.js', controller: 'tableController.js' },
  { route: 'reservationRoutes.js', controller: 'reservationController.js' },
  { route: 'orderRoutes.js', controller: 'orderController.js' },
  { route: 'paymentRoutes.js', controller: 'paymentController.js' },
  { route: 'promotionRoutes.js', controller: 'promotionController.js' },
  { route: 'reportRoutes.js', controller: 'reportController.js' },
  { route: 'dashboardRoutes.js', controller: 'dashboardController.js' },
  { route: 'employeeRoutes.js', controller: 'employeeController.js' },
  { route: 'customerRoutes.js', controller: 'customerController.js' },
  { route: 'restaurantRoutes.js', controller: 'restaurantController.js' },
  { route: 'menucategoryRoutes.js', controller: 'menucategoryController.js' },
  { route: 'menuitemRoutes.js', controller: 'menuitemController.js' },
  { route: 'aiRoutes.js', controller: 'aiController.js' },
  { route: 'purchaseorderRoutes.js', controller: 'purchaseorderController.js' }
];

const results = [];

pairs.forEach(pair => {
  const routePath = path.join(__dirname, 'routes', pair.route);
  const controllerPath = path.join(__dirname, 'controllers', pair.controller);
  
  if (!fs.existsSync(routePath) || !fs.existsSync(controllerPath)) {
    console.log(`Missing file for ${pair.route} or ${pair.controller}`);
    return;
  }
  
  const routeContent = fs.readFileSync(routePath, 'utf8');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  
  // Extract imports from route
  const importRegex = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]\\.\\./controllers/${pair.controller}['"]`, 'g');
  let match;
  let importedFuncs = [];
  while ((match = importRegex.exec(routeContent)) !== null) {
    importedFuncs = importedFuncs.concat(match[1].split(',').map(s => s.trim()).filter(s => s));
  }
  
  // Check if no import found with explicit name, try just matching 'import { ... } from "../controllers/..."'
  if (importedFuncs.length === 0) {
     const anyImportRegex = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"].*?${pair.controller}['"]`, 'g');
     while ((match = anyImportRegex.exec(routeContent)) !== null) {
       importedFuncs = importedFuncs.concat(match[1].split(',').map(s => s.trim()).filter(s => s));
     }
  }

  // Find line of import
  const importLineMatch = routeContent.match(new RegExp(`import\\s+\\{[^}]+\\}\\s+from\\s+['"].*?${pair.controller}['"]`));
  const importLine = importLineMatch ? importLineMatch[0] : 'NO IMPORT FOUND';
  
  // Extract exports from controller
  const exportRegex = /export\s+const\s+([a-zA-Z0-9_]+)\s*=/g;
  let exportedFuncs = [];
  let exMatch;
  while ((exMatch = exportRegex.exec(controllerContent)) !== null) {
    exportedFuncs.push(exMatch[1]);
  }
  
  // Also check protect middleware
  const hasProtect = routeContent.includes('protect');
  
  const mismatches = importedFuncs.filter(f => !exportedFuncs.includes(f));
  
  results.push({
    route: pair.route,
    controller: pair.controller,
    mismatches,
    importedFuncs,
    exportedFuncs,
    importLine,
    hasProtect
  });
});

console.log(JSON.stringify(results, null, 2));
