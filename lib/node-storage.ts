export type NodeSize = "small" | "medium" | "large"

export interface ExternalLink {
  text: string
  url: string
}

export interface Node {
  id: string
  x: number
  y: number
  label: string
  title: string
  description: string
  image?: string
  size: NodeSize
  color: string
  externalLinks?: ExternalLink[]
}

export interface Connection {
  from: string
  to: string
}

export interface Map {
  id: string
  title: string
  nodes: Node[]
  connections: Connection[]
  createdAt: string
}

export interface GraphData {
  maps: Map[]
  currentMapId: string | null
}

// Function to generate random string ID
function generateRandomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Function to ensure unique ID
function generateUniqueId(existingIds: string[]): string {
  let newId = generateRandomId()
  while (existingIds.includes(newId)) {
    newId = generateRandomId()
  }
  return newId
}

// Get radius based on node size
export function getNodeRadius(size: NodeSize): number {
  switch (size) {
    case "small":
      return 25
    case "medium":
      return 35
    case "large":
      return 45
    default:
      return 35
  }
}

// Get font size based on node size
export function getNodeFontSize(size: NodeSize): string {
  switch (size) {
    case "small":
      return "text-xs"
    case "medium":
      return "text-sm"
    case "large":
      return "text-base"
    default:
      return "text-sm"
  }
}

// Force-directed layout algorithm
function applyForceDirectedLayout(nodes: Node[], connections: Connection[]): Node[] {
  const canvasWidth = 900
  const canvasHeight = 600
  const margin = 80

  // Physics parameters
  const repulsionStrength = 8000
  const attractionStrength = 0.01
  const minDistance = 100
  const connectedDistance = 80
  const iterations = 300
  const damping = 0.9

  // Create a copy of nodes to modify
  const layoutNodes = nodes.map((node) => ({ ...node }))

  for (let iter = 0; iter < iterations; iter++) {
    const forces: { [id: string]: { x: number; y: number } } = {}

    // Initialize forces
    layoutNodes.forEach((node) => {
      forces[node.id] = { x: 0, y: 0 }
    })

    // Repulsion forces (all nodes repel each other)
    for (let i = 0; i < layoutNodes.length; i++) {
      for (let j = i + 1; j < layoutNodes.length; j++) {
        const nodeA = layoutNodes[i]
        const nodeB = layoutNodes[j]

        const dx = nodeA.x - nodeB.x
        const dy = nodeA.y - nodeB.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          const force = repulsionStrength / (distance * distance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          forces[nodeA.id].x += fx
          forces[nodeA.id].y += fy
          forces[nodeB.id].x -= fx
          forces[nodeB.id].y -= fy
        }
      }
    }

    // Attraction forces (connected nodes attract each other)
    connections.forEach((connection) => {
      const nodeA = layoutNodes.find((n) => n.id === connection.from)
      const nodeB = layoutNodes.find((n) => n.id === connection.to)

      if (nodeA && nodeB) {
        const dx = nodeB.x - nodeA.x
        const dy = nodeB.y - nodeA.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 0) {
          const targetDistance = connectedDistance
          const force = attractionStrength * (distance - targetDistance)
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          forces[nodeA.id].x += fx
          forces[nodeA.id].y += fy
          forces[nodeB.id].x -= fx
          forces[nodeB.id].y -= fy
        }
      }
    })

    // Apply forces with damping
    layoutNodes.forEach((node) => {
      const force = forces[node.id]
      node.x += force.x * damping
      node.y += force.y * damping

      // Keep nodes within bounds with size consideration
      const radius = getNodeRadius(node.size)
      node.x = Math.max(margin + radius, Math.min(canvasWidth - margin - radius, node.x))
      node.y = Math.max(margin + radius, Math.min(canvasHeight - margin - radius, node.y))
    })
  }

  return layoutNodes
}

