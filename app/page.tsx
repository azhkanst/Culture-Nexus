"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGraphData, deleteNode, type Node, type Connection } from "@/lib/node-storage"
import { Trash2 } from "lucide-react"

export default function NodeGraph() {
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [deleteMode, setDeleteMode] = useState(false)

  useEffect(() => {
    const data = getGraphData()
    setNodes(data.nodes)
    setConnections(data.connections)
  }, [])

  const getNodeById = (id: string) => nodes.find((node) => node.id === id)

  const handleNodeClick = (nodeId: string) => {
    router.push(`/node/${nodeId.toLowerCase()}`)
  }

  const handleDeleteNode = (nodeId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm(`Are you sure you want to delete this node? This will also remove all its connections.`)) {
      deleteNode(nodeId)
      const data = getGraphData()
      setNodes(data.nodes)
      setConnections(data.connections)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Node Graph Visualization</h1>
          <div className="flex gap-3">
            <Button
              variant={deleteMode ? "destructive" : "outline"}
              onClick={() => setDeleteMode(!deleteMode)}
              className={deleteMode ? "bg-red-600 hover:bg-red-700" : ""}
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="overflow-x-auto">
            <svg width="900" height="600" className="mx-auto border border-gray-100 rounded">
              {/* Render connections */}
              {connections.map((connection, index) => {
                const fromNode = getNodeById(connection.from)
                const toNode = getNodeById(connection.to)

                if (!fromNode || !toNode) return null

                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#6b7280"
                    strokeWidth="2"
                  />
                )
              })}

              {/* Render nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="35"
                    fill={
                      deleteMode
                        ? hoveredNode === node.id
                          ? "#dc2626"
                          : "#fca5a5"
                        : hoveredNode === node.id
                          ? "#3b82f6"
                          : "#e5e7eb"
                    }
                    stroke="#374151"
                    strokeWidth="2"
                    className="cursor-pointer transition-colors duration-200"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => (deleteMode ? handleDeleteNode(node.id, e) : handleNodeClick(node.id))}
                  />

                  {/* Node label only - no ID display */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-semibold fill-gray-800 cursor-pointer select-none"
                    onClick={(e) => (deleteMode ? handleDeleteNode(node.id, e) : handleNodeClick(node.id))}
                  >
                    {deleteMode ? "×" : node.label.length > 15 ? node.label.substring(0, 15) + "..." : node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <p className="text-center text-gray-600 mt-4">
            {deleteMode
              ? "Click on any node to delete it • Click 'Exit Delete Mode' when done"
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
