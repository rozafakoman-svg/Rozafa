import React, { useState } from 'react';
import { Language } from '../App';
import { Product } from '../types';
import { ShoppingBag, Star, CheckCircle, Loader2, Package, Sparkles, Crown, Megaphone, ShoppingCart, Filter, Heart, X, Search, ArrowRight } from './Icons';

interface ShopPageProps {
  lang: Language;
}

const MOCK_PRODUCTS: (Product & { rating: number, reviews: number })[] = [
  {
    id: '1',
    name: 'Geg Dialect T-Shirt',
    nameGeg: 'T-Shirt "Flas Gegnisht"',
    description: 'Premium 100% cotton tee featuring the bold declaration "Flas Gegnisht" (I speak Geg). Available in sizes S-XXL.',
    price: 25.00,
    category: 'apparel',
    imageIcon: 'tshirt',
    color: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600',
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'Traditional Mug',
    nameGeg: 'Filxhan "Besa"',
    description: 'Ceramic mug featuring the Kanun symbol of Besa. Perfect for your morning Turkish coffee.',
    price: 15.00,
    category: 'souvenir',
    imageIcon: 'mug',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600',
    rating: 4.9,
    reviews: 89
  },
  {
    id: '5',
    name: 'Lahuta e Malcis (Special Ed.)',
    nameGeg: 'Lahuta e Malcís (Botim Special)',
    description: 'Hardcover collector\'s edition of Fishta\'s masterpiece with modern Geg commentary and illustrations.',
    price: 45.00,
    category: 'souvenir',
    imageIcon: 'book',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600',
    rating: 5.0,
    reviews: 210
  },
  {
    id: '6',
    name: 'Supporter Hoodie',
    nameGeg: 'Hoodie "Gegenisht"',
    description: 'Heavyweight hoodie with embroidered project logo. Warm, durable, and stylish.',
    price: 60.00,
    category: 'apparel',
    imageIcon: 'hoodie',
    color: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800',
    rating: 4.7,
    reviews: 56
  },
  {
    id: '3',
    name: 'Digital Sticker Pack',
    nameGeg: 'Ngjitëse Digjitale',
    description: 'High-res animated stickers for WhatsApp/Telegram featuring common Geg idioms and expressions.',
    price: 5.00,
    category: 'digital',
    imageIcon: 'sticker',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600',
    rating: 4.5,
    reviews: 340
  },
  {
    id: '4',
    name: 'Adopt a Word (Certificate)',
    nameGeg: 'Përshtat nji Fjalë',
    description: 'Sponsor an archaic word. You get a personalized digital certificate and your name in the dictionary entry.',
    price: 50.00,
    category: 'digital',
    imageIcon: 'cert',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600',
    rating: 5.0,
    reviews: 42
  },
  {
    id: '7',
    name: 'Corporate Sponsor (1 Month)',
    nameGeg: 'Sponsor Korporativ (1 Muaj)',
    description: 'Place your banner ad on our homepage and dictionary entries. High visibility for your brand.',
    price: 200.00,
    category: 'corporate',
    imageIcon: 'ad',
    color: 'bg-gradient-to-br from-slate-800 to-black text-white',
    rating: 5.0,
    reviews: 5
  }
];

