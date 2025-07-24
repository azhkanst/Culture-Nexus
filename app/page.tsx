import Link from "next/link"
import { getAllNotes } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const notes = getAllNotes()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Nexus Culture</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore interconnected cultural knowledge through an Obsidian-style knowledge base
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link key={note.id} href={`/note/${note.id}`}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl font-semibold text-slate-800 line-clamp-2">{note.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {note.type}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                    {note.content.replace(/\[\[([^\]]+)\]\]/g, "$1")}
                  </p>
                  <div className="mt-4 flex items-center text-xs text-slate-500">
                    <span>{note.relatedNotes.length} related notes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm">
            Click on any note to explore its connections and discover related cultural knowledge
          </p>
        </div>
      </div>
    </div>
  )
}
