import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function main() {
  const snapshot = await getDocs(collection(db, "experiences"));
  let parvous = null;
  snapshot.forEach(doc => {
    console.log(doc.data().name);
    if (doc.data().name.toLowerCase().includes("parvus") || doc.data().name.toLowerCase().includes("parvous")) {
      parvous = doc.data();
    }
  });
  
  if (parvous) {
    console.log("Found:", parvous.name);
    console.log("Pricing:", parvous.pricing);
    
    await addDoc(collection(db, "experiences"), {
      name: "Arizona Sunrise",
      shortDescription: "Arizona Sunrise er en intens og skremmende zombie shooter. Overlev bølger av zombier i en post-apokalyptisk verden. Krever raske reflekser og godt samarbeid.",
      type: "Jump Scare",
      age: "18+",
      difficulty: "Hard",
      maxPlayers: parvous.maxPlayers || 8,
      pricing: parvous.pricing,
      isActive: true,
      picture: ""
    });
    console.log("Added Arizona Sunrise");
  } else {
    console.log("Could not find Parvous/Parvus Box. Adding anyway with default pricing.");
    await addDoc(collection(db, "experiences"), {
      name: "Arizona Sunrise",
      shortDescription: "Arizona Sunrise er en intens og skremmende zombie shooter. Overlev bølger av zombier i en post-apokalyptisk verden. Krever raske reflekser og godt samarbeid.",
      type: "Jump Scare",
      age: "18+",
      difficulty: "Hard",
      maxPlayers: 8,
      pricing: { "2": 800, "3": 1100, "4": 1400, "5": 1700, "6": 2000, "7": 2300, "8": 2600 },
      isActive: true,
      picture: ""
    });
  }
  process.exit(0);
}

main().catch(console.error);
