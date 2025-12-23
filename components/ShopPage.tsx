
import React, { useState, useEffect } from 'react';
import { Product, Language } from '../types';
/* Added ArrowLeft to imports to fix find name error */
import { ShoppingBag, Star, CheckCircle, Loader2, Package, Sparkles, Crown, Megaphone, ShoppingCart, Filter, Heart, X, Search, ArrowRight, Trash2, CreditCard, Lock, ArrowLeft } from './Icons';
import { db, Stores } from '../services/db';

interface ShopPageProps {
  lang: Language;
  cartItems: string[];
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'cart' | 'method' | 'stripe' | 'paypal' | 'processing' | 'success';

const INITIAL_MOCK_PRODUCTS: (Product & { rating: number, reviews: number })[] = [
  {
    id: 'p1',
    name: 'Geg Language T-Shirt',
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
    id: 'p2',
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
    id: 'p5',
    name: 'Lahuta e Malcis (Special Ed.)',
    nameGeg: 'Lahuta e Malcís (Botim Special)',
    description: 'Hardcover collector\'s edition of Fishta\'s masterpiece with modern Geg commentary and illustrations.',
    price: 45.00,
    category: 'souvenir',
    imageIcon: 'book',
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
  
  // Checkout State Machine
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  
  // Simulated Card Data
  const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvc: '' });

