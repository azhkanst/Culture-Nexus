"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, MapIcon, Shield, User, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getGraphData, createMap, switchToMap, deleteMap, type Map } from "@/lib/node-storage"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import ProtectedRoute from "@/components/protected-route"

function MapsPageContent() {
  const router = useRouter()
  const [maps, setMaps] = useState<Map[]>([])
  const [currentMapId, setCurrentMapId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMapTitle, setNewMapTitle] = useState("")
  const [user, setUser] = useState(getCurrentUser())

  // Add a new state for search term
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMaps, setFilteredMaps] = useState<Map[]>([])

  useEffect(() => {
    const data = getGraphData()
    setMaps(data.maps)
    setCurrentMapId(data.currentMapId)
  }, [])

  // Add a useEffect to filter maps based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMaps(maps)
    } else {
      const filtered = maps.filter(
        (map) =>
          map.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          map.nodes.some(
            (node) =>
              node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
              node.description.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
      setFilteredMaps(filtered)
    }
  }, [searchTerm, maps])

  // Add a function to clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  const handleCreateMap = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin()) {
      alert("Only administrators can create maps")
      return
    }
    if (!newMapTitle.trim()) {
      alert("Please enter a map title")
      return
    }

    const mapId = createMap(newMapTitle.trim())
    const data = getGraphData()
    setMaps(data.maps)
    setCurrentMapId(mapId)
    setNewMapTitle("")
    setShowCreateForm(false)
    router.push("/")
  }

  const handleSwitchMap = (mapId: string) => {
    switchToMap(mapId)
    setCurrentMapId(mapId)
    router.push("/")
  }

  const handleDeleteMap = (mapId: string) => {
    if (!isAdmin()) {
      alert("Only administrators can delete maps")
      return
    }
    if (maps.length <= 1) {
      alert("Cannot delete the last map")
      return
    }

    if (confirm("Are you sure you want to delete this map? This action cannot be undone.")) {
      deleteMap(mapId)
      const data = getGraphData()
      setMaps(data.maps)
      setCurrentMapId(data.currentMapId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Graph
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Maps</h1>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
              {user?.role === "admin" ? (
                <Shield className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-green-400" />
              )}
              <span className="text-sm font-medium capitalize text-gray-200">{user?.role}</span>
            </div>
            {/* Update the JSX to include the search bar - add this after the user role indicator div and before the Create New Map button */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search maps by title or content..."
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
          {isAdmin() && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Map
            </Button>
          )}
        </div>

        {/* Guest Mode Notice */}
        {!isAdmin() && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200 font-medium">Guest Mode</p>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              You can view and switch between maps, but cannot create or delete them.
            </p>
          </div>
        )}

        {/* Create Map Form */}
        {showCreateForm && isAdmin() && (
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Create New Map</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateMap} className="space-y-4">
                <div>
                  <Label htmlFor="mapTitle" className="text-gray-200">
                    Map Title
                  </Label>
                  <Input
                    id="mapTitle"
                    value={newMapTitle}
                    onChange={(e) => setNewMapTitle(e.target.value)}
                    placeholder="Enter map title"
                    className="mt-1 bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Map
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-600 text-gray-200 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Update the maps grid to use filteredMaps instead of maps */}
          {filteredMaps.map((map) => (
            <Card
              key={map.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-gray-800 border-gray-700 ${
                currentMapId === map.id ? "ring-2 ring-blue-500 bg-blue-900/20" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-lg text-white">{map.title}</CardTitle>
                  </div>
                  {currentMapId === map.id && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Current</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-300">
                    <div>Nodes: {map.nodes.length}</div>
                    <div>Connections: {map.connections.length}</div>
                    <div>Created: {new Date(map.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSwitchMap(map.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={currentMapId === map.id}
                    >
                      {currentMapId === map.id ? "Current Map" : "Open Map"}
                    </Button>
                    {maps.length > 1 && isAdmin() && (
                      <Button
                        onClick={() => handleDeleteMap(map.id)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Update the "No maps found" condition to check filteredMaps.length */}
        {filteredMaps.length === 0 && (
          <div className="text-center py-12 col-span-full">
            {maps.length === 0 ? (
              <>
                <MapIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No maps found</h3>
                <p className="text-gray-400 mb-4">Create your first map to get started</p>
                {isAdmin() && (
                  <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Map
                  </Button>
                )}
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No matching maps</h3>
                <p className="text-gray-400 mb-4">Try a different search term</p>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700 bg-transparent"
                >
                  Clear Search
                </Button>
              </>
            )}
          </div>
        )}

        {/* Add search results info when there are results and a search term */}
        {searchTerm && filteredMaps.length > 0 && (
          <div className="col-span-full mb-4">
            <p className="text-sm text-gray-300">
              Found {filteredMaps.length} map{filteredMaps.length === 1 ? "" : "s"} matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MapsPage() {
  return (
    <ProtectedRoute>
      <MapsPageContent />
    </ProtectedRoute>
  )
}
