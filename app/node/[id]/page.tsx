"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGraphData, deleteNode, type Node } from "@/lib/node-storage"

interface NodePageProps {
  params: {
    id: string
  }
}

export default function NodePage({ params }: NodePageProps) {
  const router = useRouter()
  const [node, setNode] = useState<Node | null>(null)
  const [connections, setConnections] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const data = getGraphData()
    const foundNode = data.nodes.find((n) => n.id.toLowerCase() === params.id.toLowerCase())

    if (foundNode) {
      setNode(foundNode)

      // Find all connections for this node
      const nodeConnections = data.connections
        .filter((conn) => conn.from === foundNode.id || conn.to === foundNode.id)
        .map((conn) => (conn.from === foundNode.id ? conn.to : conn.from))
        .map((connId) => {
          const connNode = data.nodes.find((n) => n.id === connId)
          return connNode?.title || "Unknown Node"
        })

      setConnections(nodeConnections)
    }
  }, [params.id])

  const handleDelete = () => {
    if (node) {
      deleteNode(node.id)
      router.push("/")
    }
  }

  if (!node) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Graph
            </Button>
          </Link>
          <div className="text-center text-gray-600">Node not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Graph
            </Button>
          </Link>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </Button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Node</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{node.title}"? This will also remove all connections to this node. This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <span className="text-2xl font-bold text-blue-600">{node.title.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{node.title}</h1>
            <p className="text-gray-600">Node details and information</p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{node.description || "No description provided."}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Node Properties</h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <span className="ml-2 text-gray-800">Graph Node</span>
              </div>
              {connections.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Connected to:</span>
                  <div className="ml-2 mt-1">
                    {connections.map((conn, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-2 mb-1"
                      >
                        {conn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
