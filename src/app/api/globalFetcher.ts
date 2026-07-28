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
        return res.json()
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
        throw new Error("Failed to update data")
    }

    const text = await res.text()
    return text ? JSON.parse(text) : null
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
        if(!res.ok){
            throw new Error("Failed to delete data")
        }
        // The backend DELETE endpoint returns an empty body (204 / 200 with no content).
        // res.json() would throw "Unexpected end of JSON input" on an empty body,
        // which would abort the caller before it can update local state.
        const text = await res.text()
        return text ? JSON.parse(text) : null
    })
}

export {API_BASE_URL, getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher, patchFetcher}