const ShopPage: React.FC<ShopPageProps> = ({ lang }) => {
  const isGeg = lang === 'geg';
  const [activeCategory, setActiveCategory] = useState<'all' | 'apparel' | 'souvenir' | 'digital' | 'corporate'>('all');
  const [cart, setCart] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const filteredProducts = activeCategory === 'all' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    setAddingToCart(product.id);
    setTimeout(() => {
        setCart([...cart, product.id]);
        setAddingToCart(null);
        setNotification(isGeg ? `U shtue në shportë: ${product.nameGeg}` : `Added to cart: ${product.name}`);
        setTimeout(() => setNotification(null), 3000);
    }, 600);
  };

  const renderProductIcon = (type: string) => {
    switch (type) {
      case 'tshirt': return <Package className="w-10 h-10" />;
      case 'hoodie': return <Package className="w-10 h-10" />;
      case 'mug': return <ShoppingBag className="w-10 h-10" />;
      case 'sticker': return <Sparkles className="w-10 h-10" />;
      case 'cert': return <Crown className="w-10 h-10" />;
      case 'book': return <ShoppingBag className="w-10 h-10" />;
      case 'ad': return <Megaphone className="w-10 h-10" />;
      default: return <ShoppingBag className="w-10 h-10" />;
    }
  };

  const categories = [
      { id: 'all', label: isGeg ? 'Të Gjitha' : 'All' },
      { id: 'apparel', label: isGeg ? 'Veshje' : 'Apparel' },
      { id: 'souvenir', label: isGeg ? 'Suvenire' : 'Souvenirs' },
      { id: 'digital', label: isGeg ? 'Digjitale' : 'Digital' },
      { id: 'corporate', label: isGeg ? 'Sponsor' : 'Corporate' },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 relative">
      
      {/* Toast Notification */}
      {notification && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{notification}</span>
          </div>
      )}

      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-40">
          <button className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center relative hover:scale-110 hover:bg-emerald-500 transition-all group">
              <ShoppingCart className="w-7 h-7" />
              {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                      {cart.length}
                  </span>
              )}
          </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-900 dark:bg-black rounded-3xl overflow-hidden mb-12 relative shadow-2xl mx-4 lg:mx-0">
         <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-emerald-900/40 to-transparent z-10 pointer-events-none"></div>
         <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
         
         <div className="relative z-20 p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-3 h-3" /> {isGeg ? 'Koleksioni i Ri 2024' : 'New Collection 2024'}
                </div>
                <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                    {isGeg ? 'Vishni Kulturën,' : 'Wear the Culture,'} <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                        {isGeg ? 'Ruani Gjuhën.' : 'Preserve the Language.'}
                    </span>
                </h1>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    {isGeg 
                        ? '100% e fitimeve shkojnë direkt për zhvillimin e platformës Gegenisht dhe digjitalizimin e arkivave.' 
                        : '100% of profits go directly to the development of the Gegenisht platform and archive digitization.'}
                </p>
                <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 mx-auto md:mx-0">
                    {isGeg ? 'Bli Tani' : 'Shop Now'} <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            {/* Hero Image Abstract Representation */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/10 animate-float">
                <ShoppingBag className="w-32 h-32 text-white/90 drop-shadow-lg" />
                <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold shadow-xl rotate-[-6deg]">
                    {isGeg ? 'Cilësi Premium' : 'Premium Quality'}
                </div>
            </div>
         </div>
      </div>

      {/* Filter Categories */}
      <div className="flex justify-center mb-10 px-4 overflow-x-auto no-scrollbar">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2">
              {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                        activeCategory === cat.id 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                      {cat.label}
                  </button>
              ))}
          </div>
      </div>

       {/* Products Grid */}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {filteredProducts.map((product) => (
             <div key={product.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
                {/* Image Placeholder */}
                <div className={`h-64 ${product.color} flex items-center justify-center relative`}>
                   {/* Favorite Button */}
                   <button className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-gray-700 transition-colors z-10">
                       <Heart className="w-5 h-5" />
                   </button>
                   
                   {/* Product Icon */}
                   <div className="bg-white/90 dark:bg-gray-900/50 p-6 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {renderProductIcon(product.imageIcon)}
                   </div>
                   
                   {/* Category Badge */}
                   <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 dark:text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Package className="w-3 h-3" /> {product.category}
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white leading-tight pr-4">
                        {isGeg ? product.nameGeg : product.name}
                      </h3>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${product.price}</span>
                   </div>
                   
                   {/* Rating */}
                   <div className="flex items-center gap-1 mb-4">
                       <div className="flex text-yellow-400">
                           {[...Array(5)].map((_, i) => (
                               <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                           ))}
                       </div>
                       <span className="text-xs text-gray-400 font-medium ml-1">({product.reviews})</span>
                   </div>

                   <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                      {product.description}
                   </p>

                   <button 
                     onClick={() => handleAddToCart(product)}
                     disabled={!!addingToCart}
                     className="w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {addingToCart === product.id ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> {isGeg ? 'Duke shtue...' : 'Adding...'}</>
                     ) : (
                        <>{isGeg ? 'Shto në Shportë' : 'Add to Cart'}</>
                     )}
                   </button>
                </div>
             </div>
          ))}
       </div>

       {/* Bottom Trust Badge */}
       <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
              <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{isGeg ? 'Cilësi e Garantueme' : 'Quality Guaranteed'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isGeg ? 'Produkte të zgjedhuna me kujdes.' : 'Carefully curated products.'}</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Package className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{isGeg ? 'Dërgesa në gjithë botën' : 'Worldwide Shipping'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isGeg ? 'Kudo që janë shqiptarët.' : 'Wherever Albanians are.'}</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{isGeg ? 'Mbështetje për Kauzën' : 'Support the Cause'}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{isGeg ? 'Çdo blerje ndihmon gjuhën.' : 'Every purchase helps the language.'}</p>
              </div>
          </div>
       </div>
    </div>
  );
};

export default ShopPage;