export interface CulturalNote {
  id: string
  title: string
  type: string
  content: string
  image?: string
  relatedNotes: string[]
}

export const culturalNotes: CulturalNote[] = [
  {
    id: "rendang",
    title: "Rendang",
    type: "Cuisine",
    content:
      "A spicy meat dish, originating from the [[Minangkabau Culture]] of Indonesia. Often served during special occasions like [[Idul Fitri]] and weddings. It's known for its rich flavor and long cooking process. The dish is slow-cooked in coconut milk and spices until the liquid evaporates, creating a tender, flavorful meat that can be preserved for weeks.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["minangkabau-culture", "idul-fitri", "indonesian-food"],
  },
  {
    id: "minangkabau-culture",
    title: "Minangkabau Culture",
    type: "Ethnicity",
    content:
      "The Minangkabau are an ethnic group indigenous to the highlands of West Sumatra, Indonesia. They are known for their matrilineal society and distinctive traditional houses with curved roofs resembling buffalo horns. Famous for their cuisine, including [[Rendang]], and their strong tradition of migration called 'merantau'. The [[Minangkabau Culture]] emphasizes education and entrepreneurship.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["rendang", "west-sumatra", "indonesian-food"],
  },
  {
    id: "batik",
    title: "Batik",
    type: "Art Form",
    content:
      "A traditional Indonesian art form of dyeing textiles using wax-resist techniques. Often associated with [[Javanese Culture]], batik involves applying wax to fabric before dyeing to create intricate patterns. Recognized by UNESCO as a Masterpiece of Oral and Intangible Heritage of Humanity. Different regions have distinct batik styles, with [[Java]] being the most renowned center.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["javanese-culture", "traditional-clothing", "java"],
  },
  {
    id: "idul-fitri",
    title: "Idul Fitri",
    type: "Festival",
    content:
      "The celebration marking the end of Ramadan, the Islamic holy month of fasting. It's a time for family gatherings, feasting, and forgiveness. Traditional dishes like [[Rendang]] are often prepared for this joyous occasion. In Indonesia, this festival is also known as 'Lebaran' and involves the tradition of 'mudik' - returning to one's hometown to celebrate with family.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["rendang", "islamic-traditions", "indonesian-food"],
  },
  {
    id: "javanese-culture",
    title: "Javanese Culture",
    type: "Ethnicity",
    content:
      "The culture of the Javanese people, indigenous to the island of Java, Indonesia. Known for its rich traditions in performing arts like [[Wayang Kulit]] (shadow puppetry) and intricate [[Batik]] designs. Javanese culture emphasizes harmony, respect for elders, and refined artistic expression. The philosophy of 'gotong royong' (mutual assistance) is central to Javanese social life.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["batik", "wayang-kulit", "java"],
  },
  {
    id: "wayang-kulit",
    title: "Wayang Kulit",
    type: "Performing Art",
    content:
      "Traditional Indonesian shadow puppet theater, particularly associated with [[Javanese Culture]]. The puppeteer, called a 'dalang', manipulates intricately carved leather puppets behind a screen while narrating epic stories from Hindu epics like the Ramayana and Mahabharata. This art form combines storytelling, music, and visual art, often performed during important ceremonies and festivals.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["javanese-culture", "traditional-performing-arts", "java"],
  },
  {
    id: "java",
    title: "Java",
    type: "Geography",
    content:
      "The most populous island of Indonesia and home to the [[Javanese Culture]]. Java is the political, economic, and cultural center of Indonesia, housing the capital city Jakarta. The island is known for its rich cultural heritage, including [[Batik]] art and [[Wayang Kulit]] performances. Java's fertile volcanic soil has supported dense populations and sophisticated civilizations for centuries.",
    image: "/placeholder.svg?height=400&width=600",
    relatedNotes: ["javanese-culture", "batik", "wayang-kulit"],
  },
]

export function getNoteById(id: string): CulturalNote | undefined {
  return culturalNotes.find((note) => note.id === id)
}

export function getNoteByTitle(title: string): CulturalNote | undefined {
  return culturalNotes.find((note) => note.title.toLowerCase() === title.toLowerCase())
}

export function getAllNotes(): CulturalNote[] {
  return culturalNotes
}
