"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import api from "@/services/api"

type Category = {
  id: number
  name: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function CategoryCombobox({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchCategories = async () => {
      try {
        setLoading(true)
        const res = await api.get("/categories")
        if (mounted) setCategories(res.data || [])
      } catch (err) {
        console.error("FETCH CATEGORIES ERROR:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCategories()

    return () => {
      mounted = false
    }
  }, [])

  const selected = categories.find(
    (c) => String(c.id) === value
  )

  return (
    <Popover
      open={open}
      onOpenChange={disabled ? () => {} : setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between"
        >
          {selected ? selected.name : "Pilih kategori"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {!disabled && (
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Cari kategori..." />
            <CommandEmpty>Tidak ada kategori</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(String(category.id))
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === String(category.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}
