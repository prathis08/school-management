import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:50501/api";

async function testDashboardStats() {
  try {
    console.log("🧪 Testing Dashboard Stats API...\n");

    // First, let's test login to get a valid token
    console.log("1. Logging in to get authentication token...");
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com", // Replace with a valid test user
        password: "password123", // Replace with valid password
      }),
    });

    const loginData = await loginResponse.json();
    console.log("Login Response Status:", loginResponse.status);

    if (!loginResponse.ok || !loginData.success) {
      console.log(
        "❌ Login failed. Please ensure you have valid test credentials."
      );
      console.log("Login Response:", JSON.stringify(loginData, null, 2));
      return;
    }

    const { accessToken } = loginData.data;
    console.log("✅ Login successful!\n");

    // Now test the dashboard stats endpoint
    console.log("2. Testing dashboard stats endpoint...");
    const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const statsData = await statsResponse.json();
    console.log("Dashboard Stats Response Status:", statsResponse.status);
    console.log(
      "Dashboard Stats Response:",
      JSON.stringify(statsData, null, 2)
    );

    if (statsResponse.ok && statsData.success) {
      console.log("\n✅ Dashboard stats retrieved successfully!");
      console.log("📊 Statistics:");
      console.log(`  - Total Classes: ${statsData.data.totalClasses}`);
      console.log(`  - Total Students: ${statsData.data.totalStudents}`);
      console.log(`  - Total Teachers: ${statsData.data.totalTeachers}`);
    } else {
      console.log("❌ Dashboard stats request failed");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Test without authentication (should fail)
async function testDashboardStatsWithoutAuth() {
  try {
    console.log(
      "\n3. Testing dashboard stats without authentication (should fail)..."
    );
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.status === 401) {
      console.log("✅ Correctly rejected unauthenticated request");
    } else {
      console.log("❌ Expected 401 status for unauthenticated request");
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Run the tests
(async () => {
  await testDashboardStats();
  await testDashboardStatsWithoutAuth();
})();
