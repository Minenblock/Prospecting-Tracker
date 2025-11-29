import React, { useState, useEffect } from 'react';

// --- LOKALISIERUNGS-KONSTANTEN (DE/EN) ---
const TRANSLATIONS = {
    de: {
        title: "Prospecting Tracker",
        item_name_placeholder: "Item Name (z.B. Flarebloom)",
        amount_placeholder: "Anzahl",
        weight_placeholder: "Gewicht (kg, optional)",
        weight_operator_title: "Gewichtsoperator",
        add_button: "Hinzufügen",
        loading_button: "Lädt...",
        update_button: "Fehlende Item-Daten (Rarity/Locations) aktualisieren",
        update_loading: "Alle Daten werden aktualisiert...",
        update_info: "Bitte warten, dies kann je nach Anzahl der Items einen Moment dauern.",
        no_items: "Keine Items hinzugefügt. Starten Sie Ihren Grind!",
        no_location: "Keine Location gefunden",
        no_location_group: "❌ Keine Location",
        location_prefix: "🎯 ",
        locations_chances: "Locations & Chances:",
        hide_locations: "Alle Orte verbergen [-]",
        show_locations: (count) => `+ ${count} weitere Orte anzeigen`,
        no_details: "Keine Detail-Informationen verfügbar.",
        weight_label: "Gewicht:",
        weight_na: "N/A",
        status_completed: "✅ Ziel erreicht!",
        status_open: "Ziel offen",
        found_label: "Gefunden:",
        target_label: "Ziel:",
        delete_button: "Item löschen",
        current_decrement_title: "Menge reduzieren",
        current_increment_title: "Menge erhöhen",
        target_decrement_title: "Zielmenge reduzieren",
        target_increment_title: "Zielmenge erhöhen",
        dark_mode_title: "Dark Mode umschalten",
        language_title: "Sprache umschalten (DE/EN)"
    },
    en: {
        title: "Prospecting Tracker",
        item_name_placeholder: "Item Name (e.g., Flarebloom)",
        amount_placeholder: "Amount",
        weight_placeholder: "Weight (kg, optional)",
        weight_operator_title: "Weight operator",
        add_button: "Add Item",
        loading_button: "Loading...",
        update_button: "Update missing Item Data (Rarity/Locations)",
        update_loading: "Updating all data...",
        update_info: "Please wait, this might take a moment depending on the number of items.",
        no_items: "No items added. Start your grind!",
        no_location: "No location found",
        no_location_group: "❌ No Location",
        location_prefix: "🎯 ",
        locations_chances: "Locations & Chances:",
        hide_locations: "Hide all locations [-]",
        show_locations: (count) => `+ ${count} more locations`,
        no_details: "No detailed information available.",
        weight_label: "Weight:",
        weight_na: "N/A",
        status_completed: "✅ Target reached!",
        status_open: "Target open",
        found_label: "Found:",
        target_label: "Target:",
        delete_button: "Delete Item",
        current_decrement_title: "Reduce amount",
        current_increment_title: "Increase amount",
        target_decrement_title: "Reduce target amount",
        target_increment_title: "Increase target amount",
        dark_mode_title: "Toggle dark mode",
        language_title: "Toggle language (DE/EN)"
    }
};

// --- RESTLICHE KONSTANTEN ---
const RARITY_GRADIENTS = {
    'Mythic': 'from-fuchsia-400 to-pink-500', 
    'Legendary': 'from-yellow-300 to-yellow-500', 
    'Epic': 'from-indigo-400 to-purple-500',
    'Rare': 'from-blue-400 to-cyan-500',
    'Uncommon': 'from-green-400 to-teal-500',
    'Common': 'from-gray-400 to-gray-500',
    'Basic': 'from-gray-400 to-gray-500',
    '': 'from-gray-400 to-gray-500'
};

const RARITY_RANKS = {
    'Mythic': 6,
    'Legendary': 5,
    'Epic': 4,
    'Rare': 3,
    'Uncommon': 2,
    'Common': 1,
    'Basic': 1,
    '': 0
};

