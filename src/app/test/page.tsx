"use client"

import { useEffect } from "react"
import api from "@/services/api"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  useEffect(() => {
    api.get("/categories")
      .then((res) => console.log("SUCCESS:", res.data))
      .catch((err) => console.error("ERROR:", err))
  }, [])

  return (<div className="p-6">Check console
    <Button>test button</Button>
  </div>
    

)
}
