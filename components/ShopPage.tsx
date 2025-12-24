
import React, { useState, useEffect } from 'react';
import { Product, Language } from '../types';
import { ShoppingBag, Star, CheckCircle, Loader2, Package, Sparkles, Crown, Megaphone, ShoppingCart, Filter, Heart, X, Search, ArrowRight, Trash2, CreditCard, Lock, ArrowLeft, Image as ImageIcon } from './Icons';
import { db, Stores } from '../services/db';
import { fetchProductVisual } from '../services/geminiService';

interface ShopPageProps {
  lang: Language;
  cartItems: string[];
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'cart' | 'method' | 'stripe' | 'paypal' | 'processing' | 'success';

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Geg Language T-Shirt',
    nameGeg: 'T-Shirt "Flas Gegnisht"',
    description: 'Premium 100% cotton tee featuring the bold declaration "Flas Gegnisht" (I speak Geg). Available in sizes S-XXL.',
    price: 25.00,
    category: 'apparel',
    imageIcon: 'tshirt',
    imagePrompt: 'A premium black t-shirt with white text saying "Flas Gegnisht" in an elegant font, folded neatly on a white surface.',
    color: 'bg-gradient-to-br from-red-50 to-red-100 text-red-600',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 'p2',
    name: 'Traditional Mug',
    nameGeg: 'Filxhan "Besa"',
    description: 'Ceramic mug featuring the Kanun symbol of Besa. Perfect for your morning Turkish coffee.',
    price: 15.00,
    category: 'souvenir',
    imageIcon: 'mug',
    imagePrompt: 'A minimalist white ceramic coffee mug with a traditional Albanian Besa eagle symbol etched in black, studio lighting.',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600',
    rating: 4.9,
    reviews: 89
  },
  {
    id: 'p5',
    name: 'Lahuta e Malcís',
    nameGeg: 'Lahuta e Malcís',
    description: 'Hardcover collector\'s edition of Fishta\'s masterpiece with modern Geg commentary and illustrations.',
    price: 99.00,
    category: 'souvenir',
    imageIcon: 'book',
    imagePrompt: 'A luxurious hardcover book titled "Lahuta e Malcís" with gold foil ornaments on the cover, premium leather texture.',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600',
    rating: 5.0,
    reviews: 210
  }
];

