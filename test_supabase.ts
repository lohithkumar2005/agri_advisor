import { createUser, getUserByEmail } from './database';

async function test() {
  try {
     console.log("Testing Supabase connection...");
     const email = "test" + Date.now() + "@example.com";
     const id = await createUser({
       name: "Test User",
       email: email,
       phone: "1234567890",
       password: "TestingPassword123",
       fieldType: "Wheat",
       landArea: "10 acres"
     });
     console.log("✅ Successfully created user with ID:", id);
     
     const user = await getUserByEmail(email);
     console.log("✅ Successfully fetched back from Supabase:", user.email);
     process.exit(0);
  } catch(e) {
     console.error("❌ Test failed:", e);
     process.exit(1);
  }
}
test();
