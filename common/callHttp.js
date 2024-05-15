const constructRequest = (url, body, method, apiKey) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Notion-Version", "2022-06-28");
    headers.append("Authorization", "Bearer " + apiKey);
    return new Request(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
    });
}

async function callHttp(
    url,
    method,
    apiKey,
    body,
    pageSize = 0,
    maxRetries = 30,
    retryStatusCodes = [408, 409, 429, 500, 502, 503, 504]) {
    let retries = 0;
    let accumulatedResults = [];
    let request = {};
    let hasMore = true

    while (hasMore && retries < maxRetries) {
        try {
            if (accumulatedResults.length === 0) {
                if (method === "GET" && pageSize > 0) {
                    request = constructRequest(`${url}?page_size=${pageSize}`, body, method, apiKey);
                } else if (method === "POST" && pageSize > 0) {
                    body.page_size = pageSize;
                    request = constructRequest(url, body, method, apiKey);
                } else {
                    request = constructRequest(url, body, method, apiKey);
                }
            }
            const response = await fetch(request);
            if (response.ok || !retryStatusCodes.includes(response.status)) {
                const responseBody = await response.json();
                if (responseBody.results) {
                    accumulatedResults = accumulatedResults.concat(responseBody.results);
                }
                if (responseBody.has_more && responseBody.next_cursor && responseBody.next_cursor !== null) {
                    hasMore = true;
                    if (pageSize < 1) pageSize = 100
                    if (method === "GET") {
                        request = constructRequest(`${url}?page_size=${pageSize}&start_cursor=${responseBody.next_cursor}`, undefined, method, apiKey);
                    } else if (method === "POST") {
                        body = {
                            start_cursor: responseBody.next_cursor,
                            page_size: pageSize
                        };
                        request = constructRequest(url, body, method, apiKey);
                    }
                } else if (responseBody.next_url && !responseBody.has_more) {
                    hasMore = false;
                    request = constructRequest(responseBody.next_url, body, method, apiKey)
                } else if (pageSize > 0) {
                    hasMore = false;
                    responseBody.results = accumulatedResults
                    return responseBody;
                } else {
                    return responseBody;
                }
            } else if (retryStatusCodes.includes(response.status)) {
                retries++
            } else {
                break
            };
        } catch (error) {
            return { error: `Request failed: ${error.message}` };
        }

        if (retries > 0) {
            const retryDelay = Math.pow(2, retries - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
    return { error: 'Max retries exceeded' };
}

module.exports = callHttp;