import React from 'react'
import { Box, Flex, Text, FilterToggle, useMatchBreakpoints } from '../../custom_modules/@filterswap-libs/uikit'
import { useAudioModeManager } from 'state/user/hooks'

type AudioSettingModalProps = {
  translateString: (translationId: number, fallback: string) => string
}

const AudioSetting = ({ translateString }: AudioSettingModalProps) => {
  const { isSm, isXs } = useMatchBreakpoints()
  const [audioPlay, toggleSetAudioMode] = useAudioModeManager()

  return (null)
}

export default AudioSetting
