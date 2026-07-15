<template>
  <div :class="$style.container">
    <header :class="$style.header">
      <h1>听歌识曲</h1>
      <p>识别电脑正在播放的声音或上传音频文件</p>
    </header>

    <section :class="$style.stage">
      <button type="button" :class="[$style.microphone, { [$style.listening]: phase == 'recording' }]" aria-label="开始听歌识曲" @click="startRecognition">
        <span /><span />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="3" width="8" height="13" rx="4" />
          <path d="M5.5 11.5v1a6.5 6.5 0 0 0 13 0v-1M12 19v3M8.5 22h7M9 8h2M13 8h2M9 11h2M13 11h2" />
        </svg>
      </button>
      <p :class="$style.message">{{ message }}</p>
      <div v-if="phase == 'recording'" :class="$style.meter"><i :style="{ width: progress + '%' }" /></div>
    </section>

    <div v-if="results.length" :class="$style.results">
      <button v-for="item in results" :key="item.song.id" type="button" @click="openResult(item)">
        <strong>{{ item.song.name }}</strong>
        <span>{{ artistName(item.song) }}<template v-if="item.song.album?.name"> · {{ item.song.album.name }}</template></span>
      </button>
    </div>

    <footer :class="$style.actions">
      <button type="button" :class="$style.start" :disabled="busy" aria-label="开始识别" @click="startRecognition">
        <svg v-if="!busy" viewBox="0 0 24 24"><path d="m9 7 8 5-8 5z" /></svg>
        <i v-else />
      </button>
      <label :class="$style.upload">
        <svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" /></svg>
        <span>上传文件</span>
        <input type="file" accept="audio/*" :disabled="busy" @change="handleFile" />
      </label>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from '@common/utils/vueTools'
import { useRouter } from '@common/utils/vueRouter'
import { sync } from '@renderer/store'

interface MatchSong {
  id: number | string
  name: string
  album?: { name?: string }
  artists?: Array<{ name?: string }>
  ar?: Array<{ name?: string }>
}
interface MatchItem { song: MatchSong }

const captureSeconds = 3
const phase = ref<'idle' | 'recording' | 'matching' | 'done' | 'error'>('idle')
const message = ref('点击下方按钮开始')
const progress = ref(0)
const results = ref<MatchItem[]>([])
const busy = computed(() => phase.value == 'recording' || phase.value == 'matching')
const router = useRouter()
let stream: MediaStream | null = null
let audioContext: AudioContext | null = null
let timer: ReturnType<typeof setInterval> | null = null
let fingerprintLoader: Promise<void> | null = null

const apiRoot = () => `${(sync.client.host || 'https://music.nas.embyovo.top').replace(/\/+$/, '')}/api/netease`
const loadScript = async(src: string, id: string) => {
  await new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.onload = () => { resolve() }
    script.onerror = () => { reject(new Error('听歌识曲组件加载失败')) }
    document.head.appendChild(script)
  })
}
const loadFingerprint = async() => {
  fingerprintLoader ??= (async() => {
    const base = `${apiRoot()}/audio_match_demo`
    await loadScript(`${base}/afp.wasm.js`, 'netease-afp-wasm')
    await loadScript(`${base}/afp.js`, 'netease-afp-runtime')
  })()
  await fingerprintLoader
}
const stopCapture = async() => {
  if (timer) clearInterval(timer)
  timer = null
  stream?.getTracks().forEach(track => { track.stop() })
  stream = null
  const context = audioContext
  audioContext = null
  if (context && context.state != 'closed') await context.close()
}
const record = async() => {
  stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false } })
  audioContext = new AudioContext({ sampleRate: 8000 })
  await audioContext.resume()
  const source = audioContext.createMediaStreamSource(stream)
  const processor = audioContext.createScriptProcessor(2048, 1, 1)
  const silent = audioContext.createGain()
  silent.gain.value = 0
  const chunks: Float32Array[] = []
  let sampleCount = 0
  processor.onaudioprocess = event => {
    const samples = new Float32Array(event.inputBuffer.getChannelData(0))
    chunks.push(samples)
    sampleCount += samples.length
  }
  source.connect(processor)
  processor.connect(silent)
  silent.connect(audioContext.destination)
  const startedAt = Date.now()
  timer = setInterval(() => { progress.value = Math.min(100, ((Date.now() - startedAt) / (captureSeconds * 1000)) * 100) }, 60)
  await new Promise(resolve => setTimeout(resolve, captureSeconds * 1000))
  processor.disconnect()
  source.disconnect()
  silent.disconnect()
  const required = captureSeconds * 8000
  const output = new Float32Array(required)
  let offset = 0
  for (const chunk of chunks) {
    if (offset >= required) break
    const part = chunk.subarray(0, Math.min(chunk.length, required - offset))
    output.set(part, offset)
    offset += part.length
  }
  if (sampleCount < required / 2) throw new Error('没有采集到足够的声音，请检查麦克风')
  await stopCapture()
  return output
}
const decodeFile = async(file: File) => {
  const context = new AudioContext()
  const decoded = await context.decodeAudioData(await file.arrayBuffer())
  await context.close()
  const seconds = Math.max(1, Math.min(captureSeconds, decoded.duration))
  const frameCount = Math.floor(seconds * 8000)
  const offline = new OfflineAudioContext(1, frameCount, 8000)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start(0)
  const rendered = await offline.startRendering()
  return { samples: new Float32Array(rendered.getChannelData(0)), seconds }
}
const match = async(samples: Float32Array, seconds: number) => {
  phase.value = 'matching'
  message.value = '正在生成音频指纹并匹配歌曲…'
  await loadFingerprint()
  const generateFP = (window as unknown as { GenerateFP?: (input: Float32Array) => Promise<string> }).GenerateFP
  if (!generateFP) throw new Error('音频指纹组件未正确加载')
  const audioFP = await generateFP(samples)
  const query = new URLSearchParams({ duration: String(Math.round(seconds)), audioFP })
  const response = await fetch(`${apiRoot()}/audio/match?${query.toString()}`, { method: 'POST' })
  if (!response.ok) throw new Error(`识别服务返回 ${response.status}`)
  const data = await response.json()
  results.value = data?.data?.result ?? []
  phase.value = 'done'
  message.value = results.value.length ? `找到 ${results.value.length} 个可能结果` : '暂未识别到歌曲，请靠近音源后重试'
}
const fail = async(error: unknown) => {
  await stopCapture()
  phase.value = 'error'
  message.value = error instanceof Error ? error.message : '识别失败，请稍后重试'
}
const startRecognition = async() => {
  if (busy.value) return
  results.value = []
  progress.value = 0
  phase.value = 'recording'
  message.value = '正在聆听，请播放一段清晰的音乐…'
  try { await match(await record(), captureSeconds) } catch (error) { await fail(error) }
}
const handleFile = async(event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || busy.value) return
  results.value = []
  phase.value = 'matching'
  message.value = `正在分析 ${file.name}…`
  try {
    const audio = await decodeFile(file)
    await match(audio.samples, audio.seconds)
  } catch (error) { await fail(error) }
}
const artistName = (song: MatchSong) => (song.artists ?? song.ar ?? []).map(item => item.name).filter(Boolean).join(' / ') || '未知歌手'
const openResult = (item: MatchItem) => { void router.push({ path: '/search', query: { text: `${item.song.name} ${artistName(item.song)}` } }) }

