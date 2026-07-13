'use client'

import * as React from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export interface ComboboxOption {
  value: string // the value submitted (id as string)
  label: string // the human-readable label
  searchText?: string // optional override for search matching
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

/**
 * Imperative handle exposed via a ref. Used by rapid-entry flows (e.g. the
 * invoice "Add Item" sheet) to reopen the dropdown and focus the search input
 * after each commit without requiring the user to click again.
 */
export interface ComboboxHandle {
  /** Open the dropdown and focus the search input. */
  focus: () => void
}

/**
 * Reusable searchable combobox built on Popover + cmdk Command.
 * Standard shadcn combobox pattern, themed to the project.
 *
 * Usage (Transaction modules):
 *   <Combobox
 *     options={items.map(i => ({ value: String(i.id), label: i.tbid_... }))}
 *     value={taxId}
 *     onChange={setTaxId}
 *     placeholder="Select Tax ID"
 *   />
 */
export const Combobox = React.forwardRef<ComboboxHandle, ComboboxProps>(function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyText = 'No results found.',
  disabled = false,
  className,
}, ref) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const currentLabel = options.find((o) => o.value === value)?.label

  React.useImperativeHandle(ref, () => ({
    focus: () => {
      setOpen(true)
      // PopoverContent mounts in a portal; wait two frames so the cmdk input
      // is rendered, then focus it so the user can immediately keep typing.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => inputRef.current?.focus())
      })
    },
  }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-between border-ld font-normal',
            !currentLabel && 'text-darklink dark:text-bodytext',
            className
          )}
        >
          <span className='truncate'>{currentLabel || placeholder}</span>
          <Icon
            icon='solar:alt-arrow-down-linear'
            className={cn('ml-2 h-4 w-4 shrink-0 opacity-60', open && 'rotate-180')}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
        <Command>
          <CommandInput ref={inputRef} placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.searchText ?? option.label}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value)
                    setOpen(false)
                  }}
                >
                  <Icon
                    icon='solar:check-circle-linear'
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100 text-primary' : 'opacity-0'
                    )}
                  />
                  <span className='truncate'>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})

export default Combobox