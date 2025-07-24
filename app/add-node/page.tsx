"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGraphData, addNode, type Node } from "@/lib/node-storage"

export default function AddNodePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [availableNodes, setAvailableNodes] = useState<Node[]>([])
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])

  useEffect(() => {
    const data = getGraphData()
    setAvailableNodes(data.nodes)
    setFilteredNodes(data.nodes)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNodes(availableNodes)
    } else {
      const filtered = availableNodes.filter(
        (node) =>
          node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredNodes(filtered)
    }
  }, [searchTerm, availableNodes])

  const handleAddConnection = (nodeId: string) => {
    if (!selectedConnections.includes(nodeId)) {
      setSelectedConnections([...selectedConnections, nodeId])
    }
    setSearchTerm("")
  }

  const handleRemoveConnection = (nodeId: string) => {
    setSelectedConnections(selectedConnections.filter((id) => id !== nodeId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert("Please enter a title for the node")
      return
    }

    addNode(
      {
        label: title.trim(),
        title: title.trim(),
        description: description.trim(),
      },
      selectedConnections,
    )

    router.push("/")
  }

  const getNodeById = (id: string) => availableNodes.find((node) => node.id === id)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="outline" className="mb-6 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Graph
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Node</CardTitle>
            <p className="text-sm text-gray-600">Create a new node and connect it to existing ones</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Node Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter node title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter node description"
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Connections</Label>
                <div className="mt-2 space-y-4">
                  {/* Selected connections */}
                  {selectedConnections.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Selected connections:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedConnections.map((nodeId) => {
                          const node = getNodeById(nodeId)
                          return (
                            <div
                              key={nodeId}
                              className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              <span>{node?.title || "Unknown Node"}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveConnection(nodeId)}
                                className="ml-2 hover:text-blue-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Search for connections */}
                  <div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search existing nodes to connect..."
                        className="pl-10"
                      />
                    </div>

                    {/* Search results */}
                    {searchTerm && (
                      <div className="mt-2 max-h-40 overflow-y-auto border rounded-md bg-white">
                        {filteredNodes.length > 0 ? (
                          filteredNodes
                            .filter((node) => !selectedConnections.includes(node.id))
                            .map((node) => (
                              <button
                                key={node.id}
                                type="button"
                                onClick={() => handleAddConnection(node.id)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                              >
                                <div className="font-medium">{node.title}</div>
                                <div className="text-sm text-gray-500">{node.description?.substring(0, 60)}...</div>
                              </button>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">No nodes found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Add Node
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
