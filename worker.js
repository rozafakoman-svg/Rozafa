export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Explicitly serve index.html for root path
    if (url.pathname === "/") {
       return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }

    // Serve other assets from the ASSETS binding
    if (env.ASSETS) {
      let response = await env.ASSETS.fetch(request);
      
      // SPA Fallback: If the asset is not found (404) and the path doesn't look like a file (no extension),
      // serve index.html to let React handle the routing.
      if (response.status === 404 && !url.pathname.match(/\.[a-zA-Z0-9]+$/)) {
        response = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
      }
      return response;
    }
    return new Response("Not Found", { status: 404 });
  }
};