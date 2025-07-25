"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trash2, Edit, Shield, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentMap, deleteNode, type Node, type Map } from "@/lib/node-storage"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"

interface NodePageProps {
  params: {
    id: string
  }
}

function NodePageContent({ params }: NodePageProps) {
  const router = useRouter()
  const [node, setNode] = useState<Node | null>(null)
  const [currentMap, setCurrentMap] = useState<Map | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    const mapData = getCurrentMap()
    if (!mapData) {
      router.push("/maps")
      return
    }

    setCurrentMap(mapData)
    const foundNode = mapData.nodes.find((n) => n.id.toLowerCase() === params.id.toLowerCase())

    if (foundNode) {
      setNode(foundNode)
    }
  }, [params.id, router])

  const handleDelete = () => {
    if (!isAdmin()) {
      alert("Only administrators can delete nodes")
      return
    }
    if (node) {
      deleteNode(node.id)
      router.push("/")
    }
  }

  const handleExternalLinkClick = (url: string) => {
    // Ensure the URL has a protocol
    const formattedUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
    window.open(formattedUrl, "_blank", "noopener,noreferrer")
  }

  if (!node || !currentMap) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-6 bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Graph
            </Button>
          </Link>
          <div className="text-center text-gray-300">Node not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Graph
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            {/* User Role Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
              {user?.role === "admin" ? (
                <Shield className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-green-400" />
              )}
              <span className="text-sm font-medium capitalize text-gray-200">{user?.role}</span>
            </div>

            {isAdmin() && (
              <>
                <Link href={`/edit-node/${node.id.toLowerCase()}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Node
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
              </>
            )}
          </div>
        </div>

        {/* Guest Mode Notice */}
        {!isAdmin() && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200 font-medium">Guest Mode - View Only</p>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              You are viewing this node in read-only mode. Login as admin to edit or delete.
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && isAdmin() && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Node</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{node.title}"? This will also remove all connections to this node. This
                action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">{node.title}</h1>
            {/* <p className="text-gray-300">Node details and information</p>*/}
          </div>

          {/* Node Image */}
          {node.image && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Image</h2>
              <div className="rounded-lg overflow-hidden shadow-md">
                <img src={node.image || "/placeholder.svg"} alt={node.title} className="w-full h-64 object-cover" />
              </div>
            </div>
          )}

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
            <p className="text-gray-300 leading-relaxed text-lg">{node.description || "No description provided."}</p>
          </div>

          {node.externalLinks && node.externalLinks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">External Links</h3>
              <div className="space-y-2">
                {node.externalLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleExternalLinkClick(link.url)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 text-left"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="break-all">{link.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700">
            {/*<h3 className="text-lg font-semibold text-white mb-4">Node Properties</h3>*/}
            <div className="grid grid-cols-1 gap-4 text-sm">
              {currentMap.connections.filter((conn) => conn.from === node.id || conn.to === node.id).length > 0 ? (
                <div>
                  <span className="font-medium text-gray-300">Connected to:</span>
                  <div className="ml-2 mt-1">
                    {currentMap.connections
                      .filter((conn) => conn.from === node.id || conn.to === node.id)
                      .map((conn, index) => {
                        const connectedNodeId = conn.from === node.id ? conn.to : conn.from
                        const connectedNode = currentMap.nodes.find((n) => n.id === connectedNodeId)
                        return (
                          <button
                            key={index}
                            onClick={() => router.push(`/node/${connectedNodeId.toLowerCase()}`)}
                            className="inline-block bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 hover:text-blue-200 px-2 py-1 rounded text-xs mr-2 mb-1 cursor-pointer transition-colors duration-200 border border-blue-700/50"
                          >
                            {connectedNode?.title || "Unknown Node"}
                          </button>
                        )
                      })}
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-medium text-gray-300">Connected to:</span>
                  <span className="ml-2 text-gray-500">No connections</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NodePage({ params }: NodePageProps) {
  return (
    <ProtectedRoute>
      <NodePageContent params={params} />
    </ProtectedRoute>
  )
}
