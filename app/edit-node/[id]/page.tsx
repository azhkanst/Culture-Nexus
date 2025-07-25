"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Search, X, Upload, ImageIcon, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentMap, editNode, type Node, type NodeSize } from "@/lib/node-storage"
import { isAdmin } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"

const predefinedColors = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#ec4899", // Pink
  "#6b7280", // Gray
]

interface EditNodePageProps {
  params: {
    id: string
  }
}

function EditNodePageContent({ params }: EditNodePageProps) {
  const router = useRouter()
  const [node, setNode] = useState<Node | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string>("")
  const [size, setSize] = useState<NodeSize>("medium")
  const [color, setColor] = useState("#3b82f6")
  const [customColor, setCustomColor] = useState("")
  const [externalLinks, setExternalLinks] = useState<{ text: string; url: string }[]>([])
  const [newLinkText, setNewLinkText] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConnections, setSelectedConnections] = useState<string[]>([])
  const [availableNodes, setAvailableNodes] = useState<Node[]>([])
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/")
      return
    }

    const currentMap = getCurrentMap()
    if (!currentMap) {
      router.push("/maps")
      return
    }

    const foundNode = currentMap.nodes.find((n) => n.id.toLowerCase() === params.id.toLowerCase())
    if (!foundNode) {
      router.push("/")
      return
    }

    // Set node data
    setNode(foundNode)
    setTitle(foundNode.title)
    setDescription(foundNode.description || "")
    setImage(foundNode.image || "")
    setSize(foundNode.size)
    setColor(foundNode.color)
    setExternalLinks(foundNode.externalLinks || [])

    // Set available nodes (excluding current node)
    const otherNodes = currentMap.nodes.filter((n) => n.id !== foundNode.id)
    setAvailableNodes(otherNodes)
    setFilteredNodes(otherNodes)

    // Set current connections
    const currentConnections = currentMap.connections
      .filter((conn) => conn.from === foundNode.id || conn.to === foundNode.id)
      .map((conn) => (conn.from === foundNode.id ? conn.to : conn.from))

    setSelectedConnections(currentConnections)
    setLoading(false)
  }, [params.id, router])

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor)
    setCustomColor("")
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setCustomColor(newColor)
    setColor(newColor)
  }

  const handleAddExternalLink = () => {
    const text = newLinkText.trim()
    const url = newLinkUrl.trim()

    if (url && !externalLinks.some((link) => link.url === url)) {
      const linkText = text || url // Use URL as text if no text provided
      setExternalLinks([...externalLinks, { text: linkText, url }])
      setNewLinkText("")
      setNewLinkUrl("")
    }
  }

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAdmin()) {
      alert("Only administrators can edit nodes")
      return
    }

    if (!title.trim()) {
      alert("Please enter a title for the node")
      return
    }

    if (!node) return

    editNode(
      node.id,
      {
        label: title.trim(),
        title: title.trim(),
        description: description.trim(),
        image: image || undefined,
        size,
        color,
        externalLinks,
      },
      selectedConnections,
    )

    router.push(`/node/${node.id.toLowerCase()}`)
  }

  const getNodeById = (id: string) => availableNodes.find((node) => node.id === id)

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-gray-300">Access denied. Admin privileges required.</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-gray-300">Loading...</div>
        </div>
      </div>
    )
  }

  if (!node) {
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
        <Link href={`/node/${node.id.toLowerCase()}`}>
          <Button variant="outline" className="mb-6 bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Node
          </Button>
        </Link>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Edit Node</CardTitle>
            <p className="text-sm text-gray-300">Update node properties and connections</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-200">
                  Node Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter node title"
                  className="mt-1 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-200">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter node description"
                  rows={4}
                  className="mt-1 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                />
              </div>

              {/* External Links */}
              <div>
                <Label className="text-gray-200">External Links (Optional)</Label>
                <div className="mt-2 space-y-4">
                  {/* Existing links */}
                  {externalLinks.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Added links:</p>
                      <div className="space-y-2">
                        {externalLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-sm text-blue-400 underline">{link.text}</div>
                              <div className="text-xs text-gray-400 break-all">{link.url}</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExternalLink(index)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add new link */}
                  <div>
                    <div className="space-y-2">
                      <Input
                        value={newLinkText}
                        onChange={(e) => setNewLinkText(e.target.value)}
                        placeholder="Link text (e.g., 'YouTube', 'Documentation')"
                        className="w-full bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddExternalLink()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddExternalLink}
                          disabled={!newLinkUrl.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Add descriptive text for the link (e.g., 'YouTube', 'Documentation'). This text will be displayed
                      as the clickable link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Node Size Selection */}
              <div>
                <Label className="text-gray-200">Node Size</Label>
                <Select value={size} onValueChange={(value: NodeSize) => setSize(value)}>
                  <SelectTrigger className="mt-1 bg-gray-700 border-gray-600 text-gray-200">
                    <SelectValue placeholder="Select node size" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="small" className="text-gray-200 hover:bg-gray-600">
                      Small
                    </SelectItem>
                    <SelectItem value="medium" className="text-gray-200 hover:bg-gray-600">
                      Medium
                    </SelectItem>
                    <SelectItem value="large" className="text-gray-200 hover:bg-gray-600">
                      Large
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Node Color Selection */}
              <div>
                <Label className="text-gray-200">Node Color</Label>
                <div className="mt-2 space-y-4">
                  {/* Predefined Colors */}
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Choose a color:</p>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((presetColor) => (
                        <button
                          key={presetColor}
                          type="button"
                          onClick={() => handleColorSelect(presetColor)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            color === presetColor ? "border-gray-300 scale-110" : "border-gray-600 hover:scale-105"
                          }`}
                          style={{ backgroundColor: presetColor }}
                          title={presetColor}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Picker */}
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Or pick a custom color:</p>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={customColor || color}
                        onChange={handleCustomColorChange}
                        className="w-16 h-10 p-1 border border-gray-600 rounded bg-gray-700"
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-600"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-300">{color}</span>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <p className="text-sm text-gray-300 mb-2">Preview:</p>
                    <div className="flex items-center justify-center p-4 bg-gray-700 rounded-lg">
                      <div
                        className={`rounded-full border-2 border-gray-500 flex items-center justify-center text-white font-semibold ${
                          size === "small"
                            ? "w-12 h-12 text-xs"
                            : size === "medium"
                              ? "w-16 h-16 text-sm"
                              : "w-20 h-20 text-base"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {title.charAt(0).toUpperCase() || node.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="text-gray-200">
                  Node Image (Optional)
                </Label>
                <div className="mt-2 space-y-4">
                  {image && (
                    <div className="relative">
                      <img
                        src={image || "/placeholder.svg"}
                        alt="Node preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setImage("")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      className="flex items-center gap-2 border-gray-600 text-gray-200 hover:bg-gray-700"
                    >
                      <Upload className="w-4 h-4" />
                      {image ? "Change Image" : "Upload Image"}
                    </Button>
                    {!image && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        No image selected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-200">Connections</Label>
                <div className="mt-2 space-y-4">
                  {/* Selected connections */}
                  {selectedConnections.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-300 mb-2">Selected connections:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedConnections.map((nodeId) => {
                          const connectedNode = getNodeById(nodeId)
                          return (
                            <div
                              key={nodeId}
                              className="flex items-center bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-700/50"
                            >
                              <span>{connectedNode?.title || "Unknown Node"}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveConnection(nodeId)}
                                className="ml-2 hover:text-blue-200"
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
                        className="pl-10 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                      />
                    </div>

                    {/* Search results */}
                    {searchTerm && (
                      <div className="mt-2 max-h-40 overflow-y-auto border border-gray-600 rounded-md bg-gray-700">
                        {filteredNodes.length > 0 ? (
                          filteredNodes
                            .filter((searchNode) => !selectedConnections.includes(searchNode.id))
                            .map((searchNode) => (
                              <button
                                key={searchNode.id}
                                type="button"
                                onClick={() => handleAddConnection(searchNode.id)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-600 border-b border-gray-600 last:border-b-0 flex items-center gap-3"
                              >
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: searchNode.color }}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-200">{searchNode.title}</div>
                                  <div className="text-sm text-gray-400">
                                    {searchNode.description?.substring(0, 60)}...
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 capitalize">{searchNode.size}</div>
                              </button>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-gray-400 text-sm">No nodes found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/node/${node.id.toLowerCase()}`)}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function EditNodePage({ params }: EditNodePageProps) {
  return (
    <ProtectedRoute>
      <EditNodePageContent params={params} />
    </ProtectedRoute>
  )
}
