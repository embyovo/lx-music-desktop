import { ref } from '@common/utils/vueTools'
// import { useI18n } from '@renderer/plugins/i18n'
// import { } from '@renderer/store/search/state'
import { getAndSetListDetail, setDailyListDetail } from '@renderer/store/songList/action'
import { listDetailInfo } from '@renderer/store/songList/state'
import { playSongListDetail } from './action'
import {getSyncServerDevices} from "@renderer/utils/ipc";
import { sync } from '@renderer/store'
export default () => {
  const listRef = ref<any>(null)
  let qrcode = ref<string>('')
  const host = (sync.client.host).replace(/\/+$/, '')
  console.log(host)
  /**
   * 判断MUSIC_U Cookie是否已过期
   *
   * @param cookieString - 完整的Cookie字符串
   * @returns 如果Cookie已过期或无法找到，返回true；否则返回false
   */
  function isMusicUCookieExpired(cookieString: string): boolean {
    if (cookieString == null)
      return true
    const musicURegex = /MUSIC_U=[^;]+;([^;]*)(Expires=([^;]+)|Max-Age=(\d+))/i;
    const match = cookieString.match(musicURegex);

    if (!match) {
      return true;
    }

    if (match[3]) {
      const expiresDate = new Date(match[3]);
      const now = new Date();
      return expiresDate < now;
    }

    if (match[4]) {
      const maxAgeSeconds = parseInt(match[4], 10);
      const creationTime = new Date();
      const expirationTime = new Date(creationTime.getTime() + maxAgeSeconds * 1000);


      return expirationTime < new Date();
    }

    return true;
  }
  function formatMilliseconds(ms: number): string {
    const date = new Date(0)
    date.setMilliseconds(ms)
    // 获取分钟和秒（忽略时区影响）
    const minutes = date.getUTCMinutes()
    const seconds = date.getUTCSeconds()
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  async function fetchMusic(cookie: string) {
    try {
      const queryString = {'cookie':cookie}
      const res = await fetch(`${host}/api/netease/recommend/songs?${new URLSearchParams(queryString)}`, {
        method: 'GET',
      })
      const data1 = await res.json() // 等待 JSON 解析完成
      const data = data1.data.dailySongs

      let list: any[] = []
      // console.log(data)
      data.forEach((item: any) => {
        list.push({
          id: 'wy_' + item.id,
          interval: formatMilliseconds(item.dt),
          name: item.name,
          singer: (item.ar ?? []).map((a: any): string => a.name ?? '').join(' ').trim(),
          source: 'wy',
          meta: {
            songId: item.id,
            albumName: item.al.name,
            picUrl: item.al.picUrl,
            qualitys: [{
              type: '128k',
              size: (item.l?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }, {
              type: '320k',
              size: (item.h?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }, {
              type: 'flac',
              size: (item.sq?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }],
            _qualitys: [{
              '128k': (item.l?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }, {
              '320k': (item.h?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }, {
              flac: (item.sq?.size ?? 1024 * 1024) / 1024 / 1024 + 'MB',
            }],
            albumId: item.al.id,
          },
        })
      })
      return {
        list,
        id: '-1',
        noItemLabel: '123',
        key: 'true',
        desc: '网易云每日推荐',
        total: 30,
        source: 'wy',
        page: 1,
        limit: 1000,
        info: {
          name: '网易云每日推荐',
          img: 'https://ts1.tc.mm.bing.net/th/id/OIP-C.JJ7JGWyXRFK0VfxjsCkrVQHaHa',
          desc: '网易云每日推荐',
          author: '亓',
          play_count: '1',
        },
      }
    } catch (err) {
      console.error('获取音乐失败:', err)
    }
  }
  const getListData = async(source: LX.OnlineSource, id: string, page: number, refresh: boolean) => {
    if (source == 'wy' && id == '-1') {
      listDetailInfo.noItemLabel = window.i18n.t('list__loading')
      const cookie = localStorage.getItem('cookie') as string
      if (isMusicUCookieExpired(cookie)) {
        const res = (await fetch(`${host}/api/netease/login/qr/key`))
        const temp = await res.json()
        const key= temp.data.unikey
        const res1 = await fetch(`${host}/api/netease/login/qr/create?key=${key}&qrimg=true`)
        const temp2 = await res1.json()
        qrcode.value=temp2.data.qrimg
        let intervalCheck = setInterval(async () => {
          const res3 = await fetch(`${host}/api/netease/login/qr/check?key=${key}&&timestamp=${(Date.now()).toString()}`)
          const temp3 = await res3.json()
          setTimeout(()=>{
            clearInterval(intervalCheck)
          },30000)
          if(temp3.code == 803) {
            localStorage.removeItem('cookie')
            localStorage.setItem('cookie', temp3.cookie)
            const result = await fetchMusic(cookie)
            setDailyListDetail(result, '-1', 1)
            qrcode.value=''
            clearInterval(intervalCheck)
          }
        },3000)
      }
      else{
        const result = await fetchMusic(cookie)
        setDailyListDetail(result, '-1', 1)
      }

    } else {
      await getAndSetListDetail(id, source, page, refresh).then(() => {
        setTimeout(() => {
          if (listRef.value) listRef.value.scrollToTop()
        })
      })
    }
  }

  const handlePlayList = (index: number) => {
    void playSongListDetail(listDetailInfo.id, listDetailInfo.source, listDetailInfo.list, index)
  }


  return {
    qrcode,
    listRef,
    listDetailInfo,
    getListData,
    handlePlayList,
  }
}