// Function to calculate initial position for new nodes
function calculateNodePosition(
  existingNodes: Node[],
  connections: Connection[],
  newConnections: string[],
): { x: number; y: number } {
  const canvasWidth = 900
  const canvasHeight = 600
  const margin = 80

  if (newConnections.length === 0) {
    // No connections, place randomly
    return {
      x: margin + Math.random() * (canvasWidth - 2 * margin),
      y: margin + Math.random() * (canvasHeight - 2 * margin),
    }
  }

  // Place near connected nodes
  const connectedNodes = existingNodes.filter((node) => newConnections.includes(node.id))

  if (connectedNodes.length > 0) {
    const avgX = connectedNodes.reduce((sum, node) => sum + node.x, 0) / connectedNodes.length
    const avgY = connectedNodes.reduce((sum, node) => sum + node.y, 0) / connectedNodes.length

    // Add some randomness around the average position
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 100

    return {
      x: Math.max(margin, Math.min(canvasWidth - margin, avgX + offsetX)),
      y: Math.max(margin, Math.min(canvasHeight - margin, avgY + offsetY)),
    }
  }

  // Fallback to random position
  return {
    x: margin + Math.random() * (canvasWidth - 2 * margin),
    y: margin + Math.random() * (canvasHeight - 2 * margin),
  }
}

// Create default map
function createDefaultMap(): Map {
  const defaultNodes: Node[] = [
    {
      id: "A7X9K2",
      x: 200,
      y: 150,
      label: "Node A",
      title: "Node A",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      size: "medium",
      color: "#3b82f6",
      externalLinks: [
        { text: "Example Site", url: "https://example.com" },
        { text: "Google", url: "https://google.com" },
      ],
    },
    {
      id: "B3M8L5",
      x: 300,
      y: 120,
      label: "Node B",
      title: "Node B",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
      size: "medium",
      color: "#10b981",
    },
    {
      id: "C9N4P1",
      x: 280,
      y: 220,
      label: "Node C",
      title: "Node C",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
      size: "medium",
      color: "#f59e0b",
    },
    {
      id: "D6Q2R8",
      x: 380,
      y: 250,
      label: "Node D",
      title: "Node D",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam.",
      size: "medium",
      color: "#ef4444",
    },
    {
      id: "Z5T7W3",
      x: 350,
      y: 320,
      label: "Node Z",
      title: "Node Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate vestibulum lorem. Fusce sagittis, libero non molestie mollis.",
      size: "medium",
      color: "#8b5cf6",
      externalLinks: [{ text: "GitHub", url: "https://github.com" }],
    },
  ]

  const defaultConnections: Connection[] = [
    { from: "A7X9K2", to: "B3M8L5" },
    { from: "A7X9K2", to: "C9N4P1" },
    { from: "C9N4P1", to: "D6Q2R8" },
    { from: "C9N4P1", to: "Z5T7W3" },
  ]

  const layoutNodes = applyForceDirectedLayout(defaultNodes, defaultConnections)

  return {
    id: "default",
    title: "Default Map",
    nodes: layoutNodes,
    connections: defaultConnections,
    createdAt: new Date().toISOString(),
  }
}

export function getGraphData(): GraphData {
  if (typeof window === "undefined") {
    const defaultMap = createDefaultMap()
    return { maps: [defaultMap], currentMapId: "default" }
  }

  const stored = localStorage.getItem("graphData")
  if (stored) {
    const data = JSON.parse(stored)
    // Ensure we have the new structure and migrate old nodes
    if (!data.maps) {
      const defaultMap = createDefaultMap()
      return { maps: [defaultMap], currentMapId: "default" }
    }

    // Migrate nodes that don't have size/color/externalLinks properties
    data.maps.forEach((map: Map) => {
      map.nodes.forEach((node: Node) => {
        if (!node.size) node.size = "medium"
        if (!node.color) node.color = "#3b82f6"
        if (!node.externalLinks) {
          node.externalLinks = []
        } else {
          // Migrate old string array format to new object format
          node.externalLinks = node.externalLinks.map((link: any) => {
            if (typeof link === "string") {
              return { text: link, url: link }
            }
            return link
          })
        }
      })
    })

    return data
  }

  const defaultMap = createDefaultMap()
  const defaultData = { maps: [defaultMap], currentMapId: "default" }
  localStorage.setItem("graphData", JSON.stringify(defaultData))
  return defaultData
}

export function getCurrentMap(): Map | null {
  const data = getGraphData()
  if (!data.currentMapId) return null
  return data.maps.find((map) => map.id === data.currentMapId) || null
}

export function saveGraphData(data: GraphData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("graphData", JSON.stringify(data))
  }
}

export function createMap(title: string): string {
  const data = getGraphData()
  const mapId = generateUniqueId(data.maps.map((m) => m.id))

  const newMap: Map = {
    id: mapId,
    title,
    nodes: [],
    connections: [],
    createdAt: new Date().toISOString(),
  }

  data.maps.push(newMap)
  data.currentMapId = mapId
  saveGraphData(data)
  return mapId
}

