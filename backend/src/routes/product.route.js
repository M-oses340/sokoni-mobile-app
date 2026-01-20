import { Router } from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js"; // Import both
import { 
  getAllProducts, 
  createProduct, 
  deleteProduct 
} from "../controllers/admin.controller.js";
import { getProductById } from "../controllers/product.controller.js";

const router = Router();

// ✅ PUBLIC: Anyone can see the list and details
router.get("/", getAllProducts); 
router.get("/:id", getProductById);

// ⛔ PRIVATE: Only Admins can add or delete products
// (Note: You'll need to add these routes once you're ready)
router.post("/create", protectRoute, adminOnly, createProduct);
router.delete("/:id", protectRoute, adminOnly, deleteProduct);

export default router;