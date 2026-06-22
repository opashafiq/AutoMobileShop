// SWR fetcher function

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://localhost:44352'

const getApiUrl = (endpoint: string) =>
  `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

const getFetcher = (url:any) => fetch(url,{
    method:"GET",
    headers:{'browserrefreshed':'false'},
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to fetch the data")
    }
    return res.json()
});


const postFetcher = (url:string,arg:any) => fetch(url,{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(arg)
}).then((res) => {
    if(!res.ok){
        throw new Error("Failed to post data")
    }
    return res.json()
});

const putFetcher = async (url:string, arg:any) => {
    const res = await fetch(url, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(arg),
    })

    if (!res.ok) {
        throw new Error("Failed to update data")
    }

    const text = await res.text()
    return text ? JSON.parse(text) : null
}

const patchFetcher = async (url:string, arg:any) => {
    const res = await fetch(url, {
        method: "PATCH",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(arg),
    })

    if (!res.ok) {
        throw new Error("Failed to update data")
    }

    const text = await res.text()
    return text ? JSON.parse(text) : null
}

const deleteFetcher = (url:string, arg?: any) => {
    const options: RequestInit = {
        method: "DELETE",
        headers: {'Content-Type': 'application/json'},
    }

    if (arg !== undefined) {
        options.body = JSON.stringify(arg)
    }

    return fetch(url, options).then((res) => {
        if(!res.ok){
            throw new Error("Failed to delete data")
        }
        return res.json()
    })
}

export {API_BASE_URL, getApiUrl, getFetcher, postFetcher, putFetcher, deleteFetcher, patchFetcher}