import { connectToDatabase } from "../src/lib/mongodb";
import Review from "../src/models/Review";
import User from "../src/models/User";
import dotenv from "dotenv";

dotenv.config();

async function seedReviews() {
  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB");

    // Get a real user from the database
    const user = await User.findOne({ role: "user" });
    
    if (!user) {
      console.log("❌ No user found. Please create a user first.");
      process.exit(1);
    }

    console.log(`👤 Using user: ${user.email}`);

    // Sample reviews
    const sampleReviews = [
      {
        userId: user._id.toString(),
        rating: 5,
        content: "Alifat Connect is incredibly fast and reliable. I buy data and pay bills within seconds. The platform is intuitive and the transactions are always processed instantly.",
        status: "approved",
        isFeatured: true,
        displayName: "Adebayo T.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "The platform is simple to use, and transactions are always processed instantly. I've been using it for months and never had any issues. Highly recommended!",
        status: "approved",
        isFeatured: true,
        displayName: "Chioma E.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "I trust Alifat Connect for all my daily transactions. The service is excellent and their customer support is always responsive. Best VTU platform I've used.",
        status: "approved",
        isFeatured: true,
        displayName: "Ibrahim M.",
      },
      {
        userId: user._id.toString(),
        rating: 4,
        content: "Wallet funding is seamless, and I love how secure the platform feels. The only improvement I would suggest is adding more payment options.",
        status: "approved",
        isFeatured: false,
        displayName: "Blessing O.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "One of the best VTU platforms I've used. Fast, affordable, and dependable. The data bundles are reasonably priced and activation is instant.",
        status: "approved",
        isFeatured: false,
        displayName: "Samuel A.",
      },
      {
        userId: user._id.toString(),
        rating: 4,
        content: "Their customer support is responsive, and every transaction goes through smoothly. Great service overall!",
        status: "approved",
        isFeatured: false,
        displayName: "Fatima U.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "I've tried many VTU platforms but Alifat Connect stands out. The interface is clean, transactions are fast, and the rates are competitive.",
        status: "approved",
        isFeatured: false,
        displayName: "Emeka O.",
      },
      {
        userId: user._id.toString(),
        rating: 4,
        content: "Very reliable service. I use it for all my airtime and data purchases. The only minor issue is sometimes the app can be slow to load.",
        status: "approved",
        isFeatured: false,
        displayName: "Grace N.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "Excellent platform! The data bundles are affordable and activation is instant. I've recommended it to all my friends and family.",
        status: "approved",
        isFeatured: false,
        displayName: "Oluwaseun A.",
      },
      {
        userId: user._id.toString(),
        rating: 3,
        content: "Good service overall but there's room for improvement. Sometimes transactions take longer than expected during peak hours.",
        status: "approved",
        isFeatured: false,
        displayName: "Chinedu I.",
      },
      {
        userId: user._id.toString(),
        rating: 5,
        content: "Alifat Connect has made my life so much easier. I can buy data and airtime from anywhere at any time. The mobile app is fantastic!",
        status: "approved",
        isFeatured: false,
        displayName: "Adewale K.",
      },
      {
        userId: user._id.toString(),
        rating: 4,
        content: "Solid platform with good customer service. The rates are fair and the platform is easy to navigate. Would recommend to others.",
        status: "approved",
        isFeatured: false,
        displayName: "Ngozi O.",
      },
    ];

    // Clear existing reviews (optional - comment out if you want to keep existing reviews)
    await Review.deleteMany({});
    console.log("🗑️ Cleared existing reviews");

    // Insert sample reviews
    const insertedReviews = await Review.insertMany(sampleReviews);
    console.log(`✅ Inserted ${insertedReviews.length} sample reviews`);

    console.log("\n📊 Review Statistics:");
    const approvedCount = await Review.countDocuments({ status: "approved" });
    const featuredCount = await Review.countDocuments({ status: "approved", isFeatured: true });
    console.log(`   Total approved reviews: ${approvedCount}`);
    console.log(`   Featured reviews: ${featuredCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
    process.exit(1);
  }
}

seedReviews();
