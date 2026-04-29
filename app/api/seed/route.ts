import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import fs from 'fs';

export async function GET() {
  try {
    const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
    const app = initializeApp(config);
    const db = getFirestore(app);

    const snapshot = await getDocs(collection(db, 'experiences'));
    let parvous: any = null;
    let foundArizona = false;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.name === 'Arizona Sunrise') {
        foundArizona = true;
      }
      if (data.name.toLowerCase().includes('parvus') || data.name.toLowerCase().includes('parvous')) {
        parvous = data;
      }
    });

    if (foundArizona) {
      return NextResponse.json({ message: 'Arizona Sunrise already exists.' });
    }

    const defaultPricing = { "2": 800, "3": 1100, "4": 1400, "5": 1700, "6": 2000, "7": 2300, "8": 2600 };
    
    await addDoc(collection(db, 'experiences'), {
      name: "Arizona Sunrise",
      shortDescription: "Arizona Sunrise er en intens og skremmende zombie shooter. Overlev bølger av zombier i en post-apokalyptisk verden. Krever raske reflekser og godt samarbeid.",
      type: "Jump Scare",
      age: "18+",
      difficulty: "Hard",
      maxPlayers: parvous ? parvous.maxPlayers : 8,
      pricing: parvous ? parvous.pricing : defaultPricing,
      isActive: true,
      picture: ""
    });

    return NextResponse.json({ message: 'Added Arizona Sunrise successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
