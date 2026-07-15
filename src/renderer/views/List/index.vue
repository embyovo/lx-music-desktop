<template>
  <div id="my-list" :class="$style.container">
    <div :class="$style.playlistHeader">
      <div :class="$style.cover"><span>♫</span></div>
      <div :class="$style.meta">
        <h1>{{ selectedListName }}</h1>
        <p>这是我们创建的歌单</p>
        <span>{{ musicCount }} 首歌曲</span>
        <div :class="$style.actions">
          <button type="button" :disabled="!musicCount" :class="[$style.actionBtn, $style.primary]" @click="$refs.musicList.playFromStart()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.8v12.4c0 .8.9 1.3 1.6.8l9-6.2a1 1 0 0 0 0-1.6l-9-6.2A1 1 0 0 0 8 5.8Z" /></svg>
            <span>播放全部</span>
          </button>
          <button type="button" :disabled="!musicCount" :class="$style.actionBtn" @click="$refs.musicList.playRandom()">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 4h3.1v3.1M4 17.5h2.7c4.8 0 6.1-11 10.8-11h2M16.5 20h3.1v-3.1M4 6.5h2.7c1.5 0 2.6 1.1 3.6 2.6m3.3 5.8c1 1.5 2.1 2.6 3.9 2.6h2" /></svg>
            <span>随机播放</span>
          </button>
        </div>
      </div>
      <div :class="$style.searchTools">
        <div :class="$style.inlineSearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4 4" /></svg>
          <input ref="playlistSearchInput" v-model.trim="searchText" type="search" placeholder="搜索当前歌单" @keydown.enter.prevent="selectFirstSearchResult">
          <button v-if="searchText" type="button" aria-label="清空搜索" @click="searchText = ''">×</button>
          <div v-if="searchText" :class="$style.searchResult">
            <button v-for="item in searchResults" :key="item.music.id" type="button" @mousedown.prevent="selectSearchResult(item.index)">
              <span>{{ item.music.name }}</span>
              <small>{{ item.music.singer }}</small>
            </button>
            <p v-if="!searchResults.length">未找到匹配歌曲</p>
          </div>
        </div>
      </div>
    </div>
    <div :class="$style.listBody">
      <MusicList ref="musicList" :list-id="listId" @list-count="musicCountValue = $event" @list-data="musicListValue = $event" />
    </div>
  </div>
</template>

<script>
import { getListPrevSelectId } from '@renderer/utils/data'

import MusicList from './MusicList/index.vue'
import { defaultList, loveList, userLists } from '@renderer/store/list/state'

export default {
  name: 'List',
  components: {
    MusicList,
  },
  async beforeRouteEnter(to, from, next) {
    let id = to.query.id
    if (!id) {
      id = await getListPrevSelectId()
      next({
        path: to.path,
        query: { id },
      })
    } else next()
  },
  beforeRouteUpdate(to, from) {
    // console.log(to, from)
    if (to.query.updated) return
    let id = to.query.id
    if (id == null) return
    // if (!getList(id)) {
    //   id = defaultList.id
    // }
    this.listId = id
    const scrollIndex = to.query.scrollIndex
    const isAnimation = from.query.id == to.query.id
    this.$refs.musicList?.handleRestoreScroll(scrollIndex, isAnimation)

    return {
      path: '/list',
      query: { id, updated: true },
    }
  },
  beforeRouteLeave(to, from) {
    this.$refs.musicList?.saveListPosition()
  },
  data() {
    return {
      listId: null,
      musicCountValue: 0,
      musicListValue: [],
      searchText: '',
    }
  },
  computed: {
    selectedListName() {
      const info = [defaultList, loveList, ...userLists].find(item => item.id == this.listId)
      if (!info) return '我的歌单'
      return info == defaultList || info == loveList ? this.$t(info.name) : info.name
    },
    musicCount() {
      return this.musicCountValue
    },
    searchResults() {
      const keyword = this.searchText.toLocaleLowerCase()
      if (!keyword) return []
      return this.musicListValue.reduce((results, music, index) => {
        const text = [music.name, music.singer, music.meta?.albumName].filter(Boolean).join(' ').toLocaleLowerCase()
        if (text.includes(keyword) && results.length < 12) results.push({ music, index })
        return results
      }, [])
    },
  },
  created() {
    this.listId = this.$route.query.id
  },
  mounted() {
    window.key_event.on('key_mod+f_down', this.focusSearch)
  },
  beforeUnmount() {
    window.key_event.off('key_mod+f_down', this.focusSearch)
  },
  methods: {
    focusSearch() {
      this.$refs.playlistSearchInput?.focus()
    },
    selectSearchResult(index) {
      this.$refs.musicList?.locateMusic(index, true)
    },
    selectFirstSearchResult() {
      if (this.searchResults.length) this.selectSearchResult(this.searchResults[0].index)
    },
  },
}
</script>

