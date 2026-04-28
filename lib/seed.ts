import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  const experiencesRef = collection(db, 'experiences');
  const snapshot = await getDocs(experiencesRef);
  
  // Always ensure the Test Game is added
  const testGame = {
    id: "test-vipps-game",
    name: "VIPPS Test Game",
    shortDescription: "A special test game to test the Vipps Checkout flow. Costs 10 NOK.",
    picture: "https://picsum.photos/seed/test/800/600",
    type: "Adventure",
    age: "18+",
    difficulty: "Easy",
    maxPlayers: 2,
    subtitles: ["English"],
    pricing: {
      "2": 10 // 10 NOK for 2 people
    },
    isActive: true
  };
  await setDoc(doc(db, 'experiences', testGame.id), testGame);

  if (!snapshot.empty) {
    return; // Already seeded other games
  }

  const experiences = [
    {
      id: "parvous-box",
      name: "Parvous Box",
      shortDescription: "A thrilling escape room experience where you must solve puzzles to break out of the mysterious Parvous Box.",
      picture: "https://picsum.photos/seed/parvous/800/600",
      type: "Escape Room",
      age: "12+",
      difficulty: "Medium",
      maxPlayers: 6,
      subtitles: ["English", "Norwegian"],
      pricing: {
        "2": 800,
        "3": 1100,
        "4": 1400,
        "5": 1700,
        "6": 2000,
        "7": 2300,
        "8": 2600
      },
      isActive: true
    },
    {
      id: "prison-break",
      name: "Prison Break",
      shortDescription: "Work together with your team to escape a high-security prison before the guards catch you.",
      picture: "https://picsum.photos/seed/prison/800/600",
      type: "Escape Room",
      age: "16+",
      difficulty: "Hard",
      maxPlayers: 8,
      subtitles: ["English"],
      pricing: {
        "2": 900,
        "3": 1200,
        "4": 1500,
        "5": 1800,
        "6": 2100,
        "7": 2400,
        "8": 2700
      },
      isActive: true
    },
    {
      id: "alice-in-wonderland",
      name: "Alice In Wonderland",
      shortDescription: "Step into a magical world and help Alice save Wonderland from the Queen of Hearts.",
      picture: "https://picsum.photos/seed/alice/800/600",
      type: "Adventure",
      age: "8+",
      difficulty: "Easy",
      maxPlayers: 4,
      subtitles: ["English", "Norwegian", "Swedish"],
      pricing: {
        "2": 700,
        "3": 1000,
        "4": 1300,
        "5": 1600,
        "6": 1900,
        "7": 2200,
        "8": 2500
      },
      isActive: true
    }
  ];

  for (const exp of experiences) {
    await setDoc(doc(db, 'experiences', exp.id), exp);
  }

  // Seed settings
  await setDoc(doc(db, 'settings', 'general'), {
    openingHours: {
      "5": ["18:00", "19:30"], // Friday
      "6": ["14:00", "15:30", "17:00"] // Saturday
    },
    reservationFee: 500
  });
}
