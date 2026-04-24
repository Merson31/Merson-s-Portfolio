export default {
  async fetch(request, env) {
    // --- FITUR KEAMANAN (CORS ORIGIN PROTECTION) ---
    // Dapatkan asal mula (Origin) dari mana request ini dikirim
    const origin = request.headers.get("Origin");
    
    // Daftar domain yang DIIZINKAN untuk memakai Worker Anda.
    // Jika ada orang yang clone/copy kode Anda ke domain mereka, request akan DITOLAK!
    const allowedOrigins = [
      "https://merson31.github.io", // Domain utama Github Pages Anda
      "http://127.0.0.1:5500",      // Untuk Anda testing lokal (Live Server)
      "http://localhost:5500",      // Untuk Anda testing lokal (Live Server)
      "http://localhost:8000",      // Untuk testing lokal (PHP Server)
      "http://localhost"            // Untuk testing lokal (XAMPP/Laragon)
    ];

    // Jika origin tidak ada di daftar whitelist, tolak mentah-mentah (403 Forbidden)
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response("Akses Ditolak: Domain tidak diizinkan memakai AI Assistant ini.", { status: 403 });
    }

    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          // Hanya kembalikan header origin jika cocok dengan daftar di atas
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Hanya menerima POST request dari frontend
    if (request.method === "POST") {
      try {
        const requestBody = await request.text();
        
        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.CLAUDE_API_KEY, 
            "anthropic-version": "2023-06-01"
          },
          body: requestBody
        });

        const data = await anthropicResponse.text();

        // 3. Kembalikan respons dari Anthropic ke web Anda
        return new Response(data, {
          status: anthropicResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin || "*" 
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": origin || "*"
          }
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
