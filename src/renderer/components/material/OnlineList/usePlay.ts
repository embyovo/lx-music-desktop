// import { useCommit } from '@common/utils/vueTools'
import { defaultList } from '@renderer/store/list/state'
import {getListMusics, addListMusics, removeListMusics, getUserLists} from '@renderer/store/list/action'
import { addTempPlayList } from '@renderer/store/player/action'
import { appSetting } from '@renderer/store/setting'
import { type Ref } from '@common/utils/vueTools'
import { playList } from '@renderer/core/player'
import { LIST_IDS } from '@common/constants'
import {listDetailInfo} from "@renderer/store/songList/state";
import {useRouter} from "vue-router";

export default ({ selectedList, props, removeAllSelect, emit }: {
  selectedList: Ref<LX.Music.MusicInfoOnline[]>
  props: {
    list: LX.Music.MusicInfoOnline[]
  }
  removeAllSelect: () => void
  emit: (event: 'show-menu' | 'play-list' | 'togglePage', ...args: any[]) => void
}) => {
  let clickTime = 0
  let clickIndex = -1

  const router = useRouter()
  const handlePlayMusic = async(index: number, single: boolean) => {
    let targetSong = props.list[index]
    const defaultListMusics = await getListMusics(defaultList.id)
    if (router.currentRoute.value.fullPath.includes('/songList/detail?source=wy&id=-1')) {
      selectedList.value=props.list
      console.log("1")
      const list = defaultListMusics
      const EXCEED_LIMIT = 520


      const selectedIds = selectedList.value.map(item => item.id)

      const deleteSelectedIds = list
        .filter(item => selectedIds.includes(item.id))
        .map(item => item.id)

      const exceedIds = list.length > EXCEED_LIMIT
        ? list.slice(EXCEED_LIMIT).map(item => item.id)
        : []

      const finalDeleteIds = [...new Set([...deleteSelectedIds, ...exceedIds])]

      if (finalDeleteIds.length > 0) {
        await removeListMusics({
          listId: defaultList.id,
          ids: finalDeleteIds
        })
      }
      await addListMusics(defaultList.id,[...selectedList.value] )
    }else{
      if (selectedList.value.length && !single) {
        await addListMusics(defaultList.id, [...selectedList.value])
        removeAllSelect()
      } else {
        await addListMusics(defaultList.id, [targetSong])
      }

      }
    let targetIndex = defaultListMusics.findIndex(s => s.id === targetSong.id)
    if (targetIndex > -1) {
      playList(defaultList.id, targetIndex)
    }

  }

  const handlePlayMusicLater = (index: number, single: boolean) => {
    if (selectedList.value.length && !single) {
      addTempPlayList(selectedList.value.map(s => ({ listId: LIST_IDS.PLAY_LATER, musicInfo: s })))
      removeAllSelect()
    } else {
      addTempPlayList([{ listId: LIST_IDS.PLAY_LATER, musicInfo: props.list[index] }])
    }
  }

  const doubleClickPlay = (index: number) => {
    console.log( appSetting['list.isClickPlayList'])
    if (
      window.performance.now() - clickTime > 400 ||
      clickIndex !== index
    ) {
      clickTime = window.performance.now()
      clickIndex = index
      return
    }
    if (appSetting['list.isClickPlayList']) {
      emit('play-list', index)
    } else {
      void handlePlayMusic(index, true)
    }
    clickTime = 0
    clickIndex = -1
  }

  return {
    handlePlayMusic,
    handlePlayMusicLater,
    doubleClickPlay,
  }
}
