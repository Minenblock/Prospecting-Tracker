// api-server/server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3001; 

// Middleware, um Cross-Origin-Anfragen zu erlauben
app.use(cors()); 

app.get('/api/search/:itemName', async (req, res) => {
    let itemName = req.params.itemName;
    // Ersetze Leerzeichen durch Unterstriche für die Wiki-URL
    const wikiTitle = itemName.replace(/\s/g, '_'); 
    const wikiUrl = `https://prospecting.miraheze.org/wiki/${wikiTitle}`;

    console.log(`[PROXY] Suche nach: ${itemName} unter ${wikiUrl}`);

    try {
        // 1. Wiki-Seite abrufen
        const { data } = await axios.get(wikiUrl);
        const $ = cheerio.load(data);
        const results = [];
        let rarityValue = ''; // NEU: Variable zur Speicherung der Rarity

        // 2. Extraktion der Rarity aus der Infobox (basierend auf dem bereitgestellten HTML)
        // Wir suchen den th-Tag mit "Rarity:" und nehmen den Text aus dem nächsten td-Tag.
        const rarityTd = $('.infobox th:contains("Rarity:")').next('td');
        if (rarityTd.length) {
            // .text() entfernt alle inneren HTML-Tags (<span style="..."><i>...</i></span>)
            rarityValue = rarityTd.text().trim(); 
        }
        // Überprüfe, ob die Rarity gefunden wurde (z.B. "Mythic")
        console.log(`[PROXY] Gefundene Rarity: ${rarityValue || 'Nicht gefunden'}`);


        // 3. Bestehende Logik zur Extraktion der Locations & Chances
        const header = $('h2:contains("Locations & Chances")').first();
        let targetList;

        if (header.length > 0) {
            // Navigiere von <h2> zu <ul>
            targetList = header.parent().next('ul'); 
        }
        
        if (targetList.length === 0 || targetList.find('li').length === 0) {
            console.log(`[PROXY] Liste 'Locations & Chances' nicht gefunden für: ${itemName}`);
            // Rückgabe der Rarity, auch wenn Locations fehlen
            return res.status(200).json({ 
                error: `Liste "Locations & Chances" auf der Seite "${itemName}" nicht gefunden. (Strukturproblem oder falscher Titel.)`,
                rarity: rarityValue
            });
        }

        targetList.find('li').each((i, li) => {
            const fullText = $(li).text().trim();
            const parts = fullText.split(' - ');
            
            if (parts.length >= 2) {
                // Extrahiere das gesamte HTML der Location (inkl. Formatierung)
                const locationHtml = $(li).find('b').first().html();
                const chance = parts.slice(1).join(' - ').trim();
                
                results.push({
                    location_html: locationHtml,
                    chance: chance
                });
            } else {
                 console.log(`[PROXY] Listen-Eintrag konnte nicht geparst werden: ${fullText}`);
            }
        });

        if (results.length === 0) {
             console.log(`[PROXY] Liste gefunden, aber keine Zeilen extrahiert für: ${itemName}`);
             return res.status(200).json({ 
                error: 'Liste gefunden, aber keine Daten extrahiert.',
                rarity: rarityValue
            });
        }

        // 4. Finale JSON-Antwort senden (enthält jetzt "rarity")
        console.log(`[PROXY] Erfolgreich Daten für ${itemName} extrahiert.`);
        res.json({ 
            name: itemName, 
            data: results, 
            rarity: rarityValue // NEU: Rarity hier übergeben
        });

    } catch (error) {
        console.error(`[PROXY] Fehler beim Abruf von ${wikiUrl}: ${error.message}`);
        res.status(500).json({ 
            error: `Interner Serverfehler beim Abruf der Wiki-Daten: ${error.message}`,
            rarity: ''
        });
    }
});

app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`[PROXY-START] Proxy-Server läuft auf http://localhost:${PORT}`);
    console.log(`===================================================`);
});