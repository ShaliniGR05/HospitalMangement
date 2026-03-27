const API_URL = "http://127.0.0.1:8000";

async function run() {
  const loginRes = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "username=Shalini&password=password_1"
  });
  
  const loginData = await loginRes.json();
  if (!loginData.access_token) {
    console.error("Login failed", loginData);
    return;
  }
  
  const token = loginData.access_token;
  
  const appsRes = await fetch(`${API_URL}/appointments`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  const apps = await appsRes.json();
  console.log("Appointments response structure:", JSON.stringify(apps, null, 2).substring(0, 1000));
}

run();
