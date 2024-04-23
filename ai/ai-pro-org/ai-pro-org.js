addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    // 确保请求是 POST 请求，并且路径正确
    if (request.method === "POST" && new URL(request.url).pathname === "/v1/chat/completions") {
        const url = 'https://multillm.ai-pro.org/api/openai-completion'; // 目标 API 地址
        const headers = new Headers(request.headers);

        // 添加或修改需要的 headers
        headers.set('Content-Type', 'application/json');

        // 获取请求的 body 并解析 JSON
        const requestBody = await request.json();
        const stream = requestBody.stream;  // 获取 stream 参数

        // 构造新的请求
        const newRequest = new Request(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody) // 使用修改后的 body
        });

        try {
            // 向目标 API 发送请求
            const response = await fetch(newRequest);

            // 根据 stream 参数确定响应类型
            if (stream) {
                // 处理流式响应
                const { readable, writable } = new TransformStream();
                response.body.pipeTo(writable);
                return new Response(readable, {
                    headers: response.headers
                });
            } else {
                // 正常返回响应
                return new Response(response.body, {
                    status: response.status,
                    headers: response.headers
                });
            }
        } catch (e) {
            // 如果请求失败，返回错误信息
            return new Response(JSON.stringify({ error: 'Unable to reach the backend API' }), { status: 502 });
        }
    } else {
        // 如果请求方法不是 POST 或路径不正确，返回错误
        return new Response('Not found', { status: 404 });
    }
}
