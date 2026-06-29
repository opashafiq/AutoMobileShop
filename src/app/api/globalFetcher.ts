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

    return fetch(url, { method: 'POST', headers, body: JSON.stringify(arg) }).then((res) => {
        if(!res.ok){
            throw new Error("Failed to post data")
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