// SWR fetcher function

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://localhost:44352'

const getApiUrl = (endpoint: string) =>
  `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

const getFetcher = (url:any) => {
    const headers: Record<string,string> = {'browserrefreshed':'false'}
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('NEXT_AUTH_TOKEN')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(url, { method: 'GET', headers }).then((res) => {
        if(!res.ok){
            throw new Error("Failed to fetch the data")
        }
        return res.json()
    })
}


const postFetcher = (url:string,arg:any) => {
    const headers: Record<string,string> = {'Content-Type':'application/json'}
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('NEXT_AUTH_TOKEN')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(url, { method: 'POST', headers, body: JSON.stringify(arg) }).then(async (res) => {
        if(!res.ok){
            // Surface the server-provided error message and HTTP status code
            // (e.g. 400, 500) instead of a generic "Failed to post data", so
            // callers can display the real cause of the failure.
            let serverMessage = ''
            try {
                const text = await res.text()
                if (text) {
                    // Try to parse a structured error body first, then fall
                    // back to raw text for non-JSON responses.
                    try {
                        const parsed = JSON.parse(text)
                        serverMessage =
                            parsed?.msg ||
                            parsed?.message ||
                            parsed?.detail ||   // ProblemDetails.detail
                            parsed?.error?.message ||
                            parsed?.error ||
                            parsed?.title ||   // ProblemDetails.title
                            (typeof parsed === 'string' ? parsed : '') ||
                            ''
                    } catch {
                        serverMessage = text
                    }
                }
            } catch {
                // Response body could not be read; ignore and use status text.
            }
            const err = new Error(
                serverMessage
                    ? `Server error ${res.status}: ${serverMessage}`
                    : `Failed to post data (HTTP ${res.status}: ${res.statusText})`
            )
            // Attach metadata for callers that want to inspect it directly.
            ;(err as any).status = res.status
            ;(err as any).serverMessage = serverMessage
            throw err
        }
        // Some endpoints (e.g. ApplicationUser/changepassword) reply 200 with
        // an empty body, on which res.json() would throw. Read the text first
        // and only parse when there is content (same approach as putFetcher).
        const text = await res.text()
        if (!text) return null
        try {
            return JSON.parse(text)
        } catch {
            return text
        }
    })
}

const putFetcher = async (url:string, arg:any) => {
    const headers: Record<string,string> = {'Content-Type':'application/json'}
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('NEXT_AUTH_TOKEN')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(arg),
    })

    if (!res.ok) {
        // Surface the server-provided error message instead of a generic
        // "Failed to update data" (same extraction as deleteFetcher).
        let serverMessage = ''
        try {
            const text = await res.text()
            if (text) {
                try {
                    const parsed = JSON.parse(text)
                    serverMessage =
                        parsed?.msg ||
                        parsed?.message ||
                        parsed?.detail ||   // ProblemDetails.detail
                        parsed?.error?.message ||
                        parsed?.error ||
                        parsed?.title ||    // ProblemDetails.title
                        (typeof parsed === 'string' ? parsed : '') ||
                        ''
                } catch {
                    serverMessage = text
                }
            }
        } catch {
            // Response body could not be read; ignore and use status text.
        }
        const err = new Error(
            serverMessage
                ? serverMessage
                : `Failed to update data (HTTP ${res.status}: ${res.statusText})`
        )
        ;(err as any).status = res.status
        ;(err as any).serverMessage = serverMessage
        throw err
    }

    // The backend can also report a failed update inside an HTTP 200 body
    // using the project's response convention { status: 400 | 404, msg } —
    // treat that as an error so callers don't mistake it for success.
    let successBody: any = null
    try {
        const text = await res.text()
        if (text) {
            try { successBody = JSON.parse(text) } catch { successBody = text }
        }
    } catch {
        // Response body could not be read; treat as empty success.
    }

    const bodyStatus = typeof successBody?.status === 'number' ? successBody.status : undefined
    if (bodyStatus !== undefined && bodyStatus >= 400) {
        const msg = successBody?.msg || successBody?.message || ''
        const err = new Error(msg ? msg : `Failed to update data (HTTP ${res.status})`)
        ;(err as any).status = bodyStatus
        ;(err as any).serverMessage = msg
        throw err
    }

    return successBody
}

const patchFetcher = async (url:string, arg:any) => {
    const headers: Record<string,string> = {'Content-Type':'application/json'}
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('NEXT_AUTH_TOKEN')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(arg),
    })

    if (!res.ok) {
        throw new Error("Failed to update data")
    }

    const text = await res.text()
    return text ? JSON.parse(text) : null
}

const deleteFetcher = (url:string, arg?: any) => {
    const headers: Record<string,string> = {'Content-Type':'application/json'}
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('NEXT_AUTH_TOKEN')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    const options: RequestInit = { method: "DELETE", headers }

    if (arg !== undefined) {
        options.body = JSON.stringify(arg)
    }

    return fetch(url, options).then(async (res) => {
        // Read the body once, then reuse it: the backend DELETE endpoints
        // return an empty body on success (204 / 200 with no content), so
        // res.json() would throw "Unexpected end of JSON input".
        let body: any = null
        let serverMessage = ''
        try {
            const text = await res.text()
            if (text) {
                try {
                    const parsed = JSON.parse(text)
                    body = parsed
                    // Same extraction as postFetcher so the real cause
                    // (e.g. "record is referenced by..." on a 400/409) is
                    // available to the caller.
                    serverMessage =
                        parsed?.msg ||
                        parsed?.message ||
                        parsed?.detail ||   // ProblemDetails.detail
                        parsed?.error?.message ||
                        parsed?.error ||
                        parsed?.title ||    // ProblemDetails.title
                        (typeof parsed === 'string' ? parsed : '') ||
                        ''
                } catch {
                    // Non-JSON response (e.g. plain text).
                    body = text
                    serverMessage = text
                }
            }
        } catch {
            // Response body could not be read; fall back to status text.
        }

        // The backend also reports failures inside an HTTP 200 body using the
        // project's response convention { status: 400 | 404, msg } — treat a
        // 4xx/5xx status field as a failure even when the HTTP status is 200.
        const bodyStatus = typeof body?.status === 'number' ? body.status : undefined
        const bodyIndicatesFailure = bodyStatus !== undefined && bodyStatus >= 400

        if (!res.ok || bodyIndicatesFailure) {
            const err = new Error(
                serverMessage
                    ? serverMessage
                    : `Failed to delete data (HTTP ${res.status}: ${res.statusText})`
            )
            // Attach metadata for callers that want to inspect it directly.
            ;(err as any).status = bodyIndicatesFailure ? bodyStatus : res.status
            ;(err as any).serverMessage = serverMessage
            throw err
        }

        return body
    })
}

export {API_BASE_URL, getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher, patchFetcher}