export function switchToMap(mapId: string): void {
  const data = getGraphData()
  if (data.maps.find((map) => map.id === mapId)) {
    data.currentMapId = mapId
    saveGraphData(data)
  }
}

export function deleteMap(mapId: string): void {
  const data = getGraphData()
  if (data.maps.length <= 1) return // Don't delete the last map

  data.maps = data.maps.filter((map) => map.id !== mapId)
  if (data.currentMapId === mapId) {
    data.currentMapId = data.maps[0].id
  }
  saveGraphData(data)
}

export function addNode(node: Omit<Node, "id" | "x" | "y">, connections: string[]): void {
  const data = getGraphData()
  const currentMap = getCurrentMap()
  if (!currentMap) return

  // Generate unique random ID
  const existingIds = currentMap.nodes.map((n) => n.id)
  const newId = generateUniqueId(existingIds)

  // Calculate initial position based on connections
  const position = calculateNodePosition(currentMap.nodes, currentMap.connections, connections)

  const newNode: Node = {
    ...node,
    id: newId,
    x: position.x,
    y: position.y,
    label: node.title,
    externalLinks: node.externalLinks || [],
  }

  // Add new connections
  const newConnections: Connection[] = connections.map((targetId) => ({
    from: newId,
    to: targetId,
  }))

  currentMap.nodes.push(newNode)
  currentMap.connections.push(...newConnections)

  // Apply force-directed layout to the entire graph
  const layoutNodes = applyForceDirectedLayout(currentMap.nodes, currentMap.connections)
  currentMap.nodes = layoutNodes

  // Update the map in the data
  const mapIndex = data.maps.findIndex((map) => map.id === currentMap.id)
  if (mapIndex !== -1) {
    data.maps[mapIndex] = currentMap
  }

  saveGraphData(data)
}

export function editNode(
  nodeId: string,
  updates: Partial<Omit<Node, "id" | "x" | "y">>,
  newConnections: string[],
): void {
  const data = getGraphData()
  const currentMap = getCurrentMap()
  if (!currentMap) return

  // Find and update the node
  const nodeIndex = currentMap.nodes.findIndex((node) => node.id === nodeId)
  if (nodeIndex === -1) return

  const existingNode = currentMap.nodes[nodeIndex]
  const updatedNode = {
    ...existingNode,
    ...updates,
    label: updates.title || existingNode.title, // Update label when title changes
    externalLinks: updates.externalLinks || existingNode.externalLinks || [],
  }

  currentMap.nodes[nodeIndex] = updatedNode

  // Remove existing connections for this node
  currentMap.connections = currentMap.connections.filter(
    (connection) => connection.from !== nodeId && connection.to !== nodeId,
  )

  // Add new connections
  const connections: Connection[] = newConnections.map((targetId) => ({
    from: nodeId,
    to: targetId,
  }))

  currentMap.connections.push(...connections)

  // Apply force-directed layout to the entire graph
  const layoutNodes = applyForceDirectedLayout(currentMap.nodes, currentMap.connections)
  currentMap.nodes = layoutNodes

  // Update the map in the data
  const mapIndex = data.maps.findIndex((map) => map.id === currentMap.id)
  if (mapIndex !== -1) {
    data.maps[mapIndex] = currentMap
  }

  saveGraphData(data)
}

export function deleteNode(nodeId: string): void {
  const data = getGraphData()
  const currentMap = getCurrentMap()
  if (!currentMap) return

  // Remove the node
  currentMap.nodes = currentMap.nodes.filter((node) => node.id !== nodeId)

  // Remove all connections involving this node
  currentMap.connections = currentMap.connections.filter(
    (connection) => connection.from !== nodeId && connection.to !== nodeId,
  )

  // Reapply layout after deletion
  if (currentMap.nodes.length > 0) {
    const layoutNodes = applyForceDirectedLayout(currentMap.nodes, currentMap.connections)
    currentMap.nodes = layoutNodes
  }

  // Update the map in the data
  const mapIndex = data.maps.findIndex((map) => map.id === currentMap.id)
  if (mapIndex !== -1) {
    data.maps[mapIndex] = currentMap
  }

  saveGraphData(data)
}
