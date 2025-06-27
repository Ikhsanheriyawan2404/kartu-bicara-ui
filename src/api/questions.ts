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

export async function reqTotalQuestion(): Promise<{ total: number }> {
    const res = await fetch(`${API_BASE}/total_question`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error("Request Failed")
    return await res.json()
}

export async function inputQuestion(
    categoryId: number,
    question: string
): Promise<{ id: number; title: string; category_id: number; created_at: string }> {
    const res = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, question }),
    })
    
    if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMessage =
            errData?.reason || errData?.error || "Request gagal";
        
        throw new Error(errorMessage);
    }
    
    const data = await res.json()
    return data.data
}


export async function reqLoadQuestions(
    lastId?: number,
    limit: number = 10
): Promise<{
    id: number;
    title: string;
    category_name: string;
    category_id: number;
    created_at: string;
}[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (lastId) {
        params.append("lastId", lastId.toString());
    }
    
    const res = await fetch(`${API_BASE}/questions?${params.toString()}`);
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Gagal memuat pertanyaan.");
    }
    
    return await res.json();
}
