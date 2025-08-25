'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Smile } from 'lucide-react'
import EmojiPickerReact from 'emoji-picker-react'

interface EmojiPickerProps {
  value?: string | null
  onValueChange: (emoji: string) => void
  placeholder?: string
}

export function EmojiPicker({ value, onValueChange, placeholder = "Choose emoji" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiSelect = (emoji: string) => {
    onValueChange(emoji)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-10"
        >
          {value ? (
            <span className="text-lg mr-2">{value}</span>
          ) : (
            <Smile className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">{placeholder}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0" align="start">
        <div className="w-[350px] h-[400px]">
          <EmojiPickerReact
            onEmojiClick={(emojiObject) => handleEmojiSelect(emojiObject.emoji)}
            width="100%"
            height="100%"
            searchPlaceholder="Search emojis..."
            lazyLoadEmojis={true}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
