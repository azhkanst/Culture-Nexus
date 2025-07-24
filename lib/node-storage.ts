export interface Node {
  id: string
  x: number
  y: number
  label: string
  title: string
  description: string
}

export interface Connection {
  from: string
  to: string
}

export interface GraphData {
  nodes: Node[]
  connections: Connection[]
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

      // Keep nodes within bounds
      node.x = Math.max(margin, Math.min(canvasWidth - margin, node.x))
      node.y = Math.max(margin, Math.min(canvasHeight - margin, node.y))
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

const defaultNodes: Node[] = [
  {
    id: "A7X9K2",
    x: 200,
    y: 150,
    label: "Node A",
    title: "Node A",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "B3M8L5",
    x: 300,
    y: 120,
    label: "Node B",
    title: "Node B",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
  },
  {
    id: "C9N4P1",
    x: 280,
    y: 220,
    label: "Node C",
    title: "Node C",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
  },
  {
    id: "D6Q2R8",
    x: 380,
    y: 250,
    label: "Node D",
    title: "Node D",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam.",
  },
  {
    id: "Z5T7W3",
    x: 350,
    y: 320,
    label: "Node Z",
    title: "Node Z",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vulputate vestibulum lorem. Fusce sagittis, libero non molestie mollis.",
  },
]

const defaultConnections: Connection[] = [
  { from: "A7X9K2", to: "B3M8L5" },
  { from: "A7X9K2", to: "C9N4P1" },
  { from: "C9N4P1", to: "D6Q2R8" },
  { from: "C9N4P1", to: "Z5T7W3" },
]

export function getGraphData(): GraphData {
  if (typeof window === "undefined") {
    return { nodes: defaultNodes, connections: defaultConnections }
  }

  const stored = localStorage.getItem("graphData")
  if (stored) {
    const data = JSON.parse(stored)
    // Apply force-directed layout to stored data
    const layoutNodes = applyForceDirectedLayout(data.nodes, data.connections)
    return { nodes: layoutNodes, connections: data.connections }
  }

  // Apply force-directed layout to default data
  const layoutNodes = applyForceDirectedLayout(defaultNodes, defaultConnections)
  const defaultData = { nodes: layoutNodes, connections: defaultConnections }
  localStorage.setItem("graphData", JSON.stringify(defaultData))
  return defaultData
}

export function saveGraphData(data: GraphData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("graphData", JSON.stringify(data))
  }
}

export function addNode(node: Omit<Node, "id" | "x" | "y">, connections: string[]): void {
  const data = getGraphData()

  // Generate unique random ID
  const existingIds = data.nodes.map((n) => n.id)
  const newId = generateUniqueId(existingIds)

  // Calculate initial position based on connections
  const position = calculateNodePosition(data.nodes, data.connections, connections)

  const newNode: Node = {
    ...node,
    id: newId,
    x: position.x,
    y: position.y,
    label: node.title,
  }

  // Add new connections
  const newConnections: Connection[] = connections.map((targetId) => ({
    from: newId,
    to: targetId,
  }))

  data.nodes.push(newNode)
  data.connections.push(...newConnections)

  // Apply force-directed layout to the entire graph
  const layoutNodes = applyForceDirectedLayout(data.nodes, data.connections)
  data.nodes = layoutNodes

  saveGraphData(data)
}

export function deleteNode(nodeId: string): void {
  const data = getGraphData()

  // Remove the node
  data.nodes = data.nodes.filter((node) => node.id !== nodeId)

  // Remove all connections involving this node
  data.connections = data.connections.filter((connection) => connection.from !== nodeId && connection.to !== nodeId)

  // Reapply layout after deletion
  if (data.nodes.length > 0) {
    const layoutNodes = applyForceDirectedLayout(data.nodes, data.connections)
    data.nodes = layoutNodes
  }

  saveGraphData(data)
}