<style lang="less" module>
@import '@renderer/assets/styles/layout.less';

.container {
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  gap: 14px;
}

.playlistHeader {
  flex: none;
  min-height: 188px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 16px 22px;
  box-sizing: border-box;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 18px rgba(29, 68, 45, .09);
}

.cover {
  width: 150px;
  height: 150px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #888;
  font-size: 54px;
  background: linear-gradient(145deg, #555, #2e2e2e);
  box-shadow: 0 8px 24px rgba(0, 0, 0, .10);
}

.meta {
  flex: auto;
  min-width: 0;
  h1 { font-size: 32px; line-height: 1.16; font-weight: 800; color: #141722; }
  p { margin-top: 7px; color: #858585; font-size: 16px; }
  > span { display: block; margin-top: 7px; color: #aaa; font-size: 14px; }
}

.actions {
  display: flex;
  gap: 9px;
  margin-top: 14px;
}

.actionBtn {
  height: 36px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid #e3e8e5;
  border-radius: 9px;
  background: rgba(246, 248, 247, .96);
  color: #58615c;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform .18s ease, border-color .18s ease, background-color .18s ease, box-shadow .18s ease;

  svg {
    width: 15px;
    height: 15px;
    flex: none;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(75, 195, 111, .38);
    background: #fff;
    box-shadow: 0 4px 11px rgba(34, 90, 51, .09);
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: .42; cursor: default; }
}

.primary {
  color: #fff;
  border-color: #59cf7d;
  background: #59cf7d;
  svg { stroke: none; }
  &:hover:not(:disabled) {
    border-color: #4fc574;
    background: #4fc574;
  }
}

.searchTools {
  align-self: flex-end;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inlineSearch {
  width: 238px;
  height: 36px;
  position: relative;
  z-index: 6;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid #e3e8e5;
  border-radius: 9px;
  background: #fff;

  > svg {
    width: 15px;
    height: 15px;
    margin-left: 11px;
    flex: none;
    fill: none;
    stroke: #8a938e;
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  > input {
    min-width: 0;
    height: 100%;
    flex: auto;
    padding: 0 7px;
    border: 0;
    outline: 0;
    background: transparent;
    color: #343a36;
    font-size: 13px;
    &::-webkit-search-cancel-button { display: none; }
    &::placeholder { color: #a2aaa6; }
  }
  > button {
    width: 30px;
    height: 100%;
    flex: none;
    border: 0;
    background: transparent;
    color: #969e99;
    cursor: pointer;
  }
}

.searchResult {
  position: absolute;
  top: 41px;
  left: 0;
  width: 100%;
  max-height: 286px;
  padding: 5px;
  overflow: auto;
  box-sizing: border-box;
  border: 1px solid #e8ece9;
  border-radius: 10px;
  background: #fff;
  box-shadow: @shadow-lg;

  button {
    width: 100%;
    min-height: 42px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    text-align: left;
    cursor: pointer;
    &:hover { background: #eff9f3; }
    span, small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    span { color: #343a36; font-size: 13px; }
    small { color: #929a95; font-size: 11px; }
  }
  p { padding: 16px 8px; color: #9ba39e; font-size: 12px; text-align: center; }
}

.listBody {
  position: relative;
  flex: auto;
  min-height: 0;
  display: flex;
  gap: 16px;
}

</style>
