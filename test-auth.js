import fetch from "node-fetch";

const API_URL = "http://localhost:50501/api/auth";

async function testAuth() {
  try {
    console.log("🧪 Testing Authentication with Refresh Tokens...\n");

    // Test login
    console.log("1. Testing login...");
    const loginResponse = await fetch(`${API_URL}/login-user`, {
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
    console.log("Login Response:", JSON.stringify(loginData, null, 2));

    if (loginResponse.ok && loginData.success) {
      const { accessToken, refreshToken } = loginData.data;
      console.log("\n✅ Login successful!");
      console.log(
        "Access Token (first 50 chars):",
        accessToken.substring(0, 50) + "..."
      );
      console.log(
        "Refresh Token (first 50 chars):",
        refreshToken.substring(0, 50) + "..."
      );

      // Test access token usage
      console.log("\n2. Testing access token usage...");
      const profileResponse = await fetch(`${API_URL}/get-user-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const profileData = await profileResponse.json();
      console.log("Profile Response Status:", profileResponse.status);
      console.log("Profile Response:", JSON.stringify(profileData, null, 2));

      // Test refresh token endpoint
      console.log("\n3. Testing refresh token endpoint...");
      const refreshResponse = await fetch(`${API_URL}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      const refreshData = await refreshResponse.json();
      console.log("Refresh Response Status:", refreshResponse.status);
      console.log("Refresh Response:", JSON.stringify(refreshData, null, 2));

      if (refreshResponse.ok && refreshData.success) {
        console.log("\n✅ Refresh token endpoint working!");
        console.log(
          "New Access Token (first 50 chars):",
          refreshData.data.accessToken.substring(0, 50) + "..."
        );
        console.log(
          "New Refresh Token (first 50 chars):",
          refreshData.data.refreshToken.substring(0, 50) + "..."
        );
      } else {
        console.log("\n❌ Refresh token failed");
      }
    } else {
      console.log("\n❌ Login failed");
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testAuth();