onBeforeUnmount(() => { void stopCapture() })
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.container { height: 100%; display: flex; flex-flow: column nowrap; align-items: center; color: #191919; overflow: hidden; }
.header { text-align: center; padding-top: 35px; h1 { font-size: 34px; font-weight: 800; } p { margin-top: 8px; color: #7e7e7e; font-size: 15px; } }
.stage { display: flex; flex-flow: column nowrap; align-items: center; margin-top: 76px; }
.microphone { position: relative; width: 112px; height: 112px; border: 0; border-radius: 50%; display: grid; place-items: center; color: #fff; background: var(--color-primary); box-shadow: 0 22px 38px rgba(17, 177, 83, .2); cursor: pointer; svg { width: 54px; height: 54px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; z-index: 1; } span { position: absolute; inset: 0; border: 2px solid rgba(52,208,102,.4); border-radius: 50%; opacity: 0; } }
.listening span { animation: listening 1.8s ease-out infinite; }
.listening span:nth-child(2) { animation-delay: .65s; }
.message { margin-top: 76px; min-height: 22px; color: #777; font-size: 16px; }
.meter { width: 220px; height: 4px; margin-top: 12px; overflow: hidden; border-radius: 4px; background: #edf1ee; i { display: block; height: 100%; background: var(--color-primary); transition: width .08s linear; } }
.results { width: min(540px, 70%); max-height: 135px; overflow-y: auto; margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; button { display: flex; flex-flow: column nowrap; gap: 3px; border: 1px solid #edf0ee; border-radius: 9px; padding: 9px 12px; background: #fafcfb; text-align: left; cursor: pointer; &:hover { background: #effaf3; border-color: rgba(52,208,102,.35); } } strong { .mixin-ellipsis-1(); font-size: 13px; } span { .mixin-ellipsis-1(); color: #888; font-size: 11px; } }
.actions { margin-top: auto; padding-bottom: 54px; display: flex; flex-flow: column nowrap; align-items: center; gap: 25px; }
.start { width: 90px; height: 90px; border: 0; border-radius: 23px; display: grid; place-items: center; color: #fff; background: var(--color-primary); box-shadow: 0 12px 28px rgba(20,190,94,.18); cursor: pointer; svg { width: 38px; height: 38px; fill: currentColor; } i { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,.45); border-top-color: #fff; border-radius: 50%; animation: spin .8s linear infinite; } }
.upload { display: flex; align-items: center; gap: 9px; font-size: 16px; cursor: pointer; svg { width: 19px; height: 19px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; } input { display: none; } &:hover { color: var(--color-primary); } }
@keyframes listening { from { opacity: .8; transform: scale(1); } to { opacity: 0; transform: scale(1.65); } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