const LOCATION_GRADIENTS = {
    'Mythic': 'from-fuchsia-700 to-pink-800', 
    'Legendary': 'from-yellow-700 to-orange-800', 
    'Epic': 'from-indigo-700 to-purple-800',
    'Rare': 'from-blue-700 to-cyan-800',
    'Uncommon': 'from-lime-700 to-green-800', 
    'Common': 'from-gray-700 to-gray-800',
    'Basic': 'from-gray-700 to-gray-800',
    '': 'from-gray-700 to-gray-800'
};

const extractTextFromHtml = (html) => {
    if (typeof document === 'undefined') {
        return html;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || html;
};

const loadInitialItems = () => {
    const savedItems = localStorage.getItem('prospecting-items');
    if (savedItems) {
        try {
            const parsedItems = JSON.parse(savedItems);
            return parsedItems.map(item => ({
                ...item,
                info: typeof item.info === 'string' ? item.info : (item.info || []),
                weightKg: item.weightKg || null, 
                weightOperator: item.weightOperator || '=',
                rarity: item.rarity || '', 
                completed: item.current >= item.target 
            }));
        } catch (e) {
            console.error("Fehler beim Laden der Daten aus Local Storage, starte mit leerem Array.", e);
        }
    }
    return [];
};

const App = () => {
    // --- LOKALISIERUNGS-STATE ---
    const [language, setLanguage] = useState(() => {
        const savedLang = localStorage.getItem('language');
        return ['de', 'en'].includes(savedLang) ? savedLang : 'de'; // Standard: Deutsch
    });
    
    // Aktuelle Übersetzungen
    const t = TRANSLATIONS[language]; 

    const [items, setItems] = useState(loadInitialItems);
    const [newItemName, setNewItemName] = useState('');
    const [newItemAmount, setNewItemAmount] = useState(1);
    const [newItemWeight, setNewItemWeight] = useState(''); 
    const [newItemWeightOperator, setNewItemWeightOperator] = useState('=');
    
    const [collapsedGroups, setCollapsedGroups] = useState(new Set()); 
    const [expandedLocations, setExpandedLocations] = useState(new Set()); 
    const [isUpdating, setIsUpdating] = useState(false); 

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);
    
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);


    useEffect(() => {
        // Speichern Sie die aktualisierten Items im Local Storage
        localStorage.setItem('prospecting-items', JSON.stringify(items));
    }, [items]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };
    
    const toggleLanguage = () => {
        setLanguage(prevLang => prevLang === 'de' ? 'en' : 'de');
    };

    const toggleGroup = (locationKey) => {
        setCollapsedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(locationKey)) {
                newSet.delete(locationKey);
            } else {
                newSet.add(locationKey);
            }
            return newSet;
        });
    };
    
    const toggleExtraLocations = (itemId) => {
        setExpandedLocations(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    /**
     * Ruft die Rarity und ggf. Locations für ein einzelnes Item vom Proxy ab.
     */
    const fetchItemDetails = async (itemName) => {
        try {
            const encodedItemName = encodeURIComponent(itemName.trim());
            // Proxy läuft auf localhost:3001
            const response = await fetch(`http://localhost:3001/api/search/${encodedItemName}`); 
            
            if (!response.ok) {
                return { rarity: '', data: [], error: `HTTP Error: ${response.status}` };
            }
            
            const json = await response.json();
            
            return {
                rarity: json.rarity || '',
                data: Array.isArray(json.data) ? json.data : [],
                error: json.error || ''
            };

        } catch (error) {
            console.error("Fehler beim Abruf vom lokalen Proxy:", error);
            return { rarity: '', data: [], error: `Fehler: Proxy (3001) nicht erreichbar.` };
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim() || parseInt(newItemAmount) < 1) return;

        let weightValue = null;
        if (newItemWeight.trim() !== '') {
            const sanitizedWeight = newItemWeight.replace(',', '.');
            weightValue = parseFloat(sanitizedWeight);
            if (isNaN(weightValue) || weightValue <= 0) {
                console.error('Ungültiges Gewichtsformat.');
                return; 
            }
        }

        const itemName = newItemName.trim();
        const targetAmount = parseInt(newItemAmount) || 1;
        const details = await fetchItemDetails(itemName);

        let extraInfo = details.data.length > 0 ? details.data : details.error || t.no_details;
        
        const newItem = {
            id: Date.now(),
            name: itemName,
            target: targetAmount,
            current: 0,
            completed: 0 >= targetAmount, 
            info: extraInfo,
            weightKg: weightValue,
            weightOperator: weightValue !== null ? newItemWeightOperator : null,
            rarity: details.rarity
        };

        setItems([newItem, ...items]);
        setNewItemName('');
        setNewItemAmount(1);
        setNewItemWeight(''); 
        setNewItemWeightOperator('='); 
    };

    const handleUpdateAllRarities = async () => {
        if (isUpdating) return;
        setIsUpdating(true);

        const updatedItems = await Promise.all(items.map(async (item) => {
            const needsUpdate = !item.rarity || typeof item.info === 'string';

            if (needsUpdate) {
                const details = await fetchItemDetails(item.name);
                
                let newInfo = item.info;
                if (details.data.length > 0) {
                    newInfo = details.data;
                } else if (details.error) {
                    newInfo = details.error;
                }
                
                return {
                    ...item,
                    rarity: details.rarity || item.rarity,
                    info: newInfo
                };
            }
            return item;
        }));

        setItems(updatedItems);
        setIsUpdating(false);
    };

    // Zähler für gefundene Menge (CURRENT)
    const handleUpdateCurrent = (id, delta) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newCurrent = Math.max(0, item.current + delta);
                return { 
                    ...item, 
                    current: newCurrent, 
                    completed: newCurrent >= item.target 
                };
            }
            return item;
        }));
    };
    
    // Zähler für Zielmenge (TARGET)
    const handleUpdateTarget = (id, delta) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newTarget = Math.max(1, item.target + delta);
                return { 
                    ...item, 
                    target: newTarget,
                    completed: item.current >= newTarget 
                };
            }
            return item;
        }));
    };

    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const formatWeight = (weightKg, operator) => {
        if (weightKg === null || weightKg === undefined || weightKg <= 0) return null;
        
        // Anpassung der Formatierung basierend auf der Sprache (Komma vs. Punkt)
        const locale = language === 'de' ? 'de-DE' : 'en-US';
        const formattedKg = weightKg.toLocaleString(locale, { maximumFractionDigits: 2 });
        
        const finalOperator = operator || '='; 
        const prefix = finalOperator === '=' ? '' : finalOperator;

        return `(${prefix}${formattedKg} kg)`;
    };
    
    const groupedItems = items.reduce((groups, item) => {
        let locationKey;
        
        if (Array.isArray(item.info) && item.info.length > 0) {
            const locationHtml = item.info[0].location_html;
            locationKey = extractTextFromHtml(locationHtml) || t.no_location;
        } else {
            locationKey = t.no_location;
        }

        if (!groups[locationKey]) {
            groups[locationKey] = [];
        }

        groups[locationKey].push(item);

        return groups;
    }, {});

    const locationGroups = Object.keys(groupedItems);

    /**
     * Normalisiert und gibt die Tailwind-Klasse für den Item-Namen-Gradienten zurück.
     */
    const getRarityClass = (rarityString) => {
        if (!rarityString) return RARITY_GRADIENTS[''];
        
        const normalizedRarity = rarityString.charAt(0).toUpperCase() + rarityString.slice(1).toLowerCase();
        
        const gradientClasses = RARITY_GRADIENTS[normalizedRarity] || RARITY_GRADIENTS[''];
        
        return `bg-gradient-to-r ${gradientClasses} bg-clip-text text-transparent`;
    };

    /**
     * Ermittelt die dunkelste Gradient-Klasse für den Gruppen-Header-Hintergrund, basierend auf dem seltensten Item in der Gruppe.
     */
    const getGroupHeaderClasses = (itemsInGroup) => {
        let maxRank = 0;
        let finalRarityKey = ''; 
        
        itemsInGroup.forEach(item => {
            const rarity = item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1).toLowerCase() : '';
            const rank = RARITY_RANKS[rarity] || 0;

            if (rank > maxRank) {
                maxRank = rank;
                finalRarityKey = rarity;
            }
        });
        
        const gradientClasses = LOCATION_GRADIENTS[finalRarityKey] || LOCATION_GRADIENTS[''];
        
        return `bg-gradient-to-r ${gradientClasses} text-white shadow-xl hover:shadow-2xl hover:bg-opacity-90 transition`;
    };


    return (
        <div className="container mx-auto p-4 max-w-3xl min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 relative">
            
            {/* Dark Mode und Language Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
                
                {/* Language Button */}
                <button
                    type="button" 
                    onClick={toggleLanguage}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-lg"
                    title={t.language_title}
                >
                    {language === 'de' ? '🇩🇪' : '🇬🇧'}
                </button>
                
                {/* Dark Mode Button */}
                <button
                    type="button" 
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title={t.dark_mode_title}
                >
                    {isDarkMode ? '🌞' : '🌙'}
                </button>
            </div>

            <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400 pt-10">{t.title}</h1>

            <form onSubmit={handleAddItem} className="mb-4 flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                    <input
                        type="text"
                        placeholder={t.item_name_placeholder}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg flex-grow bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-300"
                        required
                    />
                    <input
                        type="number"
                        placeholder={t.amount_placeholder}
                        value={newItemAmount}
                        onChange={(e) => setNewItemAmount(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg w-full sm:w-20 text-center bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50"
                        min="1"
                        required
                    />
                </div>

                <div className="flex flex-row gap-2 items-stretch">
                    
                    <select
                        value={newItemWeightOperator}
                        onChange={(e) => setNewItemWeightOperator(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 w-16"
                        title={t.weight_operator_title}
                    >
                        <option value="=">=</option>
                        <option value="<">&lt;</option>
                        <option value=">">&gt;</option>
                    </select>
                    
                    <input
                        type="text" 
                        placeholder={t.weight_placeholder}
                        value={newItemWeight}
                        onChange={(e) => setNewItemWeight(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg flex-grow bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-300"
                    />

                    <button
                        type="submit"
                        className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 w-full sm:w-auto min-w-[100px]"
                        disabled={isUpdating}
                    >
                        {isUpdating ? t.loading_button : t.add_button}
                    </button>
                </div>
            </form>
            
            {/* UPDATE-SCHALTFLÄCHE */}
            {items.length > 0 && (
                <div className="mb-8 text-center">
                    <button
                        type="button" 
                        onClick={handleUpdateAllRarities}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition duration-150 text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? t.update_loading : t.update_button}
                    </button>
                    {isUpdating && <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{t.update_info}</p>}
                </div>
            )}
            {/* ENDE UPDATE-SCHALTFLÄCHE */}

            <div className="flex flex-wrap gap-4 justify-start"> 
                {items.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 italic w-full">{t.no_items}</p>
                )}
                
                {locationGroups.map(locationKey => (
                    <div 
                        key={locationKey} 
                        className="w-full sm:w-[calc(50%-0.5rem)] border-t-4 border-indigo-500 dark:border-indigo-600 pt-4 pb-4"
                    >
                        
                        <button
                            type="button" 
                            onClick={() => toggleGroup(locationKey)}
                            className={`w-full text-left flex items-center justify-between text-xl font-semibold mb-4 p-4 rounded-xl ${getGroupHeaderClasses(groupedItems[locationKey])}`}
                        >
                            <span>{locationKey === t.no_location ? t.no_location_group : `${t.location_prefix}${locationKey}`}</span>
                            <span>{collapsedGroups.has(locationKey) ? '[+]' : '[-]'}</span>
                        </button>
                        
                        {!collapsedGroups.has(locationKey) && (
                            <div className="space-y-4">
                                {groupedItems[locationKey].map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`p-4 rounded-xl shadow-lg flex flex-col justify-between items-start transition-all duration-300 
                                                    ${item.completed ? 'bg-green-100 dark:bg-green-800 border-l-4 border-green-500 dark:border-green-600' : 'bg-white dark:bg-gray-800'}`}
                                    >
                                        
                                        <div className="flex-grow w-full">
                                            {/* Item-Name und Rarity */}
                                            <p className={`font-bold text-lg ${item.completed ? 'line-through text-green-700 dark:text-green-300' : getRarityClass(item.rarity)}`}>
                                                {item.name}
                                            </p>
                                            
                                            {/* Locations & Chances */}
                                            {Array.isArray(item.info) && item.info.length > 0 ? (
                                                <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{t.locations_chances}</p>
                                                    
                                                    {(() => {
                                                        const sortedInfo = [...item.info].sort((a, b) => {
                                                            const chanceA = parseFloat(a.chance.replace('%', ''));
                                                            const chanceB = parseFloat(b.chance.replace('%', ''));
                                                            return chanceB - chanceA; 
                                                        });

                                                        const topTwo = sortedInfo.slice(0, 2);
                                                        const rest = sortedInfo.slice(2);
                                                        const isExpanded = expandedLocations.has(item.id);

                                                        const renderLocationList = (list) => (
                                                            <ul className="list-disc list-inside space-y-1 ml-4">
                                                                {list.map((infoItem, idx) => (
                                                                    <li key={idx} className="break-words">
                                                                        <span 
                                                                            className="font-bold inline" 
                                                                            dangerouslySetInnerHTML={{ __html: infoItem.location_html }}
                                                                        ></span>
                                                                        <span className="text-gray-600 dark:text-gray-400"> - {infoItem.chance}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        );

                                                        return (
                                                            <>
                                                                {renderLocationList(topTwo)}
                                                                
                                                                {rest.length > 0 && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleExtraLocations(item.id)}
                                                                            className="mt-2 text-indigo-500 hover:text-indigo-400 text-xs font-semibold"
                                                                        >
                                                                            {isExpanded ? t.hide_locations : t.show_locations(rest.length)}
                                                                        </button>
                                                                        {isExpanded && (
                                                                            <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                                                                                {renderLocationList(rest)}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                    
                                                </div>
                                            ) : (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1 italic whitespace-pre-wrap">
                                                    {typeof item.info === 'string' ? item.info : t.no_details}
                                                </p>
                                            )}
                                            
                                            {/* Progress und Gewicht */}
                                            <div className="flex flex-col sm:flex-row sm:justify-between mt-3 mb-3">
                                                <p className="text-md sm:w-1/2">
                                                    {t.weight_label}
                                                    {item.weightKg !== null && item.weightKg > 0 ? (
                                                        <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm ml-1">
                                                            {formatWeight(item.weightKg, item.weightOperator)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400 italic ml-1 text-sm">{t.weight_na}</span>
                                                    )}
                                                </p>
                                                
                                                <p className="text-md sm:w-1/2 text-left sm:text-right font-semibold">
                                                    {item.completed ? (
                                                        <span className="text-green-600 dark:text-green-400">{t.status_completed}</span>
                                                    ) : (
                                                        <span className="text-indigo-600 dark:text-indigo-400">{t.status_open}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Steuerelemente (Current, Target, Delete) */}
                                        <div className="w-full flex flex-col space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            
                                            {/* Zähler für gefundene Menge (CURRENT) */}
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                                                <span className="font-medium text-sm">{t.found_label}</span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button" 
                                                        onClick={() => handleUpdateCurrent(item.id, -1)}
                                                        className="bg-red-500 text-white p-2 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-sm font-bold"
                                                        title={t.current_decrement_title}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-lg w-10 text-center">{item.current}</span>
                                                    <button
                                                        type="button" 
                                                        onClick={() => handleUpdateCurrent(item.id, 1)}
                                                        className="bg-green-500 text-white p-2 rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-600 transition text-sm font-bold"
                                                        title={t.current_increment_title}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Zähler für Zielmenge (TARGET) */}
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                                                <span className="font-medium text-sm">{t.target_label}</span>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button" 
                                                        onClick={() => handleUpdateTarget(item.id, -1)}
                                                        className="bg-indigo-400 text-white p-2 rounded-full w-6 h-6 flex items-center justify-center hover:bg-indigo-500 transition text-sm font-bold"
                                                        title={t.target_decrement_title}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold text-lg w-10 text-center">{item.target}</span>
                                                    <button
                                                        type="button" 
                                                        onClick={() => handleUpdateTarget(item.id, 1)}
                                                        className="bg-indigo-600 text-white p-2 rounded-full w-6 h-6 flex items-center justify-center hover:bg-indigo-700 transition text-sm font-bold"
                                                        title={t.target_increment_title}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Löschen */}
                                            <button
                                                type="button" 
                                                onClick={() => handleDelete(item.id)}
                                                className="w-full bg-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-300 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-sm font-semibold mt-3"
                                                title={t.delete_button}
                                            >
                                                {t.delete_button}
                                            </button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;