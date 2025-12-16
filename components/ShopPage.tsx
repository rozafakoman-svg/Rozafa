
import React, { useState } from 'react';
import { Product, Language } from '../types';
import { ShoppingBag, Star, CheckCircle, Loader2, Package, Sparkles, Crown, Megaphone, ShoppingCart, Filter, Heart, X, Search, ArrowRight, Trash2, CreditCard } from './Icons';

interface ShopPageProps {
  lang: Language;
  cartItems: string[];
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
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

const ShopPage: React.FC<ShopPageProps> = ({ lang, cartItems, onAddToCart, onRemoveFromCart, onClearCart }) => {
  const isGeg = lang === 'geg';
  const [activeCategory, setActiveCategory] = useState<'all' | 'apparel' | 'souvenir' | 'digital' | 'corporate'>('all');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const filteredProducts = activeCategory === 'all' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

  // Derive cart contents
  const cartProducts = cartItems.map(id => MOCK_PRODUCTS.find(p => p.id === id)).filter(Boolean) as Product[];
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

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate API call for payment
    setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutSuccess(true);
        onClearCart();
        
        // Auto close after delay
        setTimeout(() => {
            setCheckoutSuccess(false);
            setIsCartOpen(false);
        }, 3000);
    }, 2000);
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
          <button 
            onClick={() => { setIsCartOpen(true); setCheckoutSuccess(false); }}
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

      {/* Cart Modal/Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-emerald-600" /> 
                    {isGeg ? 'Shporta' : 'Your Cart'}
                 </h2>
                 <button 
                    onClick={() => setIsCartOpen(false)} 
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    disabled={isCheckingOut}
                 >
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>

              {/* Cart Content */}
              {checkoutSuccess ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 animate-bounce" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">{isGeg ? 'Pagesa u Krye!' : 'Payment Successful!'}</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8">{isGeg ? 'Faleminderit për blerjen.' : 'Thank you for your purchase.'}</p>
                      <button 
                        onClick={() => setIsCartOpen(false)}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
                      >
                        {isGeg ? 'Mbyll' : 'Close'}
                      </button>
                  </div>
              ) : (
                  <>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {cartProducts.length === 0 ? (
                            <div className="text-center py-12">
                            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {isGeg ? 'Shporta âsht e zbrazët.' : 'Your cart is empty.'}
                            </p>
                            <button onClick={() => setIsCartOpen(false)} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">
                                {isGeg ? 'Fillo Blerjen' : 'Start Shopping'}
                            </button>
                            </div>
                        ) : (
                            cartProducts.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${item.color.split(' ')[0]}`}>
                                    <ShoppingBag className="w-6 h-6" /> 
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{isGeg ? item.nameGeg : item.name}</h4>
                                    <p className="text-emerald-600 font-bold">${item.price.toFixed(2)}</p>
                                </div>
                                <button 
                                    onClick={() => onRemoveFromCart(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Remove"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Checkout */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">{isGeg ? 'Totali' : 'Total'}</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                        </div>
                        <button 
                        onClick={handleCheckout}
                        disabled={cartItems.length === 0 || isCheckingOut}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isCheckingOut ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> {isGeg ? 'Duke procesue...' : 'Processing...'}</>
                            ) : (
                                <>{isGeg ? 'Paguaj' : 'Checkout'} - ${totalPrice.toFixed(2)}</>
                            )}
                        </button>
                    </div>
                  </>
              )}
           </div>
        </div>
      )}

      {/* Main Content: Categories & Products */}
      <div className="flex flex-col gap-8">
          
          {/* Categories */}
          <div className="flex justify-center flex-wrap gap-3">
              {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as any)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                        activeCategory === cat.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                      {cat.label}
                  </button>
              ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
                      {/* Product Image Placeholder */}
                      <div className={`aspect-square rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden ${product.color}`}>
                          {renderProductIcon(product.imageIcon)}
                          
                          {/* Rating Badge */}
                          <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {product.rating}
                          </div>
                      </div>

                      <div className="flex-grow flex flex-col">
                          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                              {isGeg ? product.nameGeg : product.name}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                              {product.description}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between">
                              <span className="text-2xl font-black text-gray-900 dark:text-white">
                                  ${product.price}
                              </span>
                              <button 
                                onClick={() => handleAddToCartClick(product)}
                                disabled={addingToCart === product.id}
                                className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                              >
                                  {addingToCart === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                                  {isGeg ? 'Shto' : 'Add'}
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default ShopPage;