const ShopPage: React.FC<ShopPageProps> = ({ lang, cartItems, onAddToCart, onRemoveFromCart, onClearCart }) => {
  const isGeg = lang === 'geg';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'apparel' | 'souvenir' | 'digital' | 'corporate'>('all');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvc: '' });

  const categories = [
    { id: 'all', label: isGeg ? 'Të Gjitha' : 'All' },
    { id: 'apparel', label: isGeg ? 'Veshje' : 'Apparel' },
    { id: 'souvenir', label: isGeg ? 'Suvenire' : 'Souvenirs' },
    { id: 'digital', label: isGeg ? 'Digjitale' : 'Digital' },
    { id: 'corporate', label: isGeg ? 'Korporative' : 'Corporate' },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const stored = await db.getAll<Product>(Stores.Products);
      let activeProducts = stored.length === 0 ? INITIAL_MOCK_PRODUCTS : stored;
      
      const missingMocks = INITIAL_MOCK_PRODUCTS.filter(m => !activeProducts.find(ap => ap.id === m.id));
      if (missingMocks.length > 0) {
          activeProducts = [...activeProducts, ...missingMocks];
      }

      setProducts(activeProducts);
      
      // Auto-generate missing visuals in background
      const missingVisuals = activeProducts.filter(p => !p.imageUrl && p.imagePrompt);
      if (missingVisuals.length > 0) {
          generateMissingVisuals(missingVisuals);
      }
    } catch (e) {
      setProducts(INITIAL_MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMissingVisuals = async (targetProducts: Product[]) => {
      setIsGeneratingVisuals(true);
      for (const product of targetProducts) {
          try {
              if (product.imagePrompt) {
                  const url = await fetchProductVisual(product.imagePrompt);
                  const updatedProduct = { ...product, imageUrl: url };
                  await db.put(Stores.Products, updatedProduct);
                  setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
                  // Throttling to respect rate limits
                  await new Promise(r => setTimeout(r, 1000));
              }
          } catch (e) {
              console.warn(`Visual generation failed for ${product.id}`, e);
          }
      }
      setIsGeneratingVisuals(false);
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const cartProducts = cartItems.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  const totalPrice = cartProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddToCartClick = (product: Product) => {
    setAddingToCart(product.id);
    setTimeout(() => {
        onAddToCart(product.id);
        setAddingToCart(null);
        setNotification(isGeg ? `U shtue në shportë: ${product.nameGeg}` : `Added to cart: ${product.name}`);
        setTimeout(() => setNotification(null), 3000);
    }, 600);
  };

  const startCheckoutFlow = () => {
      setCheckoutStep('method');
  };

  const processStripePayment = (e: React.FormEvent) => {
      e.preventDefault();
      setCheckoutStep('processing');
      setTimeout(() => {
          setCheckoutStep('success');
          onClearCart();
      }, 2000);
  };

  const processPaypalPayment = () => {
      setCheckoutStep('processing');
      setTimeout(() => {
          setCheckoutStep('success');
          onClearCart();
      }, 1500);
  };

  const closeCart = () => {
      setIsCartOpen(false);
      setCheckoutStep('cart');
      setCardData({ name: '', number: '', expiry: '', cvc: '' });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up pb-24 relative">
      {notification && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">{notification}</span>
          </div>
      )}

      <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-16 h-16 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center relative hover:scale-110 hover:bg-emerald-500 transition-all group"
          >
              <ShoppingCart className="w-7 h-7" />
              {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                      {cartItems.length}
                  </span>
              )}
          </button>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                 <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" /> {isGeg ? 'Shporta Juej' : 'Your Cart'}
                 </h3>
                 <button onClick={closeCart} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                 </button>
              </div>

              <div className="flex-grow overflow-y-auto p-6">
                 {checkoutStep === 'cart' ? (
                    cartProducts.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                          <Package className="w-16 h-16 mb-4" />
                          <p className="font-bold">{isGeg ? 'Shporta asht e zbrazët' : 'Cart is empty'}</p>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          {cartProducts.map((p, idx) => (
                             <div key={idx} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-600">
                                   {p.imageUrl ? (
                                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                   ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-8 h-8" /></div>
                                   )}
                                </div>
                                <div className="flex-grow">
                                   <h4 className="font-bold dark:text-white">{isGeg ? p.nameGeg : p.name}</h4>
                                   <div className="text-emerald-600 font-black">€{p.price.toFixed(2)}</div>
                                </div>
                                <button onClick={() => onRemoveFromCart(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg self-start">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          ))}
                       </div>
                    )
                 ) : checkoutStep === 'method' ? (
                    <div className="space-y-4 pt-10">
                       <button onClick={() => setCheckoutStep('stripe')} className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl flex items-center gap-4 hover:border-emerald-500 transition-all group">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform"><CreditCard className="w-6 h-6" /></div>
                          <div className="text-left">
                             <div className="font-bold dark:text-white">Stripe / Card</div>
                             <div className="text-xs text-gray-400">Secure credit card payment</div>
                          </div>
                       </button>
                       <button onClick={processPaypalPayment} className="w-full p-6 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl flex items-center gap-4 hover:border-[#003087] transition-all group">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[#003087] group-hover:scale-110 transition-transform"><Package className="w-6 h-6" /></div>
                          <div className="text-left">
                             <div className="font-bold dark:text-white">PayPal</div>
                             <div className="text-xs text-gray-400">Checkout with your account</div>
                          </div>
                       </button>
                    </div>
                 ) : checkoutStep === 'stripe' ? (
                    <form onSubmit={processStripePayment} className="space-y-6 pt-6">
                       <div className="space-y-1">
                          <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Card Number</label>
                          <input required className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 dark:text-white" placeholder="0000 0000 0000 0000" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Expiry</label>
                             <input required className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 dark:text-white" placeholder="MM/YY" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-xs font-black uppercase text-gray-400 tracking-widest">CVC</label>
                             <input required className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-emerald-500 dark:text-white" placeholder="123" />
                          </div>
                       </div>
                       <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" /> Pay €{totalPrice.toFixed(2)}
                       </button>
                    </form>
                 ) : checkoutStep === 'processing' ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                       <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
                       <p className="font-bold text-gray-500">{isGeg ? 'Tuj e procesue...' : 'Processing payment...'}</p>
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-scale-in">
                       <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                       </div>
                       <h2 className="text-2xl font-bold dark:text-white mb-2">{isGeg ? 'Pagesa u Krye!' : 'Payment Success!'}</h2>
                       <p className="text-gray-500 dark:text-gray-400">{isGeg ? 'Ju faleminderit për mbështetjen e projektit.' : 'Thank you for supporting the project.'}</p>
                    </div>
                 )}
              </div>

              {checkoutStep === 'cart' && cartProducts.length > 0 && (
                 <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-gray-500 font-bold">{isGeg ? 'Totali' : 'Total'}</span>
                       <span className="text-3xl font-black dark:text-white">€{totalPrice.toFixed(2)}</span>
                    </div>
                    <button onClick={startCheckoutFlow} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                       {isGeg ? 'Vazhdo te Pagesa' : 'Checkout'} <ArrowRight className="w-5 h-5" />
                    </button>
                 </div>
              )}
           </div>
        </div>
      )}

      <div className="mb-16 px-4">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <div>
               <h1 className="text-4xl sm:text-6xl font-serif font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                  {isGeg ? 'Dyqani ' : 'The '}<span className="text-emerald-600">Gegenisht</span>
               </h1>
               <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl leading-relaxed">
                  {isGeg ? 'Veshje dhe suvenire me frymëzim nga veriu i Shqipnisë. Çdo blerje ndihmon mbajtjen gjallë të arkivës.' : 'Apparel and souvenirs inspired by Northern Albania. Every purchase helps keep the archive alive.'}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6">
            {categories.map(cat => (
               <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
               >
                  {cat.label}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
         {filteredProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col h-full relative">
               <div className="aspect-square bg-gray-50 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                     <div className="flex flex-col items-center gap-3 opacity-20">
                        <Package className="w-20 h-20" />
                        {isGeneratingVisuals && <Loader2 className="w-6 h-6 animate-spin" />}
                     </div>
                  )}
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                     <button className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <div className="p-10 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2 block">{product.category}</span>
                        <h3 className="text-2xl font-serif font-black text-gray-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors">
                           {isGeg ? product.nameGeg : product.name}
                        </h3>
                     </div>
                     <div className="text-2xl font-black dark:text-white">€{product.price.toFixed(2)}</div>
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 flex-grow font-medium">
                     {product.description}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800">
                     <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold dark:text-white">{product.rating}</span>
                        <span className="text-xs text-gray-400 font-medium">({product.reviews})</span>
                     </div>
                     <button 
                        onClick={() => handleAddToCartClick(product)}
                        disabled={addingToCart === product.id}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${addingToCart === product.id ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-emerald-600 dark:hover:bg-emerald-100'}`}
                     >
                        {addingToCart === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                        {addingToCart === product.id ? 'Tuj e shtue...' : (isGeg ? 'Shto në Shportë' : 'Add to Cart')}
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default ShopPage;
