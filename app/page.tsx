import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { WorkflowList } from "@/components/workflow-list"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Workflow Manager</h1>
        <Button asChild>
          <Link href="/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workflow
          </Link>
        </Button>
      </div>

      <WorkflowList />
    </div>
  )
}
