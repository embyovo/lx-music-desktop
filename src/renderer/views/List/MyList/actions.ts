import { addListMusics, setFetchingListStatus } from '@renderer/store/list/action'
import { showSelectDialog } from '@renderer/utils/ipc'
import {sync} from "@renderer/store";
import { readFile } from 'fs/promises'



const handleAddMusics = async(listId: string, filePaths: string[],fileObjects:File[], index: number = -1) => {
  // console.log(index + 1, index + 201)
  const paths = filePaths.slice(index + 1, index + 201)
  const musicInfos = await window.lx.worker.main.createLocalMusicInfos(paths)
  console.log(musicInfos)
  await syncToNetEaseCloud(musicInfos,fileObjects[0])
  if (musicInfos.length) await addListMusics(listId, musicInfos)
  index += 200
  if (filePaths.length - 1 > index) await handleAddMusics(listId, filePaths,fileObjects, index)
}
const syncToNetEaseCloud = async (musicInfos: Array<{
  name: string
  singer: string
  album?: string
}>,file:File) => {
  const cookie = localStorage.getItem('cookie') || ''
  if (!cookie) {
    console.warn('⚠️ 未登录网易云，无法同步到云盘')
    return
  }


  for (const music of musicInfos) {
    try {

      const host=(sync.client.host).replace(/\/+$/, '')
      const formData = new FormData()
      formData.append('songFile', file)
      const queryString = {'cookie':cookie}
      const response = await fetch(`${host}/api/netease/cloud?time=${Date.now()}&${new URLSearchParams(queryString)}`, {
        method: 'POST',
        body: formData,

      });

      // fetch 只有网络错误才会抛异常，手动判断 HTTP 状态码
      if (!response.ok) {
        throw new Error(`HTTP 错误，状态码：${response.status}`);
      }

      // 可选：如果你需要接收后端返回的 JSON
      // const result = await response.json();

      window.alert(`上传成功`)
    } catch (err) {
      window.alert(`上传失败：${err}`)
    }

    // 每首间隔 300ms，避免请求过快被封
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}
export const addLocalFile = async(listInfo: LX.List.MyListInfo) => {
  const { canceled, filePaths } = await showSelectDialog({
    title: window.i18n.t('lists__add_local_file_desc'),
    properties: ['openFile', 'multiSelections'],
    filters: [
      // https://support.google.com/chromebook/answer/183093
      // 3gp, .avi, .mov, .m4v, .m4a, .mp3, .mkv, .ogm, .ogg, .oga, .webm, .wav
      { name: 'Media File', extensions: ['mp3', 'flac', 'ogg', 'oga', 'wav', 'm4a'] },
      // { name: 'All Files', extensions: ['*'] },
    ],
  })
  if (canceled || !filePaths.length) return


  const fileObjects = await Promise.all(
    filePaths.map(async (filePath) => {
      // 1. 读取文件二进制
      const buffer = await readFile(filePath)

      // 2. 转成 Blob
      const blob = new Blob([buffer], { type: 'audio/mpeg' })

      // 3. 从路径提取文件名
      const fileName = filePath.split('/').pop() || 'unknown.mp3'

      // 4. 生成标准 File 对象（和 input[type=file] 拿到的完全一样！）
      return new File([blob], fileName, { type: blob.type })
    })
  )
  console.log('所有文件对象：', fileObjects)
  setFetchingListStatus(listInfo.id, true)
  await handleAddMusics(listInfo.id, filePaths,fileObjects)
  // await syncToNetEaseCloud(listInfo.id)
  setFetchingListStatus(listInfo.id, false)
}
