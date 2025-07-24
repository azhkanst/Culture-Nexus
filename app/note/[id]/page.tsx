import Link from "next/link"
import { notFound } from "next/navigation"
import { getNoteById, getAllNotes } from "@/lib/data"
import { parseLinks } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Image from "next/image"

interface NotePageProps {
  params: {
    id: string
  }
}

export function generateStaticParams() {
  const notes = getAllNotes()
  return notes.map((note) => ({
    id: note.id,
  }))
}

export default function NotePage({ params }: NotePageProps) {
  const note = getNoteById(params.id)
  const allNotes = getAllNotes()

  if (!note) {
    notFound()
  }

  const relatedNotes = note.relatedNotes.map((id) => allNotes.find((n) => n.id === id)).filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Notes
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-slate-800">{note.title}</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {note.type}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                {note.image && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <Image
                      src={note.image || "/placeholder.svg"}
                      alt={note.title}
                      width={600}
                      height={400}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-slate max-w-none">
                  <div className="text-lg leading-relaxed text-slate-700">
                    {parseLinks(note.content).map((part, index) => (
                      <span key={index}>{part}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Notes */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Related Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedNotes.length > 0 ? (
                  <div className="space-y-3">
                    {relatedNotes.map((relatedNote) => (
                      <Link key={relatedNote!.id} href={`/note/${relatedNote!.id}`} className="block">
                        <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                          <div className="font-medium text-slate-800 mb-1">{relatedNote!.title}</div>
                          <Badge variant="outline" className="text-xs">
                            {relatedNote!.type}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No related notes found.</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-800">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-slate-600">Type:</span>
                    <div className="mt-1">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {note.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-600">Connected Notes:</span>
                    <div className="mt-1 text-sm text-slate-700">{relatedNotes.length} related notes</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