  /* Categories definition for filtering display */
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
      if (stored.length === 0) {
        setProducts(INITIAL_MOCK_PRODUCTS);
      } else {
        setProducts(stored);
      }
    } catch (e) {
      setProducts(INITIAL_MOCK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
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
      // Simulated Redirect Experience
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

  const renderProductIcon = (type: string) => {
    switch (type) {
      case 'tshirt': return <Package className="w-10 h-10" />;
      case 'mug': return <ShoppingBag className="w-10 h-10" />;
      case 'book': return <ShoppingBag className="w-10 h-10" />;
      default: return <ShoppingBag className="w-10 h-10" />;
    }
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
           <div className="bg-white dark:bg-gray-900 w-full max-md h-full shadow-2xl flex flex-col animate-slide-in-right relative">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    {checkoutStep !== 'cart' && checkoutStep !== 'success' && (
                        <button onClick={() => setCheckoutStep('method')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full mr-2">
                            <ArrowLeft className="w-5 h-5"/>
                        </button>
                    )}
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {checkoutStep === 'cart' && <><ShoppingCart className="w-6 h-6 text-emerald-600" /> {isGeg ? 'Shporta' : 'Your Cart'}</>}
                        {checkoutStep === 'method' && <><Lock className="w-6 h-6 text-indigo-600" /> {isGeg ? 'Pagesa' : 'Checkout'}</>}
                        {checkoutStep === 'stripe' && <><CreditCard className="w-6 h-6 text-indigo-600" /> {isGeg ? 'Karta' : 'Pay by Card'}</>}
                        {checkoutStep === 'paypal' && <><Package className="w-6 h-6 text-blue-600" /> {isGeg ? 'PayPal' : 'PayPal Checkout'}</>}
                    </h2>
                 </div>
                 <button onClick={closeCart} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <X className="w-5 h-5 text-gray-500" />
                 </button>
              </div>

              {/* STEP: CART VIEW */}
              {checkoutStep === 'cart' && (
                  <>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {cartProducts.length === 0 ? (
                            <div className="text-center py-12">
                            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{isGeg ? 'Shporta âsht e zbrazët.' : 'Your cart is empty.'}</p>
                            </div>
                        ) : (
                            cartProducts.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 group">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${item.color?.split(' ')[0] || 'bg-indigo-500'}`}>
                                    <ShoppingBag className="w-6 h-6" /> 
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate text-sm">{isGeg ? item.nameGeg : item.name}</h4>
                                    <p className="text-emerald-600 font-bold text-xs">${item.price.toFixed(2)}</p>
                                </div>
                                <button onClick={() => onRemoveFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            ))
                        )}
                    </div>
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-sm">{isGeg ? 'Totali' : 'Total'}</span>
                            <span className="text-3xl font-black text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={startCheckoutFlow} 
                            disabled={cartItems.length === 0} 
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                           {isGeg ? 'Shko te Pagesa' : 'Continue to Payment'} <ArrowRight className="w-5 h-5"/>
                        </button>
                    </div>
                  </>
              )}

              {/* STEP: PAYMENT METHOD SELECTION */}
              {checkoutStep === 'method' && (
                  <div className="p-8 space-y-6 flex-grow animate-fade-in">
                      <p className="text-sm text-gray-500 mb-2">{isGeg ? 'Zgjidhni mënyrën e pagesës:' : 'Select payment method:'}</p>
                      
                      <button 
                        onClick={() => setCheckoutStep('stripe')}
                        className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                  <CreditCard className="w-6 h-6"/>
                              </div>
                              <div className="text-left">
                                  <p className="font-bold dark:text-white">{isGeg ? 'Kartë Krediti' : 'Credit / Debit Card'}</p>
                                  <p className="text-xs text-gray-400">Visa, Mastercard, Amex</p>
                              </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500"/>
                      </button>

                      <button 
                        onClick={() => setCheckoutStep('paypal')}
                        className="w-full p-6 border-2 border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-[#003087] rounded-xl flex items-center justify-center text-white shadow-lg">
                                  <Package className="w-6 h-6"/>
                              </div>
                              <div className="text-left">
                                  <p className="font-bold dark:text-white">PayPal</p>
                                  <p className="text-xs text-gray-400">Fast and secure</p>
                              </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500"/>
                      </button>
                      
                      <div className="pt-10 flex flex-col items-center gap-2 opacity-50">
                         <div className="flex items-center gap-1 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            <Lock className="w-3 h-3" /> Secure SSL Checkout
                         </div>
                         <p className="text-[10px] text-gray-400 max-w-[200px] text-center">All transactions are encrypted and processed securely by our global partners.</p>
                      </div>
                  </div>
              )}

              {/* STEP: STRIPE FORM */}
              {checkoutStep === 'stripe' && (
                  <div className="p-8 flex-grow animate-fade-in">
                      <form onSubmit={processStripePayment} className="space-y-6">
                         <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-2">{isGeg ? 'Emni në Kartë' : 'Name on Card'}</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:border-indigo-500"
                                value={cardData.name}
                                onChange={e => setCardData({...cardData, name: e.target.value})}
                                required
                            />
                         </div>
                         <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-2">{isGeg ? 'Numri i Kartës' : 'Card Number'}</label>
                            <input 
                                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-mono outline-none focus:border-indigo-500"
                                placeholder="0000 0000 0000 0000"
                                value={cardData.number}
                                onChange={e => setCardData({...cardData, number: e.target.value})}
                                required
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 block mb-2">Expiry</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-center"
                                    placeholder="MM/YY"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-gray-400 block mb-2">CVC</label>
                                <input 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white text-center"
                                    placeholder="000"
                                    required
                                />
                            </div>
                         </div>

                         <div className="pt-6">
                            <button 
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                {isGeg ? `Paguaj $${totalPrice.toFixed(2)}` : `Pay $${totalPrice.toFixed(2)}`}
                            </button>
                         </div>
                      </form>
                  </div>
              )}

              {/* STEP: PAYPAL REDIRECT SIMULATION */}
              {checkoutStep === 'paypal' && (
                  <div className="p-8 flex-grow flex flex-col items-center justify-center text-center animate-fade-in">
                      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6">
                          <Package className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold dark:text-white mb-2">PayPal Redirection</h3>
                      <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                         You will be securely redirected to PayPal to complete your purchase of <strong>${totalPrice.toFixed(2)}</strong>.
                      </p>
                      
                      <button 
                        onClick={processPaypalPayment}
                        className="w-full py-4 bg-[#FFC439] text-[#2C2E2F] rounded-xl font-bold text-lg hover:bg-[#F2BA36] transition-colors flex items-center justify-center gap-2 shadow-lg"
                      >
                         Continue to PayPal
                      </button>
                  </div>
              )}

              {/* STEP: PROCESSING */}
              {checkoutStep === 'processing' && (
                  <div className="p-8 flex-grow flex flex-col items-center justify-center text-center animate-fade-in">
                      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
                      <h3 className="text-2xl font-serif font-bold dark:text-white mb-2">{isGeg ? 'Duke Procesue...' : 'Processing Payment...'}</h3>
                      <p className="text-gray-500 dark:text-gray-400">Please do not close the window.</p>
                  </div>
              )}

              {/* STEP: SUCCESS */}
              {checkoutStep === 'success' && (
                  <div className="p-8 flex-grow flex flex-col items-center justify-center text-center animate-fade-in">
                      <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-3xl font-serif font-bold dark:text-white mb-2">{isGeg ? 'Pagesa u Krye!' : 'Payment Success!'}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-8">{isGeg ? 'Porosia juej po përgatitet.' : 'Your order is being processed.'}</p>
                      <button onClick={closeCart} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold">
                          {isGeg ? 'Mbyll' : 'Back to Shop'}
                      </button>
                  </div>
              )}
           </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl mb-4 border border-emerald-100 dark:border-emerald-800 shadow-sm">
             <ShoppingBag className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">{isGeg ? 'Dyqani Gegenisht' : 'The Geg Shop'}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{isGeg ? 'Mbështetni projektin tuj blerë produkte unike.' : 'Support the project by buying unique products.'}</p>
      </div>

      <div className="flex flex-col gap-8">
          <div className="flex justify-center flex-wrap gap-3">
              {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id as any)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${activeCategory === cat.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                      {cat.label}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
              {isLoading ? (
                  <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500"/></div>
              ) : filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
                      <div className={`aspect-square rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden ${product.color || 'bg-indigo-50'}`}>
                          {renderProductIcon(product.imageIcon)}
                      </div>
                      <div className="flex-grow flex flex-col">
                          <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-white mb-2">{isGeg ? product.nameGeg : product.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">{product.description}</p>
                          <div className="mt-auto flex items-center justify-between">
                              <span className="text-2xl font-black text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                              <button onClick={() => handleAddToCartClick(product)} disabled={addingToCart === product.id} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">
                                  {addingToCart === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (isGeg ? 'Shto' : 'Add')}
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
