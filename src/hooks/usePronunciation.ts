import { Howl } from 'howler'
import { useEffect, useState } from 'react'
import { PronunciationType, useAppState } from 'store/AppState'
import useSound from 'use-sound'
import { HookOptions } from 'use-sound/dist/types'
import { addHowlListener } from '../utils/utils'

function Hc(a: number, b: string): number {
  for (var c: number = 0; c < b.length - 2; c += 3) {
    var d: number = b.charCodeAt(c + 2)
    d = 'a'.charCodeAt(0) <= d ? d - 87 : d
    d = '+'.charCodeAt(0) === b.charCodeAt(c + 1) ? a >> d : a << d
    a = '+'.charCodeAt(0) === b.charCodeAt(c) ? (a + d) & 4294967295 : a ^ d
  }
  return a
}
function tk(str: string): string {
  var d: number[] = [441648, 4012131209]
  var c: string = '&tk='
  var b: number = d[0] | 0
  var e: number[] = []
  var f: number = 0
  var g: number = 0
  for (; g < str.length; g++) {
    var l: number = str.charCodeAt(g)
    if (128 > l) {
      e[f++] = l
    } else {
      if (2048 > l) {
        e[f++] = (l >> 6) | 192
      } else {
        if (55296 === (l & 64512) && g + 1 < str.length && 56320 === (str.charCodeAt(1 + g) & 64512)) {
          l = 65536 + ((l & 1023) << 10) + (str.charCodeAt(++g) & 1023)
          e[f++] = (l >> 18) | 240
          e[f++] = ((l >> 12) & 63) | 128
        } else {
          e[f++] = (l >> 12) | 224
          e[f++] = ((l >> 6) & 63) | 128
        }
        e[f++] = (l & 63) | 128
      }
    }
  }
  var a: number = b
  for (f = 0; f < e.length; f++) {
    a += e[f]
    a = Hc(a, '+-a^+6')
  }
  a = Hc(a, '+-3^+b+-f')
  a ^= d[1] | 0
  0 > a && (a = (a & 2147483647) + 2147483648)
  a %= 1e6
  return c + (a + '.' + (a ^ b))
}

const pronunciationApi = 'https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&client=webapp&prev=input&ttsspeed=1'
function generateWordSoundSrc(word: string, pronunciation: Exclude<PronunciationType, false>) {
  switch (pronunciation) {
    case 'us':
      return `${pronunciationApi}&q=${word}&textlen=${word.length}&tl=en-US${tk(word)}`
    case 'uk':
      return `${pronunciationApi}&q=${word}&textlen=${word.length}&tl=en-GB${tk(word)}`
    case 'yue':
      return `${pronunciationApi}&q=${word}&textlen=${word.length}&tl=zh-HK${tk(word)}`
    case 'jap':
      return `${pronunciationApi}&q=${word}&textlen=${word.length}&tl=ja-JP${tk(word)}`
  }
}

export default function usePronunciationSound(word: string) {
  const { pronunciation, soundLoop } = useAppState()
  const [isPlaying, setIsPlaying] = useState(false)

  const [play, { stop, sound }] = useSound(generateWordSoundSrc(word, pronunciation as Exclude<PronunciationType, false>), {
    html5: true,
    format: ['mp3'],
    loop: soundLoop,
  } as HookOptions)

  useEffect(() => {
    if (!sound) return
    sound.loop(soundLoop)
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundLoop])

  useEffect(() => {
    if (!sound) return
    const unListens: Array<() => void> = []

    unListens.push(addHowlListener(sound, 'play', () => setIsPlaying(true)))
    unListens.push(addHowlListener(sound, 'end', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'pause', () => setIsPlaying(false)))
    unListens.push(addHowlListener(sound, 'playerror', () => setIsPlaying(false)))

    return () => {
      setIsPlaying(false)
      unListens.forEach((unListen) => unListen())
      ;(sound as Howl).unload()
    }
  }, [sound])

  return { play, stop, isPlaying }
}
