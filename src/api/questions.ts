const API_BASE = import.meta.env.VITE_API_URL

export async function reqStartGame(categoryId: number): Promise<{ id: number, title: string }[]> {
    const res = await fetch(`${API_BASE}/game/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
    })
    if (!res.ok) throw new Error("Request Failed")
    return await res.json()
}

export async function inputQuestion(categoryId: number, question: string): Promise<{ id: number, title: string }> {
    const res = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, question }),
    })
    if (!res.ok) throw new Error("Request Failed")
    return await res.json()
}