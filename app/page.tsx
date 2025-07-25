"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Plus,
  MapIcon,
  LogOut,
  User,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentMap, deleteNode, getNodeRadius, type Node, type Connection, type NodeSize } from "@/lib/node-storage"
import { getCurrentUser, logout, isAdmin } from "@/lib/auth"
import { Trash2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

function NodeGraphContent() {
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [deleteMode, setDeleteMode] = useState(false)
  const [currentMapTitle, setCurrentMapTitle] = useState<string>("")
  const [user, setUser] = useState(getCurrentUser())
  const [zoomLevel, setZoomLevel] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredNodes, setFilteredNodes] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Pan state
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const currentMap = getCurrentMap()
    if (currentMap) {
      setNodes(currentMap.nodes)
      setConnections(currentMap.connections)
      setCurrentMapTitle(currentMap.title)
    } else {
      // No current map, redirect to maps page
      router.push("/maps")
    }
  }, [router])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNodes([])
    } else {
      const filtered = nodes
        .filter(
          (node) =>
            node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .map((node) => node.id)
      setFilteredNodes(filtered)
    }
  }, [searchTerm, nodes])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const getNodeById = (id: string) => nodes.find((node) => node.id === id)

  const handleNodeClick = (nodeId: string) => {
    if (!isPanning) {
      router.push(`/node/${nodeId.toLowerCase()}`)
    }
  }

  const handleDeleteNode = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (!isAdmin()) {
      alert("Only administrators can delete nodes")
      return
    }
    if (confirm(`Are you sure you want to delete this node? This will also remove all its connections.`)) {
      deleteNode(nodeId)
      const currentMap = getCurrentMap()
      if (currentMap) {
        setNodes(currentMap.nodes)
        setConnections(currentMap.connections)
      }
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    // Reset zoom and pan when entering/exiting fullscreen
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const clearSearch = () => {
    setSearchTerm("")
    setFilteredNodes([])
  }

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x
      const deltaY = e.clientY - lastPanPoint.y

      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))

      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handleMouseLeave = () => {
    setIsPanning(false)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1 && e.target === svgRef.current) {
      const touch = e.touches[0]
      setIsPanning(true)
      setLastPanPoint({ x: touch.clientX, y: touch.clientY })
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - lastPanPoint.x
      const deltaY = touch.clientY - lastPanPoint.y

      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))

      setLastPanPoint({ x: touch.clientX, y: touch.clientY })
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
  }

  // Function to lighten a color for hover effect
  const lightenColor = (color: string, amount = 20) => {
    const hex = color.replace("#", "")
    const r = Math.min(255, Number.parseInt(hex.substr(0, 2), 16) + amount)
    const g = Math.min(255, Number.parseInt(hex.substr(2, 2), 16) + amount)
    const b = Math.min(255, Number.parseInt(hex.substr(4, 2), 16) + amount)
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  // Function to determine node opacity based on search
  const getNodeOpacity = (nodeId: string) => {
    if (searchTerm.trim() === "") return 1
    return filteredNodes.includes(nodeId) ? 1 : 0.3
  }

  // Function to determine if node should be highlighted
  const isNodeHighlighted = (nodeId: string) => {
    return searchTerm.trim() !== "" && filteredNodes.includes(nodeId)
  }

  // Function to split text into lines that fit within the node
  const getTextLines = (text: string, nodeSize: NodeSize): { lines: string[]; fontSize: number } => {
    const radius = getNodeRadius(nodeSize)

    // Base font sizes for different node sizes
    const baseSizes = {
      small: 12,
      medium: 14,
      large: 16,
    }

    // Minimum font sizes
    const minSizes = {
      small: 8,
      medium: 9,
      large: 10,
    }

    // Calculate available width (roughly 80% of diameter to account for padding)
    const availableWidth = radius * 2 * 0.8

    // Try different font sizes starting from base size
    for (let fontSize = baseSizes[nodeSize]; fontSize >= minSizes[nodeSize]; fontSize -= 0.5) {
      const avgCharWidth = fontSize * 0.6
      const maxCharsPerLine = Math.floor(availableWidth / avgCharWidth)

      // Try single line first
      if (text.length <= maxCharsPerLine) {
        return { lines: [text], fontSize }
      }

      // Try wrapping if text contains spaces
      if (text.includes(" ")) {
        const words = text.split(" ")
        const lines: string[] = []
        let currentLine = ""

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word

          if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine
          } else {
            if (currentLine) {
              lines.push(currentLine)
              currentLine = word
            } else {
              // Single word is too long, truncate it
              lines.push(word.substring(0, maxCharsPerLine - 3) + "...")
              currentLine = ""
            }
          }
        }

        if (currentLine) {
          lines.push(currentLine)
        }

        // Check if we can fit the lines vertically (max 3 lines for readability)
        const maxLines = nodeSize === "large" ? 3 : nodeSize === "medium" ? 2 : 2
        if (lines.length <= maxLines) {
          return { lines, fontSize }
        }
      }
    }

    // Fallback: use minimum font size with truncation
    const fontSize = minSizes[nodeSize]
    const avgCharWidth = fontSize * 0.6
    const maxCharsPerLine = Math.floor(availableWidth / avgCharWidth)

    if (text.length <= maxCharsPerLine) {
      return { lines: [text], fontSize }
    } else {
      return { lines: [text.substring(0, maxCharsPerLine - 3) + "..."], fontSize }
    }
  }

  // Calculate SVG dimensions based on fullscreen mode
  const svgWidth = isFullscreen ? window.innerWidth - 40 : 900
  const svgHeight = isFullscreen ? window.innerHeight - 40 : 600
  const svgCenterX = svgWidth / 2
  const svgCenterY = svgHeight / 2

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 p-5">
        {/* Fullscreen Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Node Graph - {currentMapTitle}</h1>

            {/* Search Bar in Fullscreen */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nodes..."
                className="pl-10 pr-10 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg border border-gray-700 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="text-gray-200 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[60px] text-center text-gray-200">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="text-gray-200 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-600 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                title="Reset zoom and pan"
                className="text-gray-200 hover:bg-gray-700 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Exit Fullscreen */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <Minimize className="w-4 h-4 mr-2" />
              Exit Fullscreen
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-200 text-sm">
              {filteredNodes.length > 0
                ? `Found ${filteredNodes.length} node${filteredNodes.length === 1 ? "" : "s"} matching "${searchTerm}"`
                : `No nodes found matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Fullscreen SVG */}
        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className={`w-full h-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
          >
            <g
              transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
              style={{
                transformOrigin: `${svgCenterX}px ${svgCenterY}px`,
                transition: isPanning ? "none" : "transform 0.2s ease-in-out",
              }}
            >
              {/* Render connections */}
              {connections.map((connection, index) => {
                const fromNode = getNodeById(connection.from)
                const toNode = getNodeById(connection.to)

                if (!fromNode || !toNode) return null

                // Determine connection opacity based on search
                const connectionOpacity =
                  searchTerm.trim() === ""
                    ? 1
                    : filteredNodes.includes(fromNode.id) || filteredNodes.includes(toNode.id)
                      ? 1
                      : 0.3

                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#9ca3af"
                    strokeWidth="2"
                    opacity={connectionOpacity}
                  />
                )
              })}

              {/* Render nodes */}
              {nodes.map((node) => {
                const radius = getNodeRadius(node.size)
                const nodeOpacity = getNodeOpacity(node.id)
                const isHighlighted = isNodeHighlighted(node.id)

                const nodeColor =
                  deleteMode && isAdmin()
                    ? hoveredNode === node.id
                      ? "#dc2626"
                      : "#fca5a5"
                    : hoveredNode === node.id
                      ? lightenColor(node.color, 30)
                      : node.color

                // Get text lines and font size
                const displayText = deleteMode && isAdmin() ? "×" : node.label
                const { lines, fontSize } = getTextLines(displayText, node.size)
                const lineHeight = fontSize * 1.1
                const totalTextHeight = lines.length * lineHeight
                const startY = node.y - totalTextHeight / 2 + lineHeight / 2

                return (
                  <g key={node.id} opacity={nodeOpacity}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={nodeColor}
                      stroke={isHighlighted ? "#fbbf24" : "#6b7280"}
                      strokeWidth={isHighlighted ? "4" : "2"}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (deleteMode && isAdmin()) {
                          handleDeleteNode(node.id, e)
                        } else {
                          handleNodeClick(node.id)
                        }
                      }}
                    />

                    {/* Highlight ring for searched nodes */}
                    {isHighlighted && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius + 8}
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node label with multiple lines */}
                    <text
                      x={node.x}
                      y={startY}
                      textAnchor="middle"
                      className="font-semibold fill-white cursor-pointer select-none drop-shadow-sm"
                      style={{ fontSize: `${fontSize}px` }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (deleteMode && isAdmin()) {
                          handleDeleteNode(node.id, e)
                        } else {
                          handleNodeClick(node.id)
                        }
                      }}
                    >
                      {lines.map((line, index) => (
                        <tspan key={index} x={node.x} dy={index === 0 ? 0 : lineHeight} dominantBaseline="middle">
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Fullscreen Footer */}
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            {deleteMode && isAdmin()
              ? "Click on any node to delete it • Press ESC to exit fullscreen"
              : searchTerm
                ? `Showing search results for "${searchTerm}" • ${filteredNodes.length} of ${nodes.length} nodes highlighted • Press ESC to exit fullscreen`
                : `${nodes.length} nodes, ${connections.length} connections • Press ESC to exit fullscreen`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Node Graph Visualization</h1>
            <p className="text-gray-300 mt-1">Current Map: {currentMapTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
              {user?.role === "admin" ? (
                <Shield className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-green-400" />
              )}
              <span className="text-sm font-medium capitalize text-gray-200">{user?.role}</span>
            </div>

            <Link href="/maps">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white bg-transparent"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Maps
              </Button>
            </Link>

            {isAdmin() && (
              <>
                <Button
                  variant={deleteMode ? "destructive" : "outline"}
                  onClick={() => setDeleteMode(!deleteMode)}
                  className={
                    deleteMode
                      ? "bg-red-600 hover:bg-red-700"
                      : "border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white bg-transparent"
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMode ? "Exit Delete Mode" : "Delete Mode"}
                </Button>
                <Link href="/add-node">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Guest Mode Notice */}
        {!isAdmin() && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200 font-medium">Guest Mode</p>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              You are viewing in read-only mode. Login as admin to edit nodes and maps.
            </p>
          </div>
        )}

        {/* Search and Zoom Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nodes by title or description..."
              className="pl-10 pr-10 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg border border-gray-700 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="text-gray-200 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[60px] text-center text-gray-200">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="text-gray-200 hover:bg-gray-700 hover:text-white disabled:text-gray-500"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-gray-600 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                title="Reset zoom and pan"
                className="text-gray-200 hover:bg-gray-700 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white bg-transparent"
              title="Enter fullscreen mode"
            >
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
            <p className="text-green-200 text-sm">
              {filteredNodes.length > 0
                ? `Found ${filteredNodes.length} node${filteredNodes.length === 1 ? "" : "s"} matching "${searchTerm}"`
                : `No nodes found matching "${searchTerm}"`}
            </p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
          <div className="overflow-hidden">
            <svg
              ref={svgRef}
              width="900"
              height="600"
              className={`mx-auto border border-gray-600 rounded ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: "none" }}
            >
              <g
                transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                style={{
                  transformOrigin: "450px 300px", // Center of the 900x600 SVG
                  transition: isPanning ? "none" : "transform 0.2s ease-in-out",
                }}
              >
                {/* Render connections */}
                {connections.map((connection, index) => {
                  const fromNode = getNodeById(connection.from)
                  const toNode = getNodeById(connection.to)

                  if (!fromNode || !toNode) return null

                  // Determine connection opacity based on search
                  const connectionOpacity =
                    searchTerm.trim() === ""
                      ? 1
                      : filteredNodes.includes(fromNode.id) || filteredNodes.includes(toNode.id)
                        ? 1
                        : 0.3

                  return (
                    <line
                      key={index}
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#9ca3af"
                      strokeWidth="2"
                      opacity={connectionOpacity}
                    />
                  )
                })}

                {/* Render nodes */}
                {nodes.map((node) => {
                  const radius = getNodeRadius(node.size)
                  const nodeOpacity = getNodeOpacity(node.id)
                  const isHighlighted = isNodeHighlighted(node.id)

                  const nodeColor =
                    deleteMode && isAdmin()
                      ? hoveredNode === node.id
                        ? "#dc2626"
                        : "#fca5a5"
                      : hoveredNode === node.id
                        ? lightenColor(node.color, 30)
                        : node.color

                  // Get text lines and font size
                  const displayText = deleteMode && isAdmin() ? "×" : node.label
                  const { lines, fontSize } = getTextLines(displayText, node.size)
                  const lineHeight = fontSize * 1.1
                  const totalTextHeight = lines.length * lineHeight
                  const startY = node.y - totalTextHeight / 2 + lineHeight / 2

                  return (
                    <g key={node.id} opacity={nodeOpacity}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={radius}
                        fill={nodeColor}
                        stroke={isHighlighted ? "#fbbf24" : "#6b7280"}
                        strokeWidth={isHighlighted ? "4" : "2"}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (deleteMode && isAdmin()) {
                            handleDeleteNode(node.id, e)
                          } else {
                            handleNodeClick(node.id)
                          }
                        }}
                      />

                      {/* Highlight ring for searched nodes */}
                      {isHighlighted && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius + 8}
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}

                      {/* Node label with multiple lines */}
                      <text
                        x={node.x}
                        y={startY}
                        textAnchor="middle"
                        className="font-semibold fill-white cursor-pointer select-none drop-shadow-sm"
                        style={{ fontSize: `${fontSize}px` }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (deleteMode && isAdmin()) {
                            handleDeleteNode(node.id, e)
                          } else {
                            handleNodeClick(node.id)
                          }
                        }}
                      >
                        {lines.map((line, index) => (
                          <tspan key={index} x={node.x} dy={index === 0 ? 0 : lineHeight} dominantBaseline="middle">
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          <p className="text-center text-gray-300 mt-4">
            {deleteMode && isAdmin()
              ? "Click on any node to delete it • Click 'Exit Delete Mode' when done"
              : searchTerm
                ? `Showing search results for "${searchTerm}" • ${filteredNodes.length} of ${nodes.length} nodes highlighted`
                : "Click on any node to view its details • " +
                  nodes.length +
                  " nodes, " +
                  connections.length +
                  " connections"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function NodeGraph() {
  return (
    <ProtectedRoute>
      <NodeGraphContent />
    </ProtectedRoute>
  )
}
