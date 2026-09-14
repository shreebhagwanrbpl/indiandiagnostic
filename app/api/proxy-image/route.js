export async function GET(request) {
    try {
        const requestUrl = request.url;
        const paramMarker = "?url=";
        const markerIndex = requestUrl.indexOf(paramMarker);

        if (markerIndex === -1) {
            return new Response("Missing url parameter", { status: 400 });
        }

        const rawUrl = requestUrl.substring(markerIndex + paramMarker.length);
        const imageUrl = decodeURIComponent(rawUrl);

        if (!imageUrl) {
            return new Response("Invalid image URL", { status: 400 });
        }

        const res = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
        });

        if (!res.ok) {
            console.error(`Proxy fetch failed with status ${res.status} for URL: ${imageUrl}`);
            return new Response(`Failed to fetch image: ${res.status}`, { status: res.status });
        }

        const arrayBuffer = await res.arrayBuffer();
        const contentType = res.headers.get("content-type") || "image/jpeg";

        return new Response(arrayBuffer, {
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err) {
        console.error("Proxy image server error:", err);
        return new Response("Error fetching image", { status: 500 });
    }
}
