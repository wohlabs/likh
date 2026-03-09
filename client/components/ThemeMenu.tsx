import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react"
import {
  View,
  Modal,
  Pressable,
  Text,
  LayoutRectangle,
  Dimensions,
  useWindowDimensions
} from "react-native"

interface ThemeMenuProps {
  visible: boolean
  onDismiss: () => void
  anchor: ReactNode
  children: ReactNode
  anchorPosition?: "top" | "bottom"
}

interface MenuItemProps {
  title: string
  onPress?: () => void
  disabled?: boolean
  leadingIcon?: ReactNode
}

const MENU_PADDING = 8

export const ThemeMenu = ({
  visible,
  onDismiss,
  anchor,
  children,
  anchorPosition = "bottom"
}: ThemeMenuProps) => {
  const anchorRef = useRef<View>(null)
  const menuRef = useRef<View>(null)

  const [anchorLayout, setAnchorLayout] = useState<LayoutRectangle | null>(null)
  const {width: screenWidth, height: screenHeight} = useWindowDimensions()
  const [menuSize, setMenuSize] = useState({ width: 0, height: 0 })
  const [position, setPosition] = useState({top: 0, left: 0})
  
  useEffect(() => {
    setPosition(computePosition())
  }, [anchorLayout, menuSize, screenWidth, screenHeight])
  
  const computePosition = useCallback(() => {
    if (!anchorRef || !menuRef || !anchorLayout || !menuSize) return { top: 0, left: 0 }

    let top =
      anchorPosition === "bottom"
        ? anchorLayout.y + anchorLayout.height
        : anchorLayout.y - menuSize.height

    let left = anchorLayout.x

    // Horizontal snapping
    if (left + menuSize.width > screenWidth - MENU_PADDING)
    {
      left = screenWidth - menuSize.width - MENU_PADDING
    }

    // Vertical snapping
    if (top + menuSize.height > screenHeight - MENU_PADDING)
    {
      top = screenHeight - menuSize.height - MENU_PADDING
    }

    return { top, left }
  }, [screenWidth, screenHeight, menuSize, anchorLayout])
  
  return (
    <>
      <View ref={anchorRef} collapsable={false}
        onLayout={() => {
          anchorRef.current?.measureInWindow((x, y, width, height) => {
            setAnchorLayout({ x, y, width, height})
          })
        }}
      >
        {anchor}
      </View>

      <Modal className="w-screen h-screen" transparent visible={visible}>
        <Pressable className="flex flex-1"
          onPress={onDismiss}>
          <View className={`absolute bg-white rounded-md`}
            ref={menuRef} 
            onLayout={(e) => {
              menuRef.current?.measureInWindow((x, y, width, height) => {
                setMenuSize({ width, height})
              })
              // const { width, height } = e.nativeEvent.layout
              // setMenuSize({ width, height })
            }}
            style={
              {
                top: position.top,
                left: position.left
              }
            }
          >
            {children}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const MenuItem = ({ title, onPress, disabled, leadingIcon }: MenuItemProps) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center px-4 py-3 ${
        disabled ? "opacity-40" : "active:bg-gray-100"
      }`}
    >
      {leadingIcon && (
        <View className="mr-3 items-center justify-center">
          {leadingIcon}
        </View>
      )}

      <Text className="text-base text-gray-900">{title}</Text>
    </Pressable>
  )
}

ThemeMenu.Item = MenuItem