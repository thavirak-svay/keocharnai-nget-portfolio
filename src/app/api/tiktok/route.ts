import { NextResponse } from "next/server"

const TIKTOK_TIKWM_PROXY_BASE = "https://r.jina.ai/https://www.tikwm.com/api/?url="
const TIKTOK_OEMBED_PROXY_BASE = "https://r.jina.ai/https://www.tiktok.com/oembed?url="
const TIKTOK_FALLBACK_PROXY_BASE = "https://r.jina.ai/"

type TikTokOEmbed = {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

type TikwmPayload = {
  code?: number
  data?: {
    title?: string
    play_count?: number | string
    cover?: string
    ai_dynamic_cover?: string
    origin_cover?: string
    author?: {
      nickname?: string
    }
  }
}

type MetadataResult = {
  title: string | null
  cover: string | null
  author: string | null
  views: number | null
}

const DEFAULT_HEADERS = {
  "Content-Type": "text/plain",
  "User-Agent": "Mozilla/5.0 (compatible; TikTokPreview/1.0)",
}

const parseJsonSlice = <T>(payload: string): T | null => {
  const jsonStart = payload.indexOf("{")
  const jsonEnd = payload.lastIndexOf("}")

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return null
  }

  const jsonPayload = payload.slice(jsonStart, jsonEnd + 1)

  try {
    return JSON.parse(jsonPayload) as T
  } catch {
    return null
  }
}

const fetchViaOEmbed = async (targetUrl: string): Promise<MetadataResult | null> => {
  const response = await fetch(`${TIKTOK_OEMBED_PROXY_BASE}${encodeURIComponent(targetUrl)}`, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const raw = (await response.text()).trim()
  const parsed = parseJsonSlice<TikTokOEmbed>(raw)

  if (!parsed) {
    return null
  }

  return {
    title: parsed.title ?? null,
    cover: parsed.thumbnail_url ?? null,
    author: parsed.author_name ?? null,
    views: null,
  }
}

const fetchViaFallback = async (targetUrl: string): Promise<MetadataResult | null> => {
  const response = await fetch(`${TIKTOK_FALLBACK_PROXY_BASE}${targetUrl}`, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const markdown = await response.text()
  const titleMatch = /^Title:\s*(.+)$/m.exec(markdown)
  const imageRegex = /!\[[^\]]*]\((https?:\/\/[^\s)]+)\)/g
  const images: string[] = []
  let regexMatch: RegExpExecArray | null = imageRegex.exec(markdown)

  while (regexMatch) {
    images.push(regexMatch[1])
    regexMatch = imageRegex.exec(markdown)
  }

  const cover = images.find((img) => !img.includes("tiktok-loading")) ?? images.find((img) => img.length > 0) ?? null

  const title = titleMatch ? titleMatch[1].trim() : null

  if (!title && !cover) {
    return null
  }

  return {
    title,
    cover,
    author: null,
    views: null,
  }
}

const fetchViaTikwm = async (targetUrl: string): Promise<MetadataResult | null> => {
  const response = await fetch(`${TIKTOK_TIKWM_PROXY_BASE}${encodeURIComponent(targetUrl)}`, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const raw = (await response.text()).trim()
  const parsed = parseJsonSlice<TikwmPayload>(raw)
  const data = parsed?.data

  if (parsed?.code !== 0 || !data) {
    return null
  }

  const { title, play_count, cover, ai_dynamic_cover, origin_cover, author } = data

  let views: number | null = null

  if (typeof play_count === "number") {
    views = play_count
  } else if (typeof play_count === "string") {
    const numeric = Number(play_count)
    views = Number.isFinite(numeric) ? numeric : null
  }

  return {
    title: title ?? null,
    cover: cover ?? ai_dynamic_cover ?? origin_cover ?? null,
    author: author?.nickname ?? null,
    views,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const url = typeof body?.url === "string" ? body.url.trim() : ""

    if (!url) {
      return NextResponse.json({ error: "TikTok URL is required." }, { status: 400 })
    }

    const metadata = (await fetchViaTikwm(url)) ?? (await fetchViaOEmbed(url)) ?? (await fetchViaFallback(url))

    if (!metadata) {
      return NextResponse.json({ error: "TikTok metadata not available." }, { status: 422 })
    }

    return NextResponse.json({
      title: metadata.title,
      cover: metadata.cover,
      author: metadata.author,
      views: metadata.views,
    })
  } catch (error) {
    console.error("[tiktok-metadata]", error)
    return NextResponse.json({ error: "Unexpected error while fetching TikTok metadata." }, { status: 500 })
  }
}
