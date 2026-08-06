import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env.local 등에서 ANTHROPIC_API_KEY 로드 (VITE_ 접두사 없이도 읽기 위해 '' 사용)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        // 로컬 개발용: /api/recommend 를 Vercel 함수와 동일 로직으로 처리
        name: 'dev-api-recommend',
        configureServer(server) {
          server.middlewares.use('/api/recommend', async (req, res, next) => {
            if (req.method !== 'POST') return next()
            const send = (status, obj) => {
              res.statusCode = status
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify(obj))
            }
            try {
              const chunks = []
              for await (const c of req) chunks.push(c)
              const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
              const { getRecommendation } = await import('./api/_core.js')
              const text = await getRecommendation(body, env.ANTHROPIC_API_KEY)
              send(200, { text })
            } catch (e) {
              send(e.status || 500, { error: e.message || 'AI 추천에 실패했어요.' })
            }
          })
        },
      },
    ],
  }
})
