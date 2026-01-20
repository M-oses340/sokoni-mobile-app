import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    // 1. Guard Clause: Ensure user has a shipping address
    if (!shippingAddress || !shippingAddress.streetAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "No order items" });
    }

    // 2. Validate products and stock
    for (const item of orderItems) {
      // Accessing item.product._id assumes the frontend sends the object correctly
      const productId = item.product?._id || item.product; 
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({ error: `Product not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
    }

    // 3. Create the Order
    const order = await Order.create({
      user: user._id,
      clerkId: user.clerkId,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
      status: "Processing" // Good practice to set a default status
    });

    // 4. Update product stock (Atomic update)
    const stockUpdates = orderItems.map((item) => 
      Product.findByIdAndUpdate(item.product?._id || item.product, {
        $inc: { stock: -item.quantity },
      })
    );
    await Promise.all(stockUpdates);

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error in createOrder controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserOrders(req, res) {
  try {
    const orders = await Order.find({ clerkId: req.user.clerkId })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    // check if each order has been reviewed

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      })
    );

    res.status(200).json({ orders: ordersWithReviewStatus });
  } catch (error) {
    console.error("Error in getUserOrders controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}