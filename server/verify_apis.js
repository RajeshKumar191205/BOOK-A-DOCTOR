require("dotenv").config();

const API_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("--- Starting API Verification Tests ---");

  try {
    // Test 1: Patient Login
    console.log("\nTest 1: Testing Patient Login...");
    const patientLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "patient@gmail.com", password: "123" })
    });
    
    if (!patientLoginRes.ok) {
      throw new Error(`Patient login failed: ${patientLoginRes.statusText}`);
    }
    
    const patientData = await patientLoginRes.json();
    console.log("✔ Patient login succeeded. Token acquired.");

    // Test 2: Admin Login
    console.log("\nTest 2: Testing Admin Login...");
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@gmail.com", password: "123" })
    });
    
    if (!adminLoginRes.ok) {
      throw new Error(`Admin login failed: ${adminLoginRes.statusText}`);
    }
    
    const adminData = await adminLoginRes.json();
    console.log("✔ Admin login succeeded. Token acquired.");

    // Test 3: Doctor Login
    console.log("\nTest 3: Testing Doctor Login...");
    const doctorLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "doctor@gmail.com", password: "123" })
    });
    
    if (!doctorLoginRes.ok) {
      throw new Error(`Doctor login failed: ${doctorLoginRes.statusText}`);
    }
    
    const doctorData = await doctorLoginRes.json();
    console.log("✔ Doctor login succeeded. Token acquired.");

    // Test 4: Fetch Approved Doctors List
    console.log("\nTest 4: Fetching Approved Doctors...");
    const doctorsRes = await fetch(`${API_URL}/doctors`, {
      headers: { "Authorization": `Bearer ${patientData.token}` }
    });
    
    if (!doctorsRes.ok) {
      throw new Error(`Failed to fetch doctors: ${doctorsRes.statusText}`);
    }
    
    const doctorsList = await doctorsRes.json();
    console.log(`✔ Found ${doctorsList.length} approved doctor(s) in system:`);
    // compatibility support returns flat array or data field, let's accommodate both
    const docArr = Array.isArray(doctorsList) ? doctorsList : doctorsList.data;
    docArr.forEach(doc => {
      console.log(`  - Dr. ${doc.fullName || doc.name} (Specialization: ${doc.specialization}, Fees: ₹${doc.fees})`);
    });

    // Test 5: Verify User Profile (GET /auth/me)
    console.log("\nTest 5: Verifying Patient Profile (/auth/me)...");
    const profileRes = await fetch(`${API_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${patientData.token}` }
    });
    
    if (!profileRes.ok) {
      throw new Error(`Failed to fetch profile: ${profileRes.statusText}`);
    }
    
    const profileData = await profileRes.json();
    // support nested data: profileData or profileData.data
    const profile = profileData.data || profileData;
    const profileRole = profile.type === "admin" ? "admin" : (profile.isdoctor ? "doctor" : "user");
    console.log(`✔ Profile fetched. Name: ${profile.name}, Role: ${profileRole}`);

    console.log("\n=============================================");
    console.log("🎉 ALL REST API VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
    console.log("=============================================");
    process.exit(0);

  } catch (error) {
    console.error("❌ Verification test failed:", error.message);
    process.exit(1);
  }
}

// Small delay to ensure the database auto-seeding finishes
setTimeout(runTests, 1000);
