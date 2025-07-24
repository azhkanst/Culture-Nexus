import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-600 mb-4">Cultural Note Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          The cultural note you're looking for doesn't exist in our knowledge base.
        </p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Notes
          </Button>
        </Link>
      </div>
    </div>
  )
}
