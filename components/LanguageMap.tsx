
import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { Info, MapPin, Globe, Sparkles, Anchor, Shield, ArrowRight, Zap, BookOpen, Mountain, CheckCircle, Castle, X, Landmark, Map as MapIcon, Filter, Eye, EyeOff, Users, Target, Waves } from './Icons';
import L from 'leaflet';

interface City {
  name: string;
  coords: [number, number];
  hasCastle: boolean;
  isCoastal?: boolean;
  isMountainous?: boolean;
  isCapital?: boolean; 
  varietyDetail: string;
  varietyDetailGeg: string;
  isGeg: boolean;
  population?: string;
}

interface RegionData {
  id: string;
  name: string;
  nameGeg: string;
  variety: 'geg' | 'tosk';
  description: string;
  descriptionGeg: string;
  subVarieties: string[];
  features: string[];
  areaEstimate: string; 
  speakerEstimate: string; 
  centerCoords: [number, number]; 
}

const CITIES: City[] = [
  { name: 'Shkodër', coords: [42.0693, 19.5033], hasCastle: true, isCoastal: false, isCapital: true, isGeg: true, varietyDetail: "Northwestern Geg Variety (Malësia)", varietyDetailGeg: "Gegnishtja Veriperndimore (Malësía)" },
  { name: 'Prishtinë', coords: [42.6629, 21.1655], hasCastle: false, isMountainous: true, isCapital: true, isGeg: true, varietyDetail: "Northeastern Geg Variety (Kosovo)", varietyDetailGeg: "Gegnishtja Verilindore (Kosovë)" },
  { name: 'Prizren', coords: [42.2139, 20.7447], hasCastle: true, isMountainous: true, isCapital: true, isGeg: true, varietyDetail: "Northeastern Geg Variety (Dukagjin)", varietyDetailGeg: "Gegnishtja Verilindore (Dukagjin)" },
  { name: 'Ulqin', coords: [41.9311, 19.2144], hasCastle: true, isCoastal: true, isGeg: true, varietyDetail: "Northwestern Geg Variety (Coastal)", varietyDetailGeg: "Gegnishtja Veriperndimore (Bregdet)" },
  { name: 'Tetovë', coords: [42.0097, 20.9715], hasCastle: true, isMountainous: true, isGeg: true, varietyDetail: "Northeastern Geg (Ilirida)", varietyDetailGeg: "Gegnishtja Verilindore (Iliridë)" },
  { name: 'Gjakovë', coords: [42.3803, 20.4300], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Dukagjin Geg", varietyDetailGeg: "Gegnishtja e Dukagjinit" },
  { name: 'Pejë', coords: [42.6591, 20.2883], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Rugova Variety", varietyDetailGeg: "Gegnishtja e Rugovës" },
  { name: 'Mitrovicë', coords: [42.8914, 20.8660], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Northeastern Geg", varietyDetailGeg: "Gegnishtja Verilindore" },
  { name: 'Gjilan', coords: [42.4635, 21.4694], hasCastle: false, isGeg: true, varietyDetail: "Gollak Variety", varietyDetailGeg: "Gegnishtja e Gollakut" },
  { name: 'Ferizaj', coords: [42.3705, 21.1555], hasCastle: false, isGeg: true, varietyDetail: "Northeastern Geg", varietyDetailGeg: "Gegnishtja Verilindore" },
  { name: 'Peshkopi', coords: [41.6850, 20.4289], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Dibra Geg", varietyDetailGeg: "Gegnishtja e Dibrës" },
  { name: 'Kukës', coords: [42.0767, 20.4133], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Lumë Variety", varietyDetailGeg: "Gegnishtja e Lumës" },
  { name: 'Lezhë', coords: [41.7825, 19.6439], hasCastle: true, isCoastal: true, isGeg: true, varietyDetail: "Northwestern Geg", varietyDetailGeg: "Gegnishtja Veriperndimore" },
  { name: 'Krujë', coords: [41.5103, 19.7917], hasCastle: true, isMountainous: true, isGeg: true, varietyDetail: "Central Geg", varietyDetailGeg: "Gegnishtja e Mesme" },
  { name: 'Durrës', coords: [41.3246, 19.4560], hasCastle: true, isCoastal: true, isGeg: true, varietyDetail: "Central Geg (Coastal)", varietyDetailGeg: "Gegnishtja e Mesme" },
  { name: 'Tiranë', coords: [41.3275, 19.8187], hasCastle: true, isGeg: true, varietyDetail: "Central Geg (Southern Edge)", varietyDetailGeg: "Gegnishtja e Mesme" },
  { name: 'Kavajë', coords: [41.1856, 19.5569], hasCastle: false, isCoastal: true, isGeg: true, varietyDetail: "Central Geg", varietyDetailGeg: "Gegnishtja e Mesme" },
  { name: 'Burrel', coords: [41.6103, 20.0094], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Mat Geg", varietyDetailGeg: "Gegnishtja e Matit" },
  { name: 'Strugë', coords: [41.1778, 20.6783], hasCastle: false, isCoastal: true, isGeg: true, varietyDetail: "Ohrid-Prespa Geg", varietyDetailGeg: "Gegnishtja e Liqenit" },
  { name: 'Gostivar', coords: [41.7964, 20.9083], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Upper Vardar Geg", varietyDetailGeg: "Gegnishtja e Pollogut" },
  { name: 'Shkup', coords: [41.9965, 21.4314], hasCastle: true, isMountainous: false, isCapital: true, isGeg: true, varietyDetail: "Skopje Geg", varietyDetailGeg: "Gegnishtja e Shkupit" },
  { name: 'Dibër', coords: [41.5233, 20.5256], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Upper Dibra Geg", varietyDetailGeg: "Gegnishtja e Epërme e Dibrës" },
  { name: 'Plavë', coords: [42.5975, 19.9458], hasCastle: false, isMountainous: true, isGeg: true, varietyDetail: "Sandžak Geg", varietyDetailGeg: "Gegnishtja e Plavës" },
  { name: 'Preshevë', coords: [42.3067, 21.6497], hasCastle: false, isMountainous: false, isGeg: true, varietyDetail: "Eastern Geg", varietyDetailGeg: "Gegnishtja e Luginës" },

  { name: 'Vlorë', coords: [40.4667, 19.4897], hasCastle: true, isCoastal: true, isCapital: true, isGeg: false, varietyDetail: "Labëria Tosk", varietyDetailGeg: "Toskërishtja e Labërisë" },
  { name: 'Berat', coords: [40.7058, 19.9522], hasCastle: true, isMountainous: true, isCapital: true, isGeg: false, varietyDetail: "Northern Tosk", varietyDetailGeg: "Toskërishtja Veriore" },
  { name: 'Gjirokastër', coords: [40.0758, 20.1389], hasCastle: true, isMountainous: true, isGeg: false, varietyDetail: "Labëria Tosk", varietyDetailGeg: "Toskërishtja e Labërisë" },
  { name: 'Korçë', coords: [40.6158, 20.7772], hasCastle: false, isMountainous: true, isGeg: false, varietyDetail: "Northern Tosk", varietyDetailGeg: "Toskërishtja Veriore" },
  { name: 'Sarandë', coords: [39.8756, 20.0053], hasCastle: true, isCoastal: true, isGeg: false, varietyDetail: "Cham Tosk", varietyDetailGeg: "Toskërishtja e Çamërisë" },
  { name: 'Fier', coords: [40.7275, 19.5567], hasCastle: false, isCoastal: true, isGeg: false, varietyDetail: "Myzeqe Tosk", varietyDetailGeg: "Toskërishtja e Myzeqesë" },
  { name: 'Elbasan', coords: [41.1125, 20.0822], hasCastle: true, isGeg: false, varietyDetail: "Northern Tosk (Isogloss)", varietyDetailGeg: "Toskërishtja Veriore" },
  { name: 'Pogradec', coords: [40.9011, 20.6553], hasCastle: false, isCoastal: true, isGeg: false, varietyDetail: "Northern Tosk", varietyDetailGeg: "Toskërishtja Veriore" },
  { name: 'Tepelenë', coords: [40.2958, 20.0192], hasCastle: true, isMountainous: true, isGeg: false, varietyDetail: "Labëria Tosk", varietyDetailGeg: "Toskërishtja e Labërisë" },
  { name: 'Përmet', coords: [40.2333, 20.3500], hasCastle: false, isMountainous: true, isGeg: false, varietyDetail: "Southern Tosk", varietyDetailGeg: "Toskërishtja e Jugut" },
  { name: 'Lushnjë', coords: [40.9419, 19.7028], hasCastle: false, isGeg: false, varietyDetail: "Myzeqe Tosk", varietyDetailGeg: "Toskërishtja e Myzeqesë" },
  { name: 'Delvinë', coords: [39.9511, 20.0978], hasCastle: true, isMountainous: true, isGeg: false, varietyDetail: "Cham Tosk", varietyDetailGeg: "Toskërishtja e Çamërisë" },
  { name: 'Konispol', coords: [39.6589, 20.1814], hasCastle: false, isMountainous: true, isGeg: false, varietyDetail: "Southernmost Tosk", varietyDetailGeg: "Toskërishtja e Jugut" },
];

const REGIONS: RegionData[] = [
  {
    id: 'krahinat_geg',
    name: 'Gegënia',
    nameGeg: 'Gegnia',
    variety: 'geg',
    description: "The historic northern territory of the Albanians, defined by its rugged highlands and the epic literary tradition of the Kanun.",
    descriptionGeg: "Vendi i Gegëve, prej rranxëve t'Maleve t'Namuna e n'bregdet t'Ulqinit, krahina e trimnisë dhe e Besës.",
    subVarieties: ['Malësia e Madhe', 'Dukagjini', 'Kosova', 'Ilirida', 'Mirdita', 'Luma', 'Has', 'Dibër'],
    features: ['Nasal Vowels (â, ê, î, ô, û)', 'Geg Infinitive (me + stem)', 'Distinct Morphology'],
    areaEstimate: "31,200 km²",
    speakerEstimate: "~4.1M",
    centerCoords: [42.4, 20.2]
  },
  {
    id: 'krahinat_tosk',
    name: 'Toskëria',
    nameGeg: 'Toskëria',
    variety: 'tosk',
    description: 'The southern linguistic zone, characterized by rhotacism and a diverse landscape of coastal plains and Labëria highlands.',
    descriptionGeg: "Zona e Jugut, e njoftun për Labërinë, Çamërinë dhe traditën e bukur t'krahinave t'Tosknisë.",
    subVarieties: ['Labëria', 'Myzeqeja', 'Çamëria', 'Arbëreshë', 'Mallakastra', 'Devoll', 'Skrapar'],
    features: ['Rhotacism (n -> r)', 'Lack of Nasals', 'Gerund with (duke)'],
    areaEstimate: "19,800 km²",
    speakerEstimate: "~3.1M",
    centerCoords: [40.2, 20.1]
  }
];

const SHKUMBIN_PATH: [number, number][] = [
  [41.033, 19.383], [41.050, 19.550], [41.080, 19.750], [41.100, 19.950],
  [41.115, 20.080], [41.140, 20.250], [41.180, 20.450], [41.150, 20.580],
  [41.100, 20.750], [41.000, 20.900], [40.850, 21.200], [40.750, 21.450]
];

const GEG_BOUNDS: [number, number][] = [
    [41.10, 19.30], [41.30, 19.40], [41.80, 19.50], [41.93, 19.10], 
    [42.20, 18.80], [42.50, 18.90], [42.80, 19.20], [43.10, 19.50], 
    [43.40, 20.10], [43.50, 21.30], [43.10, 22.10], [42.40, 22.40], 
    [41.60, 21.90], [41.20, 21.70], [40.80, 21.60], [40.75, 21.45], 
    ...([...SHKUMBIN_PATH].reverse())
];

const TOSK_BOUNDS: [number, number][] = [
    ...SHKUMBIN_PATH,
    [40.60, 21.30], [40.30, 21.10], [39.90, 21.00], [39.40, 20.90],
    [38.90, 20.50], [39.00, 20.10], [39.60, 19.90], [40.10, 19.60],
    [40.40, 19.30], [40.80, 19.35], [41.033, 19.383]
];

const LanguageMap: React.FC<{ lang: Language }> = ({ lang }) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(REGIONS[0]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [visibleLayers, setVisibleLayers] = useState({
    boundaries: true,
    cities: true,
    historical: true
  });

  const isGeg = lang === 'geg';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  const boundariesLayerRef = useRef<L.LayerGroup | null>(null);
  const citiesLayerRef = useRef<L.LayerGroup | null>(null);
  const historicalLayerRef = useRef<L.LayerGroup | null>(null);

  const t = {
    title: isGeg ? 'Harta e Gjallë e Gegnisë' : 'The Living Map of Gegnia',
    subtitle: isGeg ? 'Gjeografia e vërtetë e krahinave tona, prej Plavës e Gucisë deri n\'Ulqin, nëpër Kosovë, deri në Manastir e Strugë.' : 'The true geography of our regions, from Plavë e Guci to Ulqin, through Kosovo, to Manastir and Struga.',
    legend_geg: isGeg ? 'Gegënia' : 'Gegnia',
    legend_tosk: isGeg ? 'Toskëria' : 'Toskëria',
    castle_label: isGeg ? 'Kalá' : 'Castle',
    shkumbin: isGeg ? 'Lumi Shkumbin (Kufini Gjuhësor)' : 'Shkumbin River (Linguistic Border)',
    explore: isGeg ? 'Analizo Krahinën' : 'Analyze Region',
    city_variant: isGeg ? 'Varianti Lokal' : 'Local Variety',
    heritage_site: isGeg ? 'Trashëgimi Historike' : 'Historical Heritage',
    layers: isGeg ? 'Shtresat' : 'Layers',
    layer_boundaries: isGeg ? 'Kufijtë Varietalë' : 'Varietal Boundaries',
    layer_cities: isGeg ? 'Qytetet Kryesore' : 'Major Cities',
    layer_historical: isGeg ? 'Vende Historike' : 'Historical Sites',
    stats_title: isGeg ? 'Gjeo-Statistikat' : 'Geo-Stats',
    area_label: isGeg ? 'Sipërfaqja' : 'Area',
    speakers_label: isGeg ? 'Folës' : 'Speakers'
  };

  const createMarker = (city: City) => {
    let characteristicIcon = '';
    if (city.hasCastle) {
        characteristicIcon = `
          <div class="p-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-sm mr-1 flex-shrink-0 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="white" stroke-width="3" class="flex-shrink-0">
                <path d="M19 11V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2"/><path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4"/><path d="M15 11v10"/><path d="M9 11v10"/><path d="M21 11h-4v10h4z"/><path d="M3 11h4v10H3z"/><path d="M11 11h2v4h-2z"/>
            </svg>
          </div>`;
    } else if (city.isCoastal) {
        characteristicIcon = `
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" class="text-blue-500 dark:text-blue-400 mr-1 flex-shrink-0 drop-shadow-sm">
              <path d="M2 6c.6.5 1.2 1 2.5 1s2.5-.5 3-1c.5-.5 1.2-1 2.5-1s2.5.5 3 1c.5.5 1.2 1 2.5 1s2.5-.5 3-1c.5-.5 1.2-1 2.5-1s2.5.5 3 1"/>
          </svg>`;
    } else if (city.isMountainous) {
        characteristicIcon = `
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="3" class="text-emerald-600 dark:text-emerald-400 mr-1 flex-shrink-0 drop-shadow-sm">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
          </svg>`;
    }

    const iconHtml = `
      <div class="flex items-center gap-1 group translate-y-[-50%] ${city.isCapital ? 'animate-pulse-subtle' : ''}">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${city.isGeg ? 'bg-yellow-500' : 'bg-red-600'} flex-shrink-0"></div>
          <div class="flex items-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 whitespace-nowrap group-hover:border-indigo-400 group-hover:shadow-indigo-500/20 transition-all">
              ${characteristicIcon}
              <span class="text-[10px] font-black uppercase tracking-tight ${city.isGeg ? 'text-yellow-900 dark:text-yellow-100' : 'text-red-900 dark:text-red-100'}">${city.name}</span>
          </div>
      </div>
    `;

    const marker = L.marker(city.coords, {
        icon: L.divIcon({
            html: iconHtml,
            className: 'custom-city-marker',
            iconSize: [0, 0],
            iconAnchor: [5, 5]
        })
    });
    
    marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        setSelectedCity(city);
        setHoveredRegion(city.isGeg ? REGIONS[0] : REGIONS[1]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(city.coords, 10, { duration: 1.5 });
        }
    });

    return marker;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
        center: [41.5, 20.0],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        minZoom: 6
    }).addTo(map);

    boundariesLayerRef.current = L.layerGroup().addTo(map);
    citiesLayerRef.current = L.layerGroup().addTo(map);
    historicalLayerRef.current = L.layerGroup().addTo(map);

    updateMapLayers();

    setTimeout(() => {
        map.invalidateSize();
        map.flyTo([41.5, 20.0], 7.5, { duration: 1.5 });
    }, 400);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
        map.remove();
    };
  }, []);

  const updateMapLayers = () => {
    if (!mapInstanceRef.current) return;

    if (boundariesLayerRef.current) {
      boundariesLayerRef.current.clearLayers();
      if (visibleLayers.boundaries) {
        L.polygon(GEG_BOUNDS, {
          color: '#ca8a04',
          fillColor: '#facc15',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '5, 10'
        }).on('mouseover', () => setHoveredRegion(REGIONS[0])).addTo(boundariesLayerRef.current);

        L.polygon(TOSK_BOUNDS, {
          color: '#991b1b',
          fillColor: '#dc2626',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '5, 10'
        }).on('mouseover', () => setHoveredRegion(REGIONS[1])).addTo(boundariesLayerRef.current);

        L.polyline(SHKUMBIN_PATH, {
          color: '#3b82f6',
          weight: 6,
          dashArray: '1, 12',
          lineCap: 'round',
          opacity: 0.7
        }).addTo(boundariesLayerRef.current);
      }
    }

    if (citiesLayerRef.current) {
      citiesLayerRef.current.clearLayers();
      if (visibleLayers.cities) {
        CITIES.filter(c => !c.hasCastle).forEach(city => {
          createMarker(city).addTo(citiesLayerRef.current!);
        });
      }
    }

    if (historicalLayerRef.current) {
      historicalLayerRef.current.clearLayers();
      if (visibleLayers.historical) {
        CITIES.filter(c => c.hasCastle).forEach(city => {
          createMarker(city).addTo(historicalLayerRef.current!);
        });
      }
    }
  };

  useEffect(() => {
    updateMapLayers();
  }, [visibleLayers]);

  const toggleLayer = (key: keyof typeof visibleLayers) => {
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 px-4 sm:px-6">
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1) translateY(-50%); }
          50% { transform: scale(1.05) translateY(-50%); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>
      
      <div className="fixed inset-0 pointer-events-none opacity-5 dark:opacity-10 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(152,0,0,0.1),_transparent_70%)]"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl mb-6 shadow-xl border border-gray-100 dark:border-gray-700">
           <MapIcon className="w-10 h-10 text-albanian-red" />
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
           {t.title}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-4xl mx-auto leading-relaxed">
            {t.subtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch relative z-10 min-h-[650px]">
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-[3rem] p-3 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden flex flex-col items-center">
           
           <div className="absolute top-8 right-8 z-[400] flex flex-col gap-2">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl flex flex-col gap-3 min-w-[200px]">
                 <div className="flex items-center gap-2 mb-1 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <Filter className="w-4 h-4 text-albanian-red" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.layers}</span>
                 </div>
                 
                 <button 
                  onClick={() => toggleLayer('boundaries')}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${visibleLayers.boundaries ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                 >
                    <div className="flex items-center gap-2">
                       <MapIcon className="w-4 h-4" />
                       <span className="text-xs font-bold">{t.layer_boundaries}</span>
                    </div>
                    {visibleLayers.boundaries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                 </button>

                 <button 
                  onClick={() => toggleLayer('cities')}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${visibleLayers.cities ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                 >
                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4" />
                       <span className="text-xs font-bold">{t.layer_cities}</span>
                    </div>
                    {visibleLayers.cities ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                 </button>

                 <button 
                  onClick={() => toggleLayer('historical')}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${visibleLayers.historical ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                 >
                    <div className="flex items-center gap-2">
                       <Castle className="w-4 h-4" />
                       <span className="text-xs font-bold">{t.layer_historical}</span>
                    </div>
                    {visibleLayers.historical ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                 </button>
              </div>
           </div>

           <div className="absolute top-8 left-8 flex flex-col gap-3 z-[400] max-w-[220px]">
              {visibleLayers.boundaries && REGIONS.map((region) => (
                <div key={region.id} className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${region.variety === 'geg' ? 'bg-yellow-500' : 'bg-red-600'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
                      {isGeg ? region.nameGeg : region.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-[7px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                        <Target className="w-2 h-2" /> {t.area_label}
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{region.areaEstimate}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-[7px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                        <Users className="w-2 h-2" /> {t.speakers_label}
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200">{region.speakerEstimate}</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <div ref={mapContainerRef} className="w-full h-[550px] sm:h-[650px] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner z-10 transition-opacity duration-1000"></div>
           
           <div className="absolute bottom-8 left-8 z-[400] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg pointer-events-none">
              <div className="flex items-center gap-2 text-blue-500">
                 <Anchor className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{t.shkumbin}</span>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
           {selectedCity ? (
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl animate-scale-in flex flex-col flex-grow relative overflow-hidden group">
                  <button onClick={() => setSelectedCity(null)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-colors z-20">
                     <X className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center justify-between mb-8">
                     <div className={`p-4 rounded-2xl shadow-sm ${selectedCity.isGeg ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                        <MapPin className="w-8 h-8" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Deep Geo-Analysis</span>
                  </div>

                  <h2 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-6 leading-none flex items-center gap-3">
                     {selectedCity.hasCastle ? (
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Castle className="w-6 h-6 text-white" />
                        </div>
                     ) : selectedCity.isCoastal ? <Waves className="w-8 h-8 text-blue-500" /> : selectedCity.isMountainous ? <Mountain className="w-8 h-8 text-emerald-600" /> : <MapPin className="w-8 h-8 text-gray-400" />}
                     {selectedCity.name}
                  </h2>

                  <div className="space-y-10 flex-grow">
                     <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-inner">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Globe className="w-4 h-4 text-indigo-500" /> {t.city_variant}
                        </h3>
                        <p className="text-xl font-black text-gray-800 dark:text-gray-200">
                           {isGeg ? selectedCity.varietyDetailGeg : selectedCity.varietyDetail}
                        </p>
                     </div>

                     <div className="px-2">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Landmark className="w-4 h-4 text-amber-500" /> {t.heritage_site}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
                            Historically nji qendër e randsishme ushtarake e kulturore. {selectedCity.hasCastle ? 'Fortress' : 'Location'} served as a bastion for {selectedCity.isGeg ? 'Geg' : 'Tosk'} phonology. {selectedCity.isCoastal ? 'Its maritime position influenced local lexicon through historical trade.' : selectedCity.isMountainous ? 'Its elevation created isolation that helped preserve archaic dialect forms.' : ''}
                        </p>
                     </div>
                  </div>

                  <div className="mt-10">
                     <button className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${selectedCity.isGeg ? 'bg-yellow-600' : 'bg-red-600'}`}>
                        {isGeg ? 'Shih Fjalorin e Qytetit' : 'View City Lexicon'} <ArrowRight className="w-5 h-5" />
                     </button>
                  </div>
              </div>
           ) : hoveredRegion ? (
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl animate-scale-in flex flex-col flex-grow relative overflow-hidden group">
                 <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: hoveredRegion.variety === 'geg' ? '#eab308' : '#dc2626' }}></div>
                 
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className={`p-4 rounded-2xl shadow-sm ${hoveredRegion.variety === 'geg' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                       {hoveredRegion.variety === 'geg' ? <Landmark className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Territory Profile</span>
                 </div>

                 <h2 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-4 leading-none relative z-10">
                    {isGeg ? hoveredRegion.nameGeg : hoveredRegion.name}
                 </h2>

                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-lg mb-8 border-l-4 border-gray-200 dark:border-gray-700 pl-6 font-medium relative z-10">
                    "{isGeg ? hoveredRegion.descriptionGeg : hoveredRegion.description}"
                 </p>

                 <div className="space-y-8 flex-grow relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                          <div className="flex items-center gap-2 mb-1">
                             <Target className="w-3.5 h-3.5 text-indigo-500" />
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.area_label}</span>
                          </div>
                          <span className="text-lg font-black text-gray-800 dark:text-gray-100">{hoveredRegion.areaEstimate}</span>
                       </div>
                       <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                          <div className="flex items-center gap-2 mb-1">
                             <Users className="w-3.5 h-3.5 text-emerald-500" />
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.speakers_label}</span>
                          </div>
                          <span className="text-lg font-black text-gray-800 dark:text-gray-100">{hoveredRegion.speakerEstimate}</span>
                       </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-indigo-500" /> Varietal Distribution
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {hoveredRegion.subVarieties.map(sv => (
                            <span key={sv} className="px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-black border border-gray-100 dark:border-gray-700 shadow-sm">{sv}</span>
                          ))}
                       </div>
                    </div>

                    <div className="px-2">
                       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" /> Core Determinants
                       </h3>
                       <ul className="space-y-4">
                          {hoveredRegion.features.map((feat, i) => (
                             <li key={i} className="flex items-start gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${hoveredRegion.variety === 'geg' ? 'bg-yellow-500' : 'bg-red-600'}`}></div>
                                {feat}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 <div className="mt-10 relative z-10">
                    <button className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${hoveredRegion.variety === 'geg' ? 'bg-yellow-600 shadow-yellow-500/20' : 'bg-red-600 shadow-red-500/20'}`}>
                       {t.explore} <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           ) : (
              <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-[2.5rem] p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 flex-grow flex flex-col items-center justify-center text-center opacity-70">
                 <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <Mountain className="w-12 h-12 text-gray-300 dark:text-gray-600 animate-pulse" />
                 </div>
                 <h3 className="text-2xl font-serif font-black text-gray-400 dark:text-gray-500 mb-4 tracking-tight">Select a Location</h3>
                 <p className="text-gray-400 dark:text-gray-600 text-sm max-w-[220px] leading-relaxed">Zoom in and use the Layer Controls to filter historical sites or major cities.</p>
              </div>
           )}

           <div className="bg-slate-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hidden sm:block border border-slate-800 mt-6">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
              <h3 className="text-xl font-serif font-black mb-4 relative z-10 flex items-center gap-3">
                 <Landmark className="w-6 h-6 text-indigo-400" /> Varietal Preservation
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed relative z-10 italic font-medium">
                 The mountain geography of the North (Gegnia) created natural barriers that preserved archaic linguistic forms for millennia.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageMap;
