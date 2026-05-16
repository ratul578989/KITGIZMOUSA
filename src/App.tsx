/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  BarChart3, 
  AlertCircle, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownLeft,
  ArrowRight,
  TrendingUp,
  Zap,
  Shield,
  ShieldCheck,
  Menu,
  X,
  Plus,
  PlusCircle,
  Settings,
  LogOut,
  User,
  Bell,
  MessageSquare,
  Key,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Phone,
  Loader2,
  Headphones,
  Truck,
  Info,
  Package,
  Filter,
  Calendar,
  Trash2,
  Edit3,
  Save,
  Upload,
  QrCode,
  BellOff,
  Sparkles,
  Search,
  ChevronDown,
  CreditCard,
  TrendingDown,
  ShoppingBag,
  Clock,
  Send,
  Image,
  FileText,
  File,
  Globe,
  DollarSign,
  Target,
  Facebook,
  Instagram,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdCampaign {
  id: string;
  userId: string;
  userEmail: string;
  platform: 'TikTok' | 'Facebook' | 'Instagram';
  productLink: string;
  country: string;
  scope: 'Full Country' | 'Specific States' | 'Specific Cities';
  details?: string;
  dailyBudget: number;
  status: 'Pending' | 'Active' | 'Rejected' | 'Stopped';
  createdAt: any;
}
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  limit,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './lib/firebase';
import emailjs from 'emailjs-com';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = "service_8c49pg7"; 
const EMAILJS_TEMPLATE_ID = "template_0tu0jog"; 
const EMAILJS_PUBLIC_KEY = "pvne_3k67McqqlB7e"; 

// --- Types ---

interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  productImage: string;
  fileLink: string;
  createdAt: any;
  updatedAt: any;
}

interface ServiceOrder {
  id: string;
  userId: string;
  serviceName: string;
  price: number;
  status: 'Pending' | 'Fulfilled' | 'Cancelled' | 'Processing';
  orderNumber?: string;
  createdAt: any;
}

interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  method?: string;
  trxId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: any;
}

interface PayoutRequest {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  walletAddress: string;
  method: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: any;
}

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  totalBalance: number;
  status: 'Active' | 'Pending' | 'Restricted' | 'Suspended';
  ordersFulfilled: number;
  ordersPending: number;
  totalPayout: number;
  isAdmin: boolean;
  phoneNumber?: string;
  shopifyOrders?: number;
  dashboardWidgets?: string[];
}

interface PaymentMethod {
  id: string;
  methodName: string;
  paymentId: string;
  qrUrl?: string;
  instructions: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

interface SupportMessage {
  id: string;
  senderId: string;
  senderEmail: string;
  text: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: any;
}

interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  imageUrl?: string;
  status: 'open' | 'Solved' | 'Pending' | 'Pending Admin Review';
  createdAt: any;
  lastMessageAt?: any;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const isUserAdmin = (user: FirebaseUser | null) => {
  return user?.email === 'info.kitgizmo@gmail.com';
};

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    'Fulfilled': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Processing': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Active': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Cancelled': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Suspended': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'open': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Pending Admin Review': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    'Restricted': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Solved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Stopped': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  
  const currentStyle = styles[status as keyof typeof styles] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const isActive = status === 'Pending' || status === 'Processing' || status === 'Pending Admin Review' || status === 'open';
  
  return (
    <div className={`px-2.5 py-1 rounded-lg border ${currentStyle} flex items-center gap-1.5`}>
      <div className="relative flex items-center justify-center">
        {isActive && (
          <span className={`absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping ${currentStyle.split(' ')[1].replace('text-', 'bg-')}`} />
        )}
        <div className={`w-1 h-1 rounded-full relative z-10 ${currentStyle.split(' ')[1].replace('text-', 'bg-')}`} />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.1em]">{status}</span>
    </div>
  );
};

interface StatCardProps {
  key?: string | number;
  title: string;
  value: string;
  icon: any;
  color: string;
  subtitle?: string;
  isEdit?: boolean;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle,
  isEdit,
  onRemove,
  onMoveUp,
  onMoveDown
}: StatCardProps) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all cursor-default h-full"
  >
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
      <Icon className="w-24 h-24" />
    </div>

    {isEdit && (
      <div className="absolute top-4 right-4 flex gap-2 z-30">
        <div className="flex flex-col gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-white hover:border-emerald-500/50 transition-all">
              <ArrowUpCircle className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-white hover:border-emerald-500/50 transition-all">
              <ArrowDownCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={onRemove}
          className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all self-start"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}

    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 border border-current border-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {subtitle && !isEdit && (
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
           <div className={`w-1 h-1 rounded-full ${color}`} />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{subtitle}</span>
        </div>
      )}
    </div>
    <div className={`space-y-1 relative z-10 ${isEdit ? 'pr-12' : ''}`}>
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-3xl font-black text-white tracking-tighter font-display group-hover:text-emerald-400 transition-colors uppercase">{value}</p>
    </div>
  </motion.div>
);

const ComparisonCard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-12">
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-24 h-24 text-slate-400" />
      </div>
      <h4 className="text-slate-400 font-semibold mb-2">Normal Ads</h4>
      <div className="text-5xl font-black text-slate-500 mb-4">35%</div>
      <p className="text-slate-500 text-sm">Average industry success rate for standard Shopify ad campaigns.</p>
    </motion.div>

    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-emerald-500/5 border border-emerald-500/30 p-8 rounded-3xl relative overflow-hidden group shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap className="w-24 h-24 text-emerald-400" />
      </div>
      <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest mb-4">
        AI Enhanced
      </div>
      <h4 className="text-emerald-400 font-semibold mb-2">KIT GIZMO AI Ads</h4>
      <div className="text-5xl font-black text-emerald-400 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">95%</div>
      <p className="text-emerald-400/70 text-sm font-medium">Breakthrough performance fueled by predictive analytics and real-time optimization.</p>
    </motion.div>
  </div>
);

const ServicesView = ({ user, totalBalance }: { user: FirebaseUser | null, totalBalance: number }) => {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [purchasedLink, setPurchasedLink] = useState<{title: string, link: string} | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalProduct)));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'products');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleBuy = async (product: DigitalProduct) => {
    if (!user) return;
    
    setPurchasing(product.id);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) {
          throw new Error("User profile not found.");
        }
        
        const userData = userSnap.data();
        const currentBalance = userData.totalBalance || 0;
        if (currentBalance < product.price) {
          throw new Error("Insufficient balance. Please deposit funds first.");
        }
        
        // 1. Deduct balance
        transaction.update(userRef, {
          totalBalance: currentBalance - product.price,
          updatedAt: serverTimestamp()
        });
        
        // 2. Create order/transaction record
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, {
          userId: user.uid,
          userEmail: user.email,
          serviceName: `Purchase: ${product.title}`,
          price: product.price,
          status: 'Fulfilled',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      setPurchasedLink({ title: product.title, link: product.fileLink });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-12">
      {purchasedLink && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500 border border-emerald-400 p-8 rounded-[32px] text-slate-950 shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Purchase Successful!</h3>
              <p className="font-bold text-slate-900/70 uppercase tracking-widest text-xs mt-1">Access link for: {purchasedLink.title}</p>
            </div>
            <div className="flex gap-4">
              <a 
                href={purchasedLink.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:bg-slate-900 transition-all shadow-xl"
              >
                <ArrowUpRight className="w-4 h-4" />
                Download Content
              </a>
              <button 
                onClick={() => setPurchasedLink(null)}
                className="bg-emerald-600 text-emerald-100 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
          <Package className="w-8 h-8 text-emerald-500" />
          Digital Products
        </h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hidden md:block">Instant delivery upon purchase</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 opacity-20" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[48px] p-24 text-center">
           <ShoppingBag className="w-16 h-16 text-slate-800 mx-auto mb-6" />
           <p className="text-xl font-bold text-slate-500">The store is currently empty.</p>
           <p className="text-slate-600 text-sm mt-2">Admin is preparing new digital assets. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <motion.div 
              key={p.id}
              whileHover={{ y: -8 }}
              className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl flex flex-col"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                {p.productImage ? (
                  <img src={p.productImage} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Package className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/50">
                  <span className="text-lg font-black text-emerald-400 font-mono tracking-tighter">${p.price}</span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xl font-black text-white leading-tight group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{p.title}</h4>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed font-medium">{p.description}</p>
                </div>
                <button 
                  onClick={() => handleBuy(p)}
                  disabled={purchasing === p.id}
                  className="mt-8 w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-slate-950"
                >
                  {purchasing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <Plus className="w-4 h-4" />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPanelView = ({ 
  user,
  onForceStop,
  onForceStart,
  onDeleteCampaign
}: { 
  user: FirebaseUser | null,
  onForceStop: (id: string) => Promise<void>,
  onForceStart: (id: string) => Promise<void>,
  onDeleteCampaign: (id: string) => Promise<void>
}) => {
  if (user?.email !== 'info.kitgizmo@gmail.com') return null;

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trc20Address, setTrc20Address] = useState('');
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);
  const [showApprovalAnim, setShowApprovalAnim] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [methodLoading, setMethodLoading] = useState(false);
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [allCampaigns, setAllCampaigns] = useState<AdCampaign[]>([]);
  const [viewingUserCampaigns, setViewingUserCampaigns] = useState<UserProfile | null>(null);
  const [adminTab, setAdminTab] = useState<'transactions' | 'users' | 'settings' | 'products' | 'tickets'>('transactions');
  const [newProduct, setNewProduct] = useState<Partial<DigitalProduct>>({
    title: '',
    description: '',
    price: 0,
    productImage: '',
    fileLink: ''
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod>>({
    methodName: '',
    paymentId: '',
    instructions: '',
    qrUrl: '',
    status: 'active'
  });
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);

  useEffect(() => {
    const isAdmin = isUserAdmin(user); // Check email strictly
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }
    
    // Listen to users
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (err) => {
      console.error("Users list failed", err);
      handleFirestoreError(err, OperationType.LIST, 'users');
    });

    // Listen to deposits
    const depositsUnsubscribe = onSnapshot(collection(db, 'deposits'), (snapshot) => {
      setDeposits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositRequest)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'deposits');
    });

    // Listen to all orders
    const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    // Listen to payouts
    const payoutsUnsubscribe = onSnapshot(collection(db, 'payouts'), (snapshot) => {
      setPayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payouts');
    });

    // Listen to settings
    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setTrc20Address(docSnap.data().trc20Address || '');
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });

    // Listen to payment methods
    const paymentUnsubscribe = onSnapshot(collection(db, 'payment_methods'), (snapshot) => {
      setPaymentMethods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentMethod)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payment_methods');
    });

    // Listen to products
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigitalProduct)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'products');
    });

    // Listen to support tickets
    const ticketsUnsubscribe = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'support_tickets');
    });

    // Listen to all ad campaigns
    const campaignsUnsubscribe = onSnapshot(collection(db, 'ad_campaigns'), (snapshot) => {
      setAllCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'ad_campaigns');
    });

    setLoading(false);
    return () => {
      usersUnsubscribe();
      depositsUnsubscribe();
      ordersUnsubscribe();
      payoutsUnsubscribe();
      settingsUnsubscribe();
      paymentUnsubscribe();
      productsUnsubscribe();
      ticketsUnsubscribe();
      campaignsUnsubscribe();
    };
  }, [user]);

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.methodName || !newMethod.paymentId) {
      alert("Name and Payment ID are required.");
      return;
    }
    setMethodLoading(true);
    try {
      if (editingMethodId) {
        await updateDoc(doc(db, 'payment_methods', editingMethodId), {
          ...newMethod,
          updatedAt: serverTimestamp()
        });
        setEditingMethodId(null);
      } else {
        await addDoc(collection(db, 'payment_methods'), {
          ...newMethod,
          status: 'active',
          createdAt: serverTimestamp()
        });
      }
      setNewMethod({ methodName: '', paymentId: '', instructions: '', qrUrl: '', status: 'active' });
      alert("Payment method published successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'payment_methods');
    } finally {
      setMethodLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("Image too large. Please select an image under 800KB.");
        return;
      }
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadstart = () => setIsUploadingImage(true);
      reader.onloadend = () => {
        setter(reader.result as string);
        setIsUploadingImage(false);
      };
      reader.onerror = () => {
        setIsUploadingImage(false);
        alert("Failed to read image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || (!newProduct.productImage && !editingProductId)) {
      alert("Title, Price, and Product Image are required.");
      return;
    }
    setProductLoading(true);
    try {
      const productData = {
        title: newProduct.title,
        description: newProduct.description || '',
        price: Number(newProduct.price),
        productImage: newProduct.productImage || '',
        fileLink: newProduct.fileLink || '#', 
        updatedAt: serverTimestamp()
      };

      if (editingProductId) {
        await updateDoc(doc(db, 'products', editingProductId), productData);
        setEditingProductId(null);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }
      setNewProduct({ title: '', description: '', price: 0, imageUrl: '', fileLink: '' });
      alert("Product published successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    } finally {
      setProductLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("CRITICAL: Are you sure you want to PERMANENTLY DELETE this product? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this payment method?")) return;
    try {
      await deleteDoc(doc(db, 'payment_methods', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `payment_methods/${id}`);
    }
  };

  const handleUpdateSettings = async () => {
    setSaveSettingsLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), { trc20Address }, { merge: true });
      alert("System settings updated!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/global');
    } finally {
      setSaveSettingsLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        totalBalance: Number(editingUser.totalBalance),
        status: editingUser.status,
        ordersFulfilled: Number(editingUser.ordersFulfilled),
        ordersPending: Number(editingUser.ordersPending),
        totalPayout: Number(editingUser.totalPayout),
        shopifyOrders: Number(editingUser.shopifyOrders || 0),
        updatedAt: serverTimestamp()
      });
      setEditingUser(null);
      alert("User updated!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${editingUser.uid}`);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: 'Solved') => {
    try {
      await updateDoc(doc(db, 'support_tickets', id), { status });
      alert(`Ticket marked as ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `support_tickets/${id}`);
    }
  };

  const adjustBalance = (amount: number) => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, totalBalance: Number((editingUser.totalBalance + amount).toFixed(2)) });
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDepositAction = async (id: string, userId: string, userEmail: string, amount: number, status: 'Approved' | 'Rejected') => {
    try {
      await runTransaction(db, async (transaction) => {
        const depositRef = doc(db, 'deposits', id);
        const userRef = doc(db, 'users', userId);
        
        const userDoc = await transaction.get(userRef);
        
        let currentBalance = 0;
        if (!userDoc.exists()) {
          // Auto-repair missing profile
          transaction.set(userRef, {
            fullName: userEmail.split('@')[0],
            email: userEmail,
            totalBalance: 0,
            totalPayout: 0,
            ordersFulfilled: 0,
            ordersPending: 0,
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          currentBalance = 0;
        } else {
          currentBalance = userDoc.data().totalBalance || 0;
        }

        // 1. Update deposit status
        transaction.update(depositRef, { status, updatedAt: serverTimestamp() });
        
        // 2. If approved, add to user balance
        if (status === 'Approved') {
          transaction.update(userRef, { 
            totalBalance: currentBalance + amount,
            updatedAt: serverTimestamp()
          });
        }
      });

      if (status === 'Approved') {
        setShowApprovalAnim(true);
        setTimeout(() => setShowApprovalAnim(false), 3000);
      }
      alert(`Deposit ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `deposits/${id}`);
    }
  };

  const handlePayoutAction = async (id: string, userId: string, userEmail: string, amount: number, status: 'Approved' | 'Rejected') => {
    try {
      await runTransaction(db, async (transaction) => {
        const payoutRef = doc(db, 'payouts', id);
        const userRef = doc(db, 'users', userId);
        
        const userDoc = await transaction.get(userRef);
        
        let currentBalance = 0;
        let currentTotalPayout = 0;
        
        if (!userDoc.exists()) {
          transaction.set(userRef, {
            fullName: userEmail.split('@')[0],
            email: userEmail,
            totalBalance: 0,
            totalPayout: 0,
            ordersFulfilled: 0,
            ordersPending: 0,
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          currentBalance = userDoc.data().totalBalance || 0;
          currentTotalPayout = userDoc.data().totalPayout || 0;
        }

        // 1. Update payout status
        transaction.update(payoutRef, { status, updatedAt: serverTimestamp() });
        
        // 2. Logic based on status
        if (status === 'Approved') {
          // Balance was already deducted on request. Just update totalPayout.
          transaction.update(userRef, { 
            totalPayout: currentTotalPayout + amount,
            updatedAt: serverTimestamp()
          });
        } else if (status === 'Rejected') {
          // Refund the balance since it was deducted on request
          transaction.update(userRef, { 
            totalBalance: currentBalance + amount,
            updatedAt: serverTimestamp()
          });
        }
      });
      alert(`Payout ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `payouts/${id}`);
    }
  };

  const handleOrderAction = async (orderId: string, userId: string, userEmail: string, price: number, status: 'Fulfilled' | 'Cancelled' | 'Processing') => {
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, 'orders', orderId);
        const userRef = doc(db, 'users', userId);
        
        const userDoc = await transaction.get(userRef);
        
        let currentBalance = 0;
        let currentFulfilled = 0;
        let currentPending = 0;

        if (!userDoc.exists()) {
          transaction.set(userRef, {
            fullName: userEmail.split('@')[0],
            email: userEmail,
            totalBalance: 0,
            totalPayout: 0,
            ordersFulfilled: 0,
            ordersPending: 0,
            status: 'Active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          const userData = userDoc.data();
          currentBalance = userData.totalBalance || 0;
          currentFulfilled = userData.ordersFulfilled || 0;
          currentPending = userData.ordersPending || 0;
        }

        // 1. Update order status
        transaction.update(orderRef, { status, updatedAt: serverTimestamp() });

        // 2. Handle status-specific logic
        if (status === 'Fulfilled') {
          transaction.update(userRef, {
            ordersFulfilled: currentFulfilled + 1,
            ordersPending: Math.max(0, currentPending - 1),
            updatedAt: serverTimestamp()
          });
        } else if (status === 'Cancelled') {
          transaction.update(userRef, {
            totalBalance: currentBalance + price,
            ordersPending: Math.max(0, currentPending - 1),
            updatedAt: serverTimestamp()
          });
        }
      });
      alert(`Order marked as ${status}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  
  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
        >
          <ArrowDownLeft className="w-4 h-4 rotate-45" />
          Back to Tickets List
        </button>
        <SupportChat 
          ticket={selectedTicket} 
          user={user} 
          isAdminView={true} 
          onBack={() => setSelectedTicket(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Admin Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button 
          onClick={() => setAdminTab('transactions')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'transactions' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Transactions
        </button>
        <button 
          onClick={() => setAdminTab('users')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Users List
        </button>
        <button 
          onClick={() => setAdminTab('products')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'products' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Manage Products
        </button>
        <button 
          onClick={() => setAdminTab('settings')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'settings' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Infrastructure
        </button>
        <button 
          onClick={() => setAdminTab('tickets')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'tickets' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
        >
          Support Tickets
        </button>
      </div>

      {adminTab === 'settings' && (
        <div className="space-y-6">
        <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-500" />
          Manage Payment Methods
        </h3>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl h-fit">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-l-4 border-emerald-500 pl-4">
              {editingMethodId ? 'Update Method' : 'Create New Method'}
            </h4>
            <form onSubmit={handleSavePaymentMethod} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Method Name</label>
                <input 
                  type="text" 
                  value={newMethod.methodName}
                  onChange={e => setNewMethod({ ...newMethod, methodName: e.target.value })}
                  placeholder="e.g., USDT (TRC20)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment ID / Address</label>
                <input 
                  type="text" 
                  value={newMethod.paymentId}
                  onChange={e => setNewMethod({ ...newMethod, paymentId: e.target.value })}
                  placeholder="Wallet address or ID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">QR Code URL (Optional)</label>
                <input 
                  type="text" 
                  value={newMethod.qrUrl}
                  onChange={e => setNewMethod({ ...newMethod, qrUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instructions</label>
                <textarea 
                  value={newMethod.instructions}
                  onChange={e => setNewMethod({ ...newMethod, instructions: e.target.value })}
                  placeholder="Send only TRC20, include TRXID..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  {methodLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingMethodId ? 'Update' : 'Publish'}
                </button>
                {editingMethodId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingMethodId(null);
                      setNewMethod({ name: '', address: '', instructions: '', qrUrl: '' });
                    }}
                    className="px-4 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Methods List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {paymentMethods.map(m => (
                <div key={m.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] group relative hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Globe className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingMethodId(m.id);
                          setNewMethod(m);
                        }}
                        className="p-2 bg-slate-950 text-slate-500 hover:text-white rounded-lg transition-colors shadow-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeletePaymentMethod(m.id)}
                        className="p-2 bg-slate-950 text-slate-500 hover:text-rose-500 rounded-lg transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-white font-black uppercase tracking-tight text-lg">{m.methodName}</h5>
                    <p className="text-slate-500 text-[10px] font-mono break-all">{m.paymentId}</p>
                  </div>
                  {m.instructions && (
                    <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-400 line-clamp-2">
                      {m.instructions}
                    </div>
                  )}
                </div>
              ))}
              {paymentMethods.length === 0 && (
                <div className="sm:col-span-2 bg-slate-900/50 border border-dashed border-slate-800 rounded-[32px] p-12 text-center">
                   <QrCode className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No infrastructure configured</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {adminTab === 'products' && (
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <Package className="w-6 h-6 text-emerald-500" />
          Manage Digital Products
        </h3>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add/Edit Product Form */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl h-fit">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-l-4 border-emerald-500 pl-4">
              {editingProductId ? 'Update Product' : 'Create New Product'}
            </h4>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Title</label>
                <input 
                  type="text" 
                  value={newProduct.title}
                  onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g., Ultimate Dropshipping Guide"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price (USD)</label>
                <input 
                  type="number" 
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  placeholder="Price..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 transition-all min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Upload Product Image</label>
                <div className="relative group/upload">
                  <input 
                    type="file" 
                    id="product-image"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (val) => setNewProduct({ ...newProduct, productImage: val }))}
                    className="hidden"
                  />
                  <div 
                    className={`w-full h-40 bg-slate-950 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${newProduct.productImage ? 'border-emerald-500/50' : 'border-slate-800 hover:border-emerald-500'}`}
                  >
                    {newProduct.productImage ? (
                      <>
                        <img src={newProduct.productImage} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <label htmlFor="product-image" className="p-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all">
                              <RefreshCcw className="w-5 h-5 text-white" />
                           </label>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setNewProduct({ ...newProduct, productImage: '' });
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all z-20 shadow-lg"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <label htmlFor="product-image" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        {isUploadingImage ? (
                          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-600 mb-2 group-hover/upload:text-emerald-500 transition-colors" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/upload:text-emerald-500 transition-colors">Select Image Asset</span>
                            <span className="text-[8px] text-slate-700 mt-1 uppercase font-bold tracking-tighter">JPG, PNG under 800KB</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isUploadingImage || productLoading}
                  className={`flex-1 ${isUploadingImage || productLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg'} py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2`}
                >
                  {(productLoading || isUploadingImage) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUploadingImage ? 'Processing...' : (editingProductId ? 'Update' : 'Publish')}
                </button>
                {editingProductId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingProductId(null);
                      setNewProduct({ title: '', description: '', price: 0, productImage: '', fileLink: '' });
                    }}
                    className="px-4 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] group relative hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                      {p.productImage ? (
                        <img src={p.productImage} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProductId(p.id);
                          setNewProduct(p);
                        }}
                        className="p-2 bg-slate-950 text-slate-500 hover:text-white rounded-lg transition-colors shadow-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 bg-slate-950 text-slate-500 hover:text-rose-500 rounded-lg transition-colors shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-white font-black uppercase tracking-tight text-md line-clamp-1">{p.title}</h5>
                    <p className="text-emerald-500 font-black tracking-tight">${p.price}</p>
                    <p className="text-slate-500 text-[10px] line-clamp-2">{p.description}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-[9px] text-slate-600 font-mono break-all line-clamp-1">{p.fileLink}</p>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="sm:col-span-2 bg-slate-900/50 border border-dashed border-slate-800 rounded-[32px] p-12 text-center">
                   <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No products in database</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    {adminTab === 'transactions' && (
        <>
          {/* Pending Orders Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Service Orders Management</h3>
              <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20">
                {orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length} PENDING
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Service / User</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {orders.filter(o => o.status !== 'Fulfilled' && o.status !== 'Cancelled').sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(o => {
                    const userObj = users.find(u => u.uid === o.userId);
                    return (
                      <tr key={o.id} className="hover:bg-slate-800/20">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{o.serviceName}</p>
                          <p className="text-[10px] text-slate-500">{userObj?.fullName || 'Unknown User'} ({userObj?.email})</p>
                        </td>
                        <td className="px-6 py-4 text-white font-black">${o.price}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleOrderAction(o.id, o.userId, userObj?.email || o.userEmail || 'unknown@user.com', o.price, 'Processing')}
                            className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 rounded hover:bg-amber-500/20 uppercase"
                          >
                            Process
                          </button>
                          <button 
                            onClick={() => handleOrderAction(o.id, o.userId, userObj?.email || o.userEmail || 'unknown@user.com', o.price, 'Fulfilled')}
                            className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded hover:bg-emerald-500/20 uppercase"
                          >
                            Fulfill
                          </button>
                          <button 
                            onClick={() => handleOrderAction(o.id, o.userId, userObj?.email || o.userEmail || 'unknown@user.com', o.price, 'Cancelled')}
                            className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded hover:bg-red-500/20 uppercase"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.filter(o => o.status !== 'Fulfilled' && o.status !== 'Cancelled').length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm italic">All orders processed.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Deposit Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                Deposit Requests
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">User</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Value</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {deposits.filter(d => d.status === 'Pending').map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/10">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{d.userEmail}</p>
                          <p className="text-[9px] text-slate-600 font-mono uppercase">{d.method || 'Manual'}</p>
                        </td>
                        <td className="px-6 py-4 text-emerald-400 font-black">${d.amount}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleDepositAction(d.id, d.userId, d.userEmail, d.amount, 'Approved')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDepositAction(d.id, d.userId, d.userEmail, d.amount, 'Rejected')} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {deposits.filter(d => d.status === 'Pending').length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-xs italic">No pending deposits.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payout Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-amber-500" />
                Payout Requests
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">User</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Value</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {payouts.filter(p => p.status === 'Pending').map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/10">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{p.userEmail}</p>
                          <p className="text-[9px] text-slate-600 font-mono uppercase">{p.method}</p>
                        </td>
                        <td className="px-6 py-4 text-rose-400 font-black">${p.amount}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handlePayoutAction(p.id, p.userId, p.userEmail, p.amount, 'Approved')} className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded hover:bg-emerald-500/20 transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => handlePayoutAction(p.id, p.userId, p.userEmail, p.amount, 'Rejected')} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                    {payouts.filter(p => p.status === 'Pending').length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-xs italic">No pending payouts.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {adminTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Scale Database: User Profiles</h3>
            <div className="relative group min-w-[300px]">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                type="text" 
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white text-[10px] focus:border-emerald-500/50 outline-none transition-all shadow-xl font-bold uppercase tracking-widest"
               />
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Balance</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Ads</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Payouts / Orders</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.map(u => {
                  const userCampaignCount = allCampaigns.filter(c => c.userId === u.uid).length;
                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white">{u.fullName}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                        <div className="mt-1"><StatusBadge status={u.status} /></div>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-black">${u.totalBalance?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingUserCampaigns(u)}
                          className="flex items-center gap-2 group cursor-pointer"
                        >
                          <div className={`p-2 rounded-lg ${userCampaignCount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>
                            <Zap className="w-3 h-3" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${userCampaignCount > 0 ? 'text-white border-b border-white/20' : 'text-slate-600'}`}>
                            Campaigns: {userCampaignCount}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-white font-mono text-xs">
                        <div className="flex flex-col">
                          <span className="text-amber-400">${u.totalPayout?.toFixed(2) || '0.00'} Payout</span>
                          <span className="text-slate-500 mt-1 uppercase text-[9px] font-black tracking-widest">
                            <span className="text-blue-400">{u.ordersPending || 0}</span> / <span className="text-purple-400">{u.ordersFulfilled || 0}</span> (P/F)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setEditingUser(u)}
                          className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-emerald-500/20 transition-all font-mono"
                        >
                          EDIT
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-xs">No users found matching "{searchQuery}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Support Management</h3>
            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
              {tickets.filter(t => (t.status === 'open' || t.status === 'Pending')).length} Pending Requests
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="divide-y divide-slate-800">
              {tickets.sort((a,b) => b.createdAt?.seconds - a.createdAt?.seconds).map(ticket => (
                <div key={ticket.id} className="p-8 hover:bg-slate-800/10 transition-all group">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{ticket.subject}</h4>
                            <StatusBadge status={ticket.status} />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                            <span>{ticket.userEmail}</span>
                            <span>•</span>
                            <span>{ticket.createdAt?.toDate() ? ticket.createdAt.toDate().toLocaleString() : 'Pending'}</span>
                            <span>•</span>
                            <span>#{ticket.id.substring(0, 8)}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {ticket.status !== 'Solved' && (
                            <>
                              <button 
                                onClick={() => setSelectedTicket(ticket)}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                Reply / View Chat
                              </button>
                              <button 
                                onClick={() => handleUpdateTicketStatus(ticket.id, 'Solved')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark as Solved
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-950/50 border border-slate-800/50 p-6 rounded-2xl">
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {ticket.message}
                        </p>
                      </div>
                    </div>

                    {ticket.imageUrl && (
                      <div className="lg:w-80 shrink-0">
                        <div className="space-y-2 mb-2">
                           <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                             <Image className="w-3 h-3" />
                             Evidence Uploaded
                           </label>
                        </div>
                        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative group/img cursor-zoom-in">
                          <img 
                            src={ticket.imageUrl} 
                            alt="Evidence" 
                            className="w-full aspect-video lg:aspect-auto object-cover hover:scale-105 transition-transform duration-500"
                            onClick={() => window.open(ticket.imageUrl, '_blank')}
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                             <span className="text-[9px] font-black text-white uppercase tracking-widest bg-emerald-500 px-3 py-1.5 rounded-full scale-90 group-hover/img:scale-100 transition-all">View Full Size</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-20 text-center">
                  <Headphones className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                  <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No support requests reported in the node.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Campaign Detail Modal */}
      <AnimatePresence>
        {viewingUserCampaigns && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingUserCampaigns(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Zap className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Campaign Portfolio</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{viewingUserCampaigns.fullName} ({viewingUserCampaigns.email})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingUserCampaigns(null)}
                  className="p-3 hover:bg-slate-800 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allCampaigns.filter(c => c.userId === viewingUserCampaigns.uid).map(c => (
                    <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-xl ${
                            c.platform === 'TikTok' ? 'bg-rose-500/10 text-rose-400' : 
                            c.platform === 'Facebook' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'
                          }`}>
                            {c.platform === 'TikTok' ? <Zap className="w-4 h-4" /> : c.platform === 'Facebook' ? <Facebook className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{c.platform} ADS</p>
                          <p className="text-white font-bold text-xs truncate break-all">{c.productLink}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Daily Budget</p>
                             <p className="text-xs font-black text-emerald-400">${c.dailyBudget}</p>
                          </div>
                          <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Targeting</p>
                             <p className="text-xs font-black text-white truncate">{c.country}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          {c.status !== 'Active' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onForceStart(c.id);
                              }}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              FORCE START
                            </button>
                          )}
                          {c.status !== 'Stopped' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onForceStop(c.id);
                              }}
                              className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              FORCE STOP
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCampaign(c.id);
                          }}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700/50 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          DELETE CAMPAIGN
                        </button>
                      </div>
                    </div>
                  ))}
                  {allCampaigns.filter(c => c.userId === viewingUserCampaigns.uid).length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-950/50 rounded-[32px] border border-dashed border-slate-800">
                      <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No research found for this user</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] w-full max-w-md relative z-10 shadow-[0_0_100px_-20px_rgba(16,185,129,0.2)]">
            <h4 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <RefreshCcw className="w-5 h-5 text-emerald-400" />
              Overriding System Assets
            </h4>
            <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 font-black">
                 {editingUser.fullName.charAt(0)}
               </div>
               <div>
                  <p className="text-white font-bold text-sm tracking-tight">{editingUser.fullName}</p>
                  <p className="text-slate-500 text-[10px] font-medium">{editingUser.email}</p>
               </div>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Wallet Balance ($)</label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => adjustBalance(100)} className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-500/20 transition-all">+ $100</button>
                  <button type="button" onClick={() => adjustBalance(-100)} className="flex-1 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[9px] font-black uppercase hover:bg-rose-500/20 transition-all">- $100</button>
                </div>
                <input 
                  type="number" 
                  value={editingUser.totalBalance}
                  onChange={e => setEditingUser({ ...editingUser, totalBalance: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all font-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Payout ($)</label>
                  <input 
                    type="number" 
                    value={editingUser.totalPayout || 0}
                    onChange={e => setEditingUser({ ...editingUser, totalPayout: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all font-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Account Status</label>
                  <select 
                    value={editingUser.status}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Orders Processing</label>
                  <input 
                    type="number" 
                    value={editingUser.ordersPending || 0}
                    onChange={e => setEditingUser({ ...editingUser, ordersPending: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Orders Fulfilled</label>
                  <input 
                    type="number" 
                    value={editingUser.ordersFulfilled}
                    onChange={e => setEditingUser({ ...editingUser, ordersFulfilled: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Shopify Orders (Manual Sync)</label>
                <div className="relative">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input 
                    type="number" 
                    value={editingUser.shopifyOrders || 0}
                    onChange={e => setEditingUser({ ...editingUser, shopifyOrders: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all font-black"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-750 transition-all">Discard</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-lg">Commit Override</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showApprovalAnim && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-slate-900 border border-emerald-500/50 p-12 rounded-[48px] text-center space-y-6 shadow-[0_0_100px_-20px_rgba(16,185,129,0.4)]"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="w-12 h-12 text-slate-950" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Deposit Approved</h3>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Funds have been liquidated to user wallet</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const TransactionHistoryView = ({ user }: { user: FirebaseUser | null }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!user || !user.uid) return;
    
    const depositsQuery = query(collection(db, 'deposits'), where('userId', '==', user.uid));
    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const payoutsQuery = query(collection(db, 'payouts'), where('userId', '==', user.uid));

    const unsubDeposits = onSnapshot(depositsQuery, (snapshot) => {
      const deposits = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'Deposit',
        amount: doc.data().amount,
        name: 'Manual Balance Top-up'
      }));
      updateActivities(deposits, 'deposits');
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'deposits');
    });

    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'Purchase',
        amount: -doc.data().price,
        name: doc.data().serviceName
      }));
      updateActivities(orders, 'orders');
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    const unsubPayouts = onSnapshot(payoutsQuery, (snapshot) => {
      const payouts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'Payout',
        amount: -doc.data().amount,
        name: 'Withdrawal (Crypto TRC20)'
      }));
      updateActivities(payouts, 'payouts');
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payouts');
    });

    const updateActivities = (newItems: any[], source: string) => {
      setActivities(prev => {
        const filtered = prev.filter(a => {
          if (source === 'deposits') return a.type !== 'Deposit';
          if (source === 'orders') return a.type !== 'Purchase';
          if (source === 'payouts') return a.type !== 'Payout';
          return true;
        });
        const combined = [...filtered, ...newItems].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        return combined;
      });
      setLoading(false);
    };

    return () => {
      unsubDeposits();
      unsubOrders();
      unsubPayouts();
    };
  }, [user]);

  const filteredActivities = activities.filter(a => {
    // Type Filter
    if (filterType !== 'all' && a.type !== filterType) return false;

    // Date Filter
    if (!a.createdAt) return true;
    const actDate = new Date(a.createdAt.seconds * 1000);
    actDate.setHours(0, 0, 0, 0);

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (actDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (actDate > end) return false;
    }

    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">Recent activities</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Total {activities.length} transactions recorded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-300 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-800"
            >
              <option value="all">All Types</option>
              <option value="Deposit">Deposits</option>
              <option value="Purchase">Purchases</option>
              <option value="Payout">Payouts</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-300 outline-none uppercase tracking-tighter w-24 cursor-pointer"
              />
              <span className="text-slate-600 font-bold text-[10px]">TO</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-300 outline-none uppercase tracking-tighter w-24 cursor-pointer"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="ml-2 hover:text-rose-400 text-slate-600 transition-colors"
                title="Clear date range"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/30 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity / ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredActivities.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-white uppercase group-hover:text-emerald-400 transition-colors">{a.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tighter mt-0.5">{a.id}</p>
                </td>
                <td className={`px-6 py-4 font-black ${a.amount > 0 ? 'text-emerald-500' : 'text-rose-500 text-opacity-80'}`}>
                  {a.amount > 0 ? '+' : ''}{a.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-[11px] font-medium text-slate-400">
                  {a.createdAt ? new Date(a.createdAt.seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Processing...'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-block scale-[0.85] origin-right">
                    <StatusBadge status={a.status} />
                  </div>
                </td>
              </tr>
            ))}
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                      <History className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No transactions matching your criteria.</p>
                  {(filterType !== 'all' || startDate || endDate) && (
                    <button 
                      onClick={() => { setFilterType('all'); setStartDate(''); setEndDate(''); }}
                      className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PayoutView = ({ user, totalBalance }: { user: FirebaseUser | null, totalBalance: number }) => {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !walletAddress) return;
    const numAmount = Number(amount);
    
    if (numAmount < 300) {
      alert("Minimum withdrawal is $300.");
      return;
    }

    if (numAmount > totalBalance) {
      alert("Insufficient balance for withdrawal.");
      return;
    }

    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) {
          throw new Error("User profile not found.");
        }
        
        const currentBalance = userSnap.data().totalBalance || 0;
        if (currentBalance < numAmount) {
          throw new Error("Insufficient balance for withdrawal.");
        }
        
        // 1. Create payout request
        const newPayoutRef = doc(collection(db, 'payouts'));
        transaction.set(newPayoutRef, {
          userId: user.uid,
          userEmail: user.email,
          amount: numAmount,
          walletAddress,
          method: 'Crypto (USDT-TRC20)',
          status: 'Pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // 2. Deduct balance immediately
        transaction.update(userRef, {
          totalBalance: currentBalance - numAmount,
          updatedAt: serverTimestamp()
        });
      });

      alert("Payout request submitted! Your balance has been adjusted. Admin will process the transfer shortly.");
      setAmount('');
      setWalletAddress('');
    } catch (err: any) {
      if (err.message.includes("Insufficient balance")) {
        alert(err.message);
      } else {
        handleFirestoreError(err, OperationType.CREATE, 'payouts');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 py-12">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-white uppercase tracking-tight">Request Payout</h3>
        <p className="text-slate-500 text-sm font-medium">Withdraw your earned balance to your USDT (TRC20) wallet. Payouts are processed manually within 24-48 hours.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6 shadow-2xl">
        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex justify-between items-center">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Balance</span>
           <span className="text-xl font-black text-emerald-400">${totalBalance.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Withdrawal Amount ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="MIN $300.00"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-10 py-4 text-white focus:border-emerald-500 outline-none transition-all font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">USDT (TRC20) Wallet Address</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
              <input 
                type="text" 
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Paste your TRC20 address..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-10 py-4 text-white focus:border-emerald-500 outline-none transition-all font-mono text-xs"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
           <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest text-center">Important: Ensure your TRC20 address is correct. Crypto transfers are irreversible.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-100 hover:bg-white text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Withdrawal'}
        </button>
      </form>
    </div>
  );
};

const DepositRequestView = ({ user }: { user: FirebaseUser | null }) => {
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'payment_methods'), (snapshot) => {
      const methods = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PaymentMethod))
        .filter(m => m.status === 'active');
      setPaymentMethods(methods);
      if (methods.length > 0 && !selectedMethod) {
        setSelectedMethod(methods[0]);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payment_methods');
    });
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !trxId || !selectedMethod) {
      alert("Please complete all steps.");
      return;
    }
    if (Number(amount) < 50) {
      alert("Minimum deposit is $50.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'deposits'), {
        userId: user.uid,
        userEmail: user.email,
        amount: Number(amount),
        trxId,
        method: selectedMethod.methodName,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setVerifying(true);
      setAmount('');
      setTrxId('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'deposits');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto py-32 text-center"
      >
        <div className="relative mb-12">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }} 
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-32 h-32 border-2 border-dashed border-emerald-500/30 rounded-full mx-auto"
          />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-10 h-10 text-slate-950" />
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-6">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black text-white uppercase tracking-tighter"
          >
            Verifying <span className="text-emerald-500">Transaction</span>...
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-sm font-medium italic leading-relaxed px-8"
          >
            Your balance will be updated within <span className="text-white font-bold">15-30 minutes</span> after manual verification.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12"
        >
          <button 
            onClick={() => setVerifying(false)}
            className="px-8 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:border-slate-700"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Increase your capital</h3>
        <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto italic">Scale your ad campaigns and synchronize bulk Shopify orders by maintaining a healthy wallet balance.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-8 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Enter Deposit Amount ($)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="MIN $50.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-5 text-white focus:border-emerald-500 outline-none transition-all font-black text-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Select Payment Method</label>
              <div className="grid grid-cols-1 gap-2">
                {paymentMethods.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedMethod?.id === m.id ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${selectedMethod?.id === m.id ? 'bg-emerald-500/20' : 'bg-slate-900'}`}>
                      <Globe className={`w-4 h-4 ${selectedMethod?.id === m.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-white uppercase">{m.methodName}</p>
                    </div>
                    {selectedMethod?.id === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod && (
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. Send funds to:</label>
                  <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Manual Link</div>
                </div>
                
                {selectedMethod.qrUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-xl">
                    <img src={selectedMethod.qrUrl} alt="QR Code" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedMethod.paymentId} 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-mono text-slate-300 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMethod.paymentId);
                      alert("Address copied!");
                    }}
                    className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                {selectedMethod.instructions && (
                  <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-[10px] text-slate-400 font-medium italic">
                    {selectedMethod.instructions}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. Transaction ID / Proof</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
                <input 
                  type="text" 
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="Paste TRXID or Reference here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-12 py-5 text-white focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Plus className="w-5 h-5" />
                Finalize Deposit Request
              </>
            )}
          </button>
        </form>

        {/* Right: Instructions & Support */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6">
            <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Zap className="w-6 h-6 text-emerald-400" />
              Verification Process
            </h4>
            <div className="space-y-4">
              {[
                { step: '01', title: 'Submit Request', desc: 'Enter the amount you wish to deposit and select your method.' },
                { step: '02', title: 'Transfer Funds', desc: 'Send the exact amount to the details provided in your method.' },
                { step: '03', title: 'Node Verification', desc: 'Our global team verifies the transaction on the blockchain or bank ledger.' },
                { step: '04', title: 'Instant Credit', desc: 'Your KIT GIZMO wallet balance updates once 3-confirms are reached.' }
              ].map((s, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-emerald-500 font-black text-sm">{s.step}</span>
                  <div>
                    <h5 className="text-white font-bold text-sm tracking-tight">{s.title}</h5>
                    <p className="text-slate-500 text-xs leading-relaxed mt-1 font-medium">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-500 p-8 rounded-[32px] flex items-center justify-between group cursor-pointer overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-all">
               <Headphones className="w-32 h-32 text-slate-950" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-950 font-black text-xl leading-tight">Need help with <br /> large wire transfers?</p>
              <p className="text-slate-900 text-xs font-bold mt-2 uppercase tracking-widest">Connect with VIP Support</p>
            </div>
            <ArrowRight className="w-8 h-8 text-slate-950 group-hover:translate-x-2 transition-transform relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ user }: { user: any }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    fullName: '',
    phoneNumber: '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    orders: true,
    ads: false,
    wallet: true,
    security: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}`;
    const docRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          email: user.email || ''
        });
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      alert("Profile updated successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white tracking-tight">Account Settings</h2>
        <p className="text-slate-400 text-sm font-medium">Manage your global profile and security preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-black text-slate-950 uppercase">
            {profile.fullName ? profile.fullName.substring(0, 2) : 'KG'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{profile.fullName || 'Gizmo User'}</h3>
            <p className="text-slate-400 text-sm">Professional Scale Plan • Since 2024</p>
            <button className="mt-2 text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">Change Avatar</button>
          </div>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
              <input 
                type="text" 
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
              <p className="text-xs text-slate-500 mb-2 italic">Read-only account identification</p>
              <input 
                type="email" 
                value={profile.email}
                disabled
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
              <input 
                type="tel" 
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
              />
            </div>
            <button type="submit" className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-3 rounded-xl transition-all shadow-xl mt-4">
              SAVE CHANGES
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-5 h-5 text-amber-500" />
          <h3 className="text-xl font-bold text-white">Security & Password</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
              Updating your password will require you to log back in on all devices for security purposes. Use a strong password with mixed characters.
            </p>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min 8 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
                  />
                </div>
                <PasswordStrengthMeter strength={getPasswordStrength(passwordForm.newPassword)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-12 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-medium"
                  />
                </div>
              </div>
              <button 
                disabled={passLoading || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg text-[10px] uppercase tracking-widest"
              >
                {passLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update Password'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Login Activity</h4>
            <div className="space-y-3">
              {[
                { browser: 'Chrome on MacOS', location: 'California, US (Current)', date: 'Just now' },
                { browser: 'Safari on iPhone', location: 'London, UK', date: '2 days ago' }
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-tight">{session.browser}</p>
                      <p className="text-[9px] text-slate-500 font-medium">{session.location}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-600 font-bold uppercase">{session.date}</span>
                </div>
              ))}
              <button className="w-full p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl text-red-500 text-[9px] font-black uppercase tracking-widest transition-all">
                Log out from all other devices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { id: 'orders', label: 'Order Fulfillment Alerts', sub: 'Instant notify when USA center processes local orders' },
            { id: 'ads', label: 'AI Ad Optimization Reports', sub: 'Weekly performance sync and meta-tiktok ROI analysis' },
            { id: 'wallet', label: 'Wallet Balance Warnings', sub: 'Alert when balance drops below $5,000 threshold' },
            { id: 'security', label: 'Security & Logins', sub: 'Major account changes and new device verification' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">{item.label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
              </div>
              <button 
                onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.id as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-lg ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Key className="w-48 h-48" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Lock className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold text-white">Developer API Keys</h3>
        </div>
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
            Use your API key to connect external ERP systems, custom Shopify themes, or third-party ad trackers. Keep this key secret and secure.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-xs flex items-center justify-between">
              <span>{showApiKey ? 'kg_live_7x8291vmp02919sh8291kjz' : '••••••••••••••••••••••••••••••••'}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowApiKey(!showApiKey)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold text-xs transition-colors">
              ROLL KEY
            </button>
          </div>
          <div className="flex items-center gap-2 pt-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active System Integration</span>
          </div>
        </div>
      </div>

      <div className="pt-8 text-center">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">Kit Gizmo Security Infrastructure v4.2.1</p>
      </div>
    </motion.div>
  );
};

// --- Auth Modal Component ---

const COUNTRIES = [
  { name: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Andorra", code: "+376", flag: "🇦🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Argentina", code: "+54", flag: "🇦🇷" },
  { name: "Armenia", code: "+374", flag: "🇦🇲" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "+43", flag: "🇦🇹" },
  { name: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { name: "Bahamas", code: "+1-242", flag: "🇧🇸" },
  { name: "Bahrain", code: "+973", flag: "🇧🇭" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Barbados", code: "+1-246", flag: "🇧🇧" },
  { name: "Belarus", code: "+375", flag: "🇧🇾" },
  { name: "Belgium", code: "+32", flag: "🇧🇪" },
  { name: "Belize", code: "+501", flag: "🇧🇿" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", code: "+387", flag: "🇧🇦" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Brunei", code: "+673", flag: "🇧🇳" },
  { name: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Cambodia", code: "+855", flag: "🇰🇭" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Chile", code: "+56", flag: "🇨🇱" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "+57", flag: "🇨🇴" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Congo", code: "+242", flag: "🇨🇬" },
  { name: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { name: "Croatia", code: "+385", flag: "🇭🇷" },
  { name: "Cuba", code: "+53", flag: "🇨🇺" },
  { name: "Cyprus", code: "+357", flag: "🇨🇾" },
  { name: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "+45", flag: "🇩🇰" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Dominica", code: "+1-767", flag: "🇩🇲" },
  { name: "Dominican Republic", code: "+1-809", flag: "🇩🇴" },
  { name: "East Timor", code: "+670", flag: "🇹🇱" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻" },
  { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { name: "Eritrea", code: "+291", flag: "🇪🇷" },
  { name: "Estonia", code: "+372", flag: "🇪🇪" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Fiji", code: "+679", flag: "🇫🇯" },
  { name: "Finland", code: "+358", flag: "🇫🇮" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Georgia", code: "+995", flag: "🇬🇪" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "+30", flag: "🇬🇷" },
  { name: "Grenada", code: "+1-473", flag: "🇬🇩" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { name: "Guyana", code: "+592", flag: "🇬🇾" },
  { name: "Haiti", code: "+509", flag: "🇭🇹" },
  { name: "Honduras", code: "+504", flag: "🇭🇳" },
  { name: "Hungary", code: "+36", flag: "🇭🇺" },
  { name: "Iceland", code: "+354", flag: "🇮🇸" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "+39", flag: "🇮🇹" },
  { name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
  { name: "Jamaica", code: "+1-876", flag: "🇯🇲" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "+962", flag: "🇯🇴" },
  { name: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Kiribati", code: "+686", flag: "🇰🇮" },
  { name: "Korea, North", code: "+850", flag: "🇰🇵" },
  { name: "Korea, South", code: "+82", flag: "🇰🇷" },
  { name: "Kuwait", code: "+965", flag: "🇰🇼" },
  { name: "Kyrgyzstan", code: "+996", flag: "🇰🇬" },
  { name: "Laos", code: "+856", flag: "🇱🇦" },
  { name: "Latvia", code: "+371", flag: "🇱🇻" },
  { name: "Lebanon", code: "+961", flag: "🇱🇧" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Liechtenstein", code: "+423", flag: "🇱🇮" },
  { name: "Lithuania", code: "+370", flag: "🇱🇹" },
  { name: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { name: "Macedonia", code: "+389", flag: "🇲🇰" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Maldives", code: "+960", flag: "🇲🇻" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Malta", code: "+356", flag: "🇲🇹" },
  { name: "Marshall Islands", code: "+692", flag: "🇲🇭" },
  { name: "Mauritania", code: "+222", flag: "🇲🇷" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "Micronesia", code: "+691", flag: "🇫🇲" },
  { name: "Moldova", code: "+373", flag: "🇲🇩" },
  { name: "Monaco", code: "+377", flag: "🇲🇨" },
  { name: "Mongolia", code: "+976", flag: "🇲🇳" },
  { name: "Montenegro", code: "+382", flag: "🇲🇪" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Myanmar", code: "+95", flag: "🇲🇲" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Nauru", code: "+674", flag: "🇳🇷" },
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "+64", flag: "🇳🇿" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "+47", flag: "🇳🇴" },
  { name: "Oman", code: "+968", flag: "🇴🇲" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Palau", code: "+680", flag: "🇵🇼" },
  { name: "Panama", code: "+507", flag: "🇵🇦" },
  { name: "Papua New Guinea", code: "+675", flag: "🇵🇬" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾" },
  { name: "Peru", code: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "+351", flag: "🇵🇹" },
  { name: "Qatar", code: "+974", flag: "🇶🇦" },
  { name: "Romania", code: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "+7", flag: "🇷🇺" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Saint Kitts and Nevis", code: "+1-869", flag: "🇰🇳" },
  { name: "Saint Lucia", code: "+1-758", flag: "🇱🇨" },
  { name: "Saint Vincent and the Grenadines", code: "+1-784", flag: "🇻🇨" },
  { name: "Samoa", code: "+685", flag: "🇼🇸" },
  { name: "San Marino", code: "+378", flag: "🇸🇲" },
  { name: "Sao Tome and Principe", code: "+239", flag: "🇸🇹" },
  { name: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Serbia", code: "+381", flag: "🇷🇸" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Slovakia", code: "+421", flag: "🇸🇰" },
  { name: "Slovenia", code: "+386", flag: "🇸🇮" },
  { name: "Solomon Islands", code: "+677", flag: "🇸🇧" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Spain", code: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Suriname", code: "+597", flag: "🇸🇷" },
  { name: "Swaziland", code: "+268", flag: "🇸🇿" },
  { name: "Sweden", code: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "+41", flag: "🇨🇭" },
  { name: "Syria", code: "+963", flag: "🇸🇾" },
  { name: "Taiwan", code: "+886", flag: "🇹🇼" },
  { name: "Tajikistan", code: "+992", flag: "🇹🇯" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "+66", flag: "🇹🇭" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Tonga", code: "+676", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", code: "+1-868", flag: "🇹🇹" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Turkey", code: "+90", flag: "🇹🇷" },
  { name: "Turkmenistan", code: "+993", flag: "🇹🇲" },
  { name: "Tuvalu", code: "+688", flag: "🇹🇻" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾" },
  { name: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { name: "Vanuatu", code: "+678", flag: "🇻🇺" },
  { name: "Vatican City", code: "+379", flag: "🇻🇦" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "+84", flag: "🇻🇳" },
  { name: "Yemen", code: "+967", flag: "🇾🇪" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" }
].sort((a, b) => a.name.localeCompare(b.name));


const getPasswordStrength = (password: string) => {
  if (!password) return 0;
  let strength = 0;
  if (password.length > 7) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  return strength;
};

const PasswordStrengthMeter = ({ strength }: { strength: number }) => {
  const levels = [
    { color: 'bg-red-500', text: 'Weak', width: 'w-1/4' },
    { color: 'bg-orange-500', text: 'Fair', width: 'w-2/4' },
    { color: 'bg-amber-500', text: 'Good', width: 'w-3/4' },
    { color: 'bg-emerald-500', text: 'Strong', width: 'w-full' }
  ];

  if (strength === 0) return null;
  const current = levels[strength - 1];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Password Strength</span>
        <span className={`text-[9px] font-black uppercase tracking-widest ${current.color.replace('bg-', 'text-')}`}>{current.text}</span>
      </div>
      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: progressWidth(strength) }}
          className={`h-full ${current.color} transition-all duration-500`}
        />
      </div>
    </div>
  );
};

const progressWidth = (strength: number) => {
  switch(strength) {
    case 1: return '25%';
    case 2: return '50%';
    case 3: return '75%';
    case 4: return '100%';
    default: return '0%';
  }
};

const AuthModal = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  onAuthSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialMode?: 'login' | 'signup';
  onAuthSuccess: () => void;
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [step, setStep] = useState<'auth' | 'otp' | 'forgot'>('auth');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Country selector states
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.name === "Bangladesh") || COUNTRIES[0]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOTP = async () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setResendTimer(20);
    setOtp('');
    setError(null);
    
    console.info(`%c[KIT GIZMO SECURITY] 2FA Code for ${formData.email}: ${code}`, "color: #10b981; font-weight: bold; font-size: 14px;");

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            email: formData.email,
            passcode: code,
          },
          EMAILJS_PUBLIC_KEY
        );
        // Show success message temporarily
        const successDiv = document.createElement('div');
        successDiv.className = "fixed top-4 right-4 bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-bold z-[200] shadow-2xl animate-bounce";
        successDiv.innerText = "A 6-digit security code has been sent to your email.";
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 4000);
      } catch (err) {
        console.error("EmailJS Error:", err);
        setError("Failed to send verification code. Please try again.");
      }
    }
  };
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: selectedCountry.code + ' ',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setShowCountryList(false);
    setFormData(prev => ({
      ...prev,
      phoneNumber: country.code + ' '
    }));
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      // Success Notification
      const successDiv = document.createElement('div');
      successDiv.className = "fixed bottom-8 right-8 bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm z-[200] shadow-2xl animate-bounce max-w-md";
      successDiv.innerText = "A password reset link has been sent to your email. Please check your inbox or spam folder.";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 6000);
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("This email address is not registered.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Save extra data to Firestore
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            totalBalance: 0,
            status: 'Active',
            ordersFulfilled: 0,
            ordersPending: 0,
            totalPayout: 0,
            isAdmin: formData.email === 'info.kitgizmo@gmail.com',
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setStep('otp');
        sendOTP();
        setLoading(false);
        return;
      }
      
      // For Signup, also force 2FA
      if (mode === 'signup') {
        setStep('otp');
        sendOTP();
        setLoading(false);
        return;
      }

      sessionStorage.setItem('is2FAVerified', 'true');
      onAuthSuccess();
      onClose();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed') {
        setError("Network Error: Unable to reach authentication server. Please check your internet connection, disable ad-blockers, or try a different browser.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No account found with this email.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Incorrect password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Account temporarily disabled due to many failed attempts. Please reset your password or try again later.");
      } else {
        setError(err.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      sessionStorage.setItem('is2FAVerified', 'true');
      onAuthSuccess();
      onClose();
      navigate('/dashboard');
    } else {
      setError("Invalid security code.");
      setOtp('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl relative w-full max-w-md overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors z-50">
          <X className="w-6 h-6" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'auth' ? (
            <motion.div
              key="auth-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Scale with Us'}
                </h2>
                <p className="text-slate-400 font-medium">
                  {mode === 'login' ? 'Access your global marketplace control center.' : 'Join 1M+ users scaling with KIT GIZMO.'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                          name="fullName"
                          type="text" 
                          placeholder="John Doe"
                          value={formData.fullName}
                          required
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Country & Phone</label>
                      <div className="space-y-2">
                        {/* Searchable Country Selector */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={() => setShowCountryList(!showCountryList)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white flex items-center justify-between hover:border-emerald-500/30 transition-all font-medium text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{selectedCountry.flag}</span>
                              <span>{selectedCountry.name}</span>
                              <span className="text-slate-500 text-xs font-bold">({selectedCountry.code})</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showCountryList ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {showCountryList && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-[300px] flex flex-col"
                              >
                                <div className="p-3 border-b border-slate-800 bg-slate-900/50 sticky top-0">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                    <input 
                                      type="text" 
                                      placeholder="Search country..."
                                      value={countrySearch}
                                      onChange={e => setCountrySearch(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                                      autoFocus
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto flex-1 scrollbar-hide py-2">
                                  {filteredCountries.map(country => (
                                    <button
                                      key={country.name}
                                      type="button"
                                      onClick={() => handleCountrySelect(country)}
                                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-850 transition-colors text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">{country.flag}</span>
                                        <div className="flex flex-col">
                                          <span className="text-sm text-white font-medium">{country.name}</span>
                                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{country.code}</span>
                                        </div>
                                      </div>
                                      {selectedCountry.name === country.name && (
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                      )}
                                    </button>
                                  ))}
                                  {filteredCountries.length === 0 && (
                                    <div className="p-8 text-center">
                                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No results found</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Phone Number Input */}
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input 
                            name="phoneNumber"
                            type="tel" 
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      name="email"
                      type="email" 
                      placeholder="name@company.com"
                      value={formData.email}
                      required
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 ml-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setStep('forgot')}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      name="password"
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      required
                      onChange={handleChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  {mode === 'signup' && <PasswordStrengthMeter strength={getPasswordStrength(formData.password)} />}
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input 
                        name="confirmPassword"
                        type="password" 
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        required
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'LOGIN TO DASHBOARD' : 'CREATE ACCOUNT')}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </motion.div>
          ) : step === 'otp' ? (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">2-Step Verification</h2>
                <p className="text-slate-400 font-medium">
                  We've sent a 6-digit code to <span className="text-emerald-400 font-bold">{formData.email}</span>.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Security Code</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="000000"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-14 pr-6 py-5 text-3xl font-black tracking-[0.2em] text-white focus:outline-none focus:border-emerald-500 transition-all text-center placeholder:text-slate-900"
                      autoFocus
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-3xl transition-all shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  Verify & Login
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  Didn't receive the code?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-slate-600 font-bold">Resend in {resendTimer}s</span>
                  ) : (
                    <button 
                      onClick={sendOTP}
                      className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Resend Code
                    </button>
                  )}
                </p>
                <button 
                  onClick={() => {
                    setStep('auth');
                    setError(null);
                  }}
                  className="mt-6 text-slate-600 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="forgot-password-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Key className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-slate-400 font-medium">
                  We'll send a recovery link to your registered email address.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      name="email"
                      type="email" 
                      placeholder="Enter your registered email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                    setStep('auth');
                    setError(null);
                  }}
                  className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowDownLeft className="w-4 h-4 rotate-45" />
                  Back to Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --- Protected Route ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isVerified = sessionStorage.getItem('is2FAVerified') === 'true';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || !isVerified) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// --- Landing Page ---
const LandingPage = ({ openAuth }: { openAuth: (mode: 'login' | 'signup') => void }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-400 font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter">
            KG
          </div>
          <span className="text-xl font-bold tracking-tight">KIT GIZMO</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">API Docs</a>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => openAuth('login')}
            className="text-slate-400 hover:text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm"
          >
            Login
          </button>
          <button 
            onClick={() => openAuth('signup')}
            className="bg-emerald-500 text-slate-950 px-6 py-2.5 rounded-full font-bold hover:bg-emerald-400 transition-colors text-sm flex items-center gap-2 group shadow-xl shadow-emerald-500/10"
          >
            Sign Up <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full shadow-2xl">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Collaborative Alpha</span>
              <div className="w-px h-4 bg-slate-700" />
              <span className="text-slate-400 text-xs font-semibold">KIT GIZMO x Shopify</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
              Scale your ads with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Superhuman</span> precision.
            </h1>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mx-auto">
              The ultimate fulfillment and ad-management dashboard designed for high-volume USA dropshippers. Real-time Shopify sync, AI performance optimization, and global wallet management.
            </p>

            <div className="flex flex-wrap gap-8 justify-center items-center pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-400">
                <span className="text-white font-bold">1M+ Users</span> worldwide trust KIT GIZMO.
              </div>
            </div>

            <ComparisonCard />
          </motion.div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-30">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Global Scale Network</span>
        </div>
        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 KIT GIZMO INC. PREMIER USA DROP-SCALE OPS.</p>
      </footer>
    </div>
  );
};

const FileIcon = ({ name }: { name: string }) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="w-4 h-4 opacity-50" />;
  if (ext === 'pdf') return <FileText className="w-4 h-4 text-rose-500 opacity-70" />;
  if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-4 h-4 text-blue-500 opacity-70" />;
  if (['csv', 'xlsx', 'xls'].includes(ext || '')) return <FileText className="w-4 h-4 text-emerald-500 opacity-70" />;
  return <File className="w-4 h-4 text-slate-500 opacity-70" />;
};
const AdCampaignsView = ({ 
  user, 
  userData,
  onForceStop,
  onForceStart
}: { 
  user: FirebaseUser | null, 
  userData: UserProfile | null,
  onForceStop?: (id: string) => Promise<void>,
  onForceStart?: (id: string) => Promise<void>
}) => {
  const [platform, setPlatform] = useState<'TikTok' | 'Facebook' | 'Instagram' | ''>('');
  const [formData, setFormData] = useState({
    productLink: '',
    country: 'United States',
    scope: 'Full Country' as 'Full Country' | 'Specific States' | 'Specific Cities',
    scopeDetails: '',
    dailyBudget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [userCampaigns, setUserCampaigns] = useState<AdCampaign[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<AdCampaign[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isUserAdmin(user);

  const countries = [
    "United States", "United Kingdom", "Canada", "United Arab Emirates (Dubai)", 
    "Italy", "Australia", "Germany"
  ];

  useEffect(() => {
    if (!user || !user.uid) return;
    
    // User's own campaigns - High priority real-time listener
    const userQ = query(
      collection(db, 'ad_campaigns'),
      where('userId', '==', user.uid)
    );
    
    const unsubUser = onSnapshot(userQ, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign));
      // Sort client-side to ensure newest appear first even without composite index
      const sortedDocs = docs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setUserCampaigns(sortedDocs);
      setLoading(false);
    }, (err) => {
      console.error("User campaigns listener error:", err);
      handleFirestoreError(err, OperationType.LIST, 'ad_campaigns');
      setLoading(false);
    });

    // Admin view: all campaigns (only if admin)
    let unsubAll: (() => void) | null = null;
    let unsubFallback: (() => void) | null = null;

    if (isAdmin) {
      const allQ = query(collection(db, 'ad_campaigns'), orderBy('createdAt', 'desc'));
      unsubAll = onSnapshot(allQ, (snapshot) => {
        setAllCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign)));
      }, (err) => {
        if (err.message.includes('index')) {
          console.warn("Falling back to client-side sort for admin campaigns");
          const fallbackQ = query(collection(db, 'ad_campaigns'));
          unsubFallback = onSnapshot(fallbackQ, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdCampaign));
            setAllCampaigns(docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
          }, (fallbackErr) => {
            handleFirestoreError(fallbackErr, OperationType.LIST, 'ad_campaigns');
          });
        } else {
          handleFirestoreError(err, OperationType.LIST, 'ad_campaigns');
        }
      });
    }

    return () => {
      unsubUser();
      if (unsubAll) unsubAll();
      if (unsubFallback) unsubFallback();
    };
  }, [user?.uid, isAdmin]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const activePlatform = platform || editingCampaign?.platform;
    if (!user || !activePlatform || !formData.productLink || !formData.dailyBudget) return;

    const budget = Number(formData.dailyBudget);
    if (isNaN(budget) || budget <= 0) return;

    // Toast helper to match requested syntax
    const toast = {
      error: (msg: string) => {
        const t = document.createElement('div');
        t.className = "fixed bottom-8 right-8 bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs z-[100] shadow-2xl animate-pulse";
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
      },
      success: (msg: string) => {
        const t = document.createElement('div');
        t.className = "fixed bottom-8 right-8 bg-emerald-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs z-[100] shadow-2xl";
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
      }
    };

    setSubmitting(true);
    
    try {
      if (editingCampaign) {
        // --- 1. Edit Mode: Update existing document ---
        await updateDoc(doc(db, 'ad_campaigns', editingCampaign.id), {
          platform: activePlatform,
          productLink: formData.productLink,
          country: formData.country,
          scope: formData.scope,
          dailyBudget: Number(budget),
          status: "Pending", // Reset to pending for review
          updatedAt: serverTimestamp()
        });
        toast.success("Campaign updated! Sent back for re-verification.");
      } else {
        // --- 2. Create Mode: Standard Flow with Deduction ---
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          throw new Error("User profile not found");
        }

        const user_balance = userSnap.data().totalBalance || 0;

        if (user_balance < budget) {
          toast.error("Insufficient balance to launch this campaign.");
          setSubmitting(false);
          return;
        }

        // Calculate and update balance
        const new_balance = user_balance - budget;
        await updateDoc(userRef, {
          totalBalance: new_balance,
          updatedAt: serverTimestamp()
        });

        // Insert new campaign
        await addDoc(collection(db, 'ad_campaigns'), {
          userId: user.uid,
          userEmail: user.email,
          platform: activePlatform,
          productLink: formData.productLink,
          country: formData.country,
          scope: formData.scope,
          dailyBudget: Number(budget),
          status: "Pending",
          createdAt: serverTimestamp()
        });
        toast.success("Campaign request submitted successfully! Budget deducted.");
      }

      // Clean Up State
      setPlatform('');
      setEditingCampaign(null);
      setFormData({
        productLink: '',
        country: 'United States',
        scope: 'Full Country',
        scopeDetails: '',
        dailyBudget: '',
      });
      
      toast.success("Campaign request submitted successfully! Budget deducted.");

    } catch (err: any) {
      console.error("Launch Error:", err);
      handleFirestoreError(err, OperationType.WRITE, 'ad_campaigns');
    } finally {
      // Ensure loading/submitting state is cleared on both success and error
      setSubmitting(false);
      setLoading(false); // Fulfilling user requirement for setLoading(false)
    }
  };

  const updateStatus = async (campaign: AdCampaign, newStatus: 'Active' | 'Rejected' | 'Stopped') => {
    try {
      if (isAdmin && newStatus === 'Rejected') {
        // Refund logic for admin rejection
        await runTransaction(db, async (transaction) => {
          const campaignRef = doc(db, 'ad_campaigns', campaign.id);
          const userRef = doc(db, 'users', campaign.userId);
          
          const userSnap = await transaction.get(userRef);
          if (userSnap.exists()) {
            const currentBalance = userSnap.data().totalBalance || 0;
            transaction.update(userRef, {
              totalBalance: currentBalance + campaign.dailyBudget
            });
          }
          
          transaction.update(campaignRef, { 
            status: newStatus,
            updatedAt: serverTimestamp()
          });
        });
      } else {
        // Basic status toggle (Pause/Resume or Approval)
        await updateDoc(doc(db, 'ad_campaigns', campaign.id), { 
          status: newStatus,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `ad_campaigns/${campaign.id}`);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'ad_campaigns', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ad_campaigns/${id}`);
    }
  };

  const startEditing = (c: AdCampaign) => {
    setEditingCampaign(c);
    setPlatform(''); // Hide new selection if editing
    setFormData({
      productLink: c.productLink,
      country: c.country,
      scope: c.scope,
      scopeDetails: c.details || '',
      dailyBudget: c.dailyBudget.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Platform Selection */}
      <section className="space-y-6">
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Select Ad Platform</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">AI Optimized reach per channel</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { id: 'TikTok', icon: Zap, label: 'TikTok Ads', color: 'bg-rose-500' },
            { id: 'Facebook', icon: Facebook, label: 'Facebook Ads', color: 'bg-blue-600' },
            { id: 'Instagram', icon: Instagram, label: 'Instagram Ads', color: 'bg-violet-500' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id as any)}
              className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${
                platform === p.id 
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]' 
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${platform === p.id ? p.color : 'bg-slate-800 text-slate-500'}`}>
                <p.icon className={`w-8 h-8 ${platform === p.id ? 'text-white' : 'text-slate-500'}`} />
              </div>
              <span className={`font-black uppercase tracking-[0.2em] text-[10px] ${platform === p.id ? 'text-emerald-400' : 'text-slate-500'}`}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Campaign Submission Form */}
      {(platform || editingCampaign) && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl"
        >
          <div className="p-8 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              {editingCampaign ? <Shield className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-emerald-500" />}
              {editingCampaign ? `Edit ${editingCampaign.platform} Campaign` : `Configure ${platform} Campaign`}
            </h3>
            {editingCampaign && (
              <button 
                onClick={() => {
                  setEditingCampaign(null);
                  setFormData({ productLink: '', country: 'United States', scope: 'Full Country', scopeDetails: '', dailyBudget: '' });
                }}
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={handleLaunch} className="p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Link</label>
                <input 
                  type="url"
                  required
                  placeholder="Enter your Shopify product URL"
                  value={formData.productLink}
                  onChange={e => setFormData({...formData, productLink: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Country</label>
                <select 
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Targeting Scope</label>
                <select 
                  value={formData.scope}
                  onChange={e => setFormData({...formData, scope: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Full Country">Full Country</option>
                  <option value="Specific States">Specific States</option>
                  <option value="Specific Cities">Specific Cities</option>
                </select>
              </div>
              {formData.scope !== 'Full Country' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formData.scope} Details</label>
                  <input 
                    type="text"
                    required
                    placeholder={formData.scope === 'Specific States' ? "New York, Texas, Florida" : "Dubai, London, Rome"}
                    value={formData.scopeDetails}
                    onChange={e => setFormData({...formData, scopeDetails: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Budget ($)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold">$</span>
                  <input 
                    type="number"
                    required
                    min="5"
                    placeholder="25.00"
                    value={formData.dailyBudget}
                    onChange={e => setFormData({...formData, dailyBudget: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 pl-12 text-white outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg transition-all flex items-center justify-center gap-3 ${
                  editingCampaign 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCampaign ? <Shield className="w-5 h-5 fill-slate-950" /> : <Zap className="w-5 h-5 fill-slate-950" />}
                {editingCampaign ? 'Update & Re-Verify' : 'Launch Campaign Request'}
              </button>
            </div>
          </form>
        </motion.section>
      )}

      {/* 3. Personal Campaign Queue */}
      {!isAdmin && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Request Queue</h3>
            <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{userCampaigns.length} Campaigns</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map((c) => (
              <div key={c.id} className="bg-slate-900/50 border border-slate-800 rounded-[32px] p-6 hover:border-slate-700 transition-all group">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl ${
                    c.platform === 'TikTok' ? 'bg-rose-500/10 text-rose-400' : 
                    c.platform === 'Facebook' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'
                  }`}>
                    {c.platform === 'TikTok' ? <Zap className="w-5 h-5" /> : c.platform === 'Facebook' ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{c.platform} ADS</p>
                    <h4 className="text-white font-bold truncate text-sm">{c.productLink}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Budget</p>
                      <p className="text-xs font-black text-white">${c.dailyBudget}/day</p>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Target</p>
                      <p className="text-xs font-black text-white truncate">{c.country}</p>
                    </div>
                  </div>
                  
                  {/* User Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button 
                      onClick={() => startEditing(c)}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                      title="Edit Campaign"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                    
                    {c.status === 'Active' ? (
                      <button 
                        onClick={() => updateStatus(c, 'Stopped')}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                      >
                        PAUSE / OFF
                      </button>
                    ) : c.status === 'Stopped' ? (
                      <button 
                        onClick={() => updateStatus(c, 'Active')}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-500/20"
                      >
                        RESUME / ON
                      </button>
                    ) : (
                      <div className="flex-1 text-center py-3 bg-slate-800/50 rounded-xl border border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Reviewing...</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {userCampaigns.length === 0 && !loading && (
              <div className="col-span-full py-20 bg-slate-950/50 border-2 border-dashed border-slate-900 rounded-[40px] flex flex-col items-center justify-center text-center">
                <PlusCircle className="w-12 h-12 text-slate-800 mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No active campaign requests</p>
                <p className="text-slate-700 text-[10px] uppercase font-black tracking-widest mt-2">Select a platform above to get started</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Admin Governance Dashboard */}
      {isAdmin && (
        <section className="space-y-6 pt-12 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight text-amber-500 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 animate-pulse" /> Campaign Governance
            </h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase">User / Platform</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase">Config Details</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase">Budget</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {allCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${
                            c.platform === 'TikTok' ? 'bg-rose-500/10 text-rose-400' : 
                            c.platform === 'Facebook' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'
                          }`}>
                            {c.platform === 'TikTok' ? <Zap className="w-4 h-4" /> : c.platform === 'Facebook' ? <Facebook className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-white font-bold text-xs uppercase tracking-tight">{c.userName || c.userEmail?.split('@')[0]}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{c.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-white text-xs font-medium truncate max-w-[200px]">{c.productLink}</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{c.country} • {c.scope}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-white tracking-tighter">${c.dailyBudget}</span>
                          <StatusBadge status={c.status} />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {c.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(c, 'Active')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                APPROVE
                              </button>
                              <button 
                                onClick={() => updateStatus(c, 'Rejected')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                              >
                                REJECT
                              </button>
                            </>
                          )}
                          {c.status !== 'Pending' && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => onForceStart ? onForceStart(c.id) : updateStatus(c, 'Active')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                              >
                                FORCE START
                              </button>
                              <button 
                                onClick={() => onForceStop ? onForceStop(c.id) : updateStatus(c, 'Stopped')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                              >
                                FORCE STOP
                              </button>
                              <button 
                                onClick={() => handleDeleteCampaign(c.id)}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          {c.status === 'Pending' && (
                             <button 
                               onClick={() => handleDeleteCampaign(c.id)}
                               className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                             >
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {allCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No campaign requests pending</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};



const SupportChat = ({ ticket, user, isAdminView, onBack }: { ticket: SupportTicket, user: FirebaseUser | null, isAdminView?: boolean, onBack: () => void }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'support_tickets', ticket.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportMessage)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `support_tickets/${ticket.id}/messages`);
    });
    return () => unsubscribe();
  }, [ticket.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Maximum size is 5MB.");
        return;
      }
      setAttachment(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!reply.trim() && !attachment)) return;
    
    setSending(true);
    try {
      let attachmentUrl = null;
      let attachmentName = null;

      if (attachment) {
        setUploading(true);
        try {
          const storageRef = ref(storage, `support/${ticket.id}/${Date.now()}_${attachment.name}`);
          const snapshot = await uploadBytes(storageRef, attachment);
          attachmentUrl = await getDownloadURL(snapshot.ref);
          attachmentName = attachment.name;
        } catch (storageErr) {
          console.error("Support chat storage upload failed, attempting fallback:", storageErr);
          // If it's a small image, we can try base64 as a fallback for the UI to at least show something
          if (attachment.type.startsWith('image/') && attachment.size < 1024 * 512) {
            try {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(attachment);
              });
              attachmentUrl = base64;
              attachmentName = attachment.name + " (Embedded)";
            } catch (readerErr) {
              console.error("Base64 fallback failed:", readerErr);
            }
          }
        } finally {
          setUploading(false);
        }
      }

      await addDoc(collection(db, 'support_tickets', ticket.id, 'messages'), {
        senderId: user.uid,
        senderEmail: user.email,
        text: reply.trim(),
        attachmentUrl,
        attachmentName,
        createdAt: serverTimestamp() // Use serverTimestamp for integrity, but fulfills user's intent
      });

      // Update ticket status based on sender and current state
      const ticketRef = doc(db, 'support_tickets', ticket.id);
      const updateData: any = {
        lastMessageAt: serverTimestamp(),
      };

      if (isAdminView) {
        // If admin replies and it was Pending or open, move to Pending Admin Review
        if (ticket.status === 'Pending' || ticket.status === 'open') {
          updateData.status = 'Pending Admin Review';
        }
      } else {
        // If customer replies and it was Solved, re-open it
        if (ticket.status === 'Solved') {
          updateData.status = 'open';
        }
      }

      await updateDoc(ticketRef, updateData);

      setReply('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `support_tickets/${ticket.id}/messages`);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-800/50 p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white">
            <ArrowDownLeft className="w-5 h-5 rotate-45" />
          </button>
          <div>
            <h4 className="text-white font-black uppercase tracking-tight line-clamp-1">{ticket.subject}</h4>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={ticket.status} />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">#{ticket.id.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/20">
        {/* Initial Message */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-emerald-500 p-4 rounded-2xl rounded-tl-none shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Me</span>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">•</span>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'Just now'}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed font-bold">{ticket.message}</p>
            {ticket.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                <img src={ticket.imageUrl} alt="Attached" className="max-h-64 w-full object-cover cursor-zoom-in" onClick={() => window.open(ticket.imageUrl, '_blank')} />
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {messages.map((msg) => {
          // Alignment Logic: Admin (info.kitgizmo@gmail.com) on RIGHT, student on LEFT
          const isFromAdmin = ADMIN_EMAILS.includes(msg.senderEmail || '');
          const alignRight = isFromAdmin;

          return (
            <div key={msg.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                alignRight 
                  ? 'bg-slate-800 border border-slate-700 rounded-tr-none shadow-xl' // Admin Right: Dark Navy/Ash
                  : 'bg-emerald-500 rounded-tl-none shadow-lg shadow-emerald-500/10' // User Left: Vibrant Emerald
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${alignRight ? 'text-emerald-400' : 'text-white'}`}>
                    {isFromAdmin ? 'OFFICIAL SUPPORT ⚡' : 'Me'}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${alignRight ? 'text-slate-500' : 'text-white/40'}`}>•</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${alignRight ? 'text-slate-500' : 'text-white/40'}`}>
                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed font-bold ${alignRight ? 'text-white' : 'text-white'}`}>{msg.text}</p>
                
                {msg.attachmentUrl && (
                  <div className={`mt-2 p-3 rounded-xl border flex items-center gap-3 group transition-all cursor-pointer ${
                    alignRight ? 'bg-slate-950/30 border-slate-700' : 'bg-white/10 border-white/20'
                  }`} onClick={() => window.open(msg.attachmentUrl, '_blank')}>
                    <div className={`p-2 rounded-lg ${alignRight ? 'bg-slate-900 text-emerald-500' : 'bg-white/20 text-white'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-bold uppercase tracking-tight truncate ${alignRight ? 'text-white' : 'text-white'}`}>{msg.attachmentName || 'Attachment'}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${alignRight ? 'text-slate-500' : 'text-white/50'}`}>Click to open</p>
                    </div>
                    <ArrowUpRight className={`w-3.5 h-3.5 ${alignRight ? 'text-slate-600' : 'text-white/30'} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform`} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSend} className="space-y-4">
          {attachment && (
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <FileIcon name={attachment.name} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-tight">{attachment.name}</p>
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Ready to upload • {(attachment.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <button onClick={() => setAttachment(null)} className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex gap-4">
            <div className="flex-1 relative group">
              <input 
                type="text" 
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your message here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-white text-sm outline-none focus:border-emerald-500 transition-all font-medium placeholder:text-slate-700"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-600 hover:text-emerald-500 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={sending || (!reply.trim() && !attachment)}
              className={`px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                sending || (!reply.trim() && !attachment)
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SupportView = ({ user }: { user: FirebaseUser | null }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    if (!user || !user.uid) return;
    const q = query(
      collection(db, 'support_tickets'), 
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
      // Sort client-side to avoid complex composite index requirement
      const sortedDocs = docs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setTickets(sortedDocs);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'support_tickets');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large. Maximum size is 5MB.");
        return;
      }
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!message.trim()) {
      alert("Please enter a message before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (attachment) {
        setIsUploading(true);
        try {
          const storageRef = ref(storage, `tickets/${user.uid}/${Date.now()}_${attachment.name}`);
          const snapshot = await uploadBytes(storageRef, attachment);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.error("Support ticket storage upload failed, attempting fallback:", storageErr);
          // If it's a small image, we can try base64 as a fallback for the UI to at least show something
          if (attachment.type.startsWith('image/') && attachment.size < 1024 * 512) {
            try {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(attachment);
              });
              imageUrl = base64;
            } catch (readerErr) {
              console.error("Base64 fallback failed:", readerErr);
            }
          }
        } finally {
          setIsUploading(false);
        }
      }

      await addDoc(collection(db, 'support_tickets'), {
        userId: user.uid,
        userEmail: user.email,
        subject: subject || "No Subject",
        message: message.trim(),
        imageUrl: imageUrl || null,
        status: 'Pending',
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp()
      });

      setSubject('');
      setMessage('');
      setAttachment(null);
      
      const successDiv = document.createElement('div');
      successDiv.className = "fixed top-4 right-4 bg-emerald-500 text-slate-950 px-6 py-3 rounded-xl font-bold z-[200] shadow-2xl animate-bounce";
      successDiv.innerText = "Your support ticket has been submitted successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 4000);

    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'support_tickets');
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  if (selectedTicket) {
    return <SupportChat 
      ticket={selectedTicket} 
      user={user} 
      onBack={() => setSelectedTicket(null)} 
    />;
  }

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Create Ticket Form */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <Plus className="w-6 h-6 text-emerald-500" />
              Create New Ticket
            </h3>
            <p className="text-slate-500 text-sm font-medium">Describe your issue and our team will get back to you shortly.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject / Problem Title</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g., Deposit Issue, Shopify Setup Error"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-emerald-500 transition-all font-bold placeholder:text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detailed Description</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Please explain the issue in detail..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-emerald-500 transition-all min-h-[150px] font-medium placeholder:text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Upload AHttachment (Optional)</label>
              <div className="relative group/upload">
                <input 
                  type="file" 
                  id="ticket-attachment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div 
                  className={`w-full h-40 bg-slate-950 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden ${attachment ? 'border-emerald-500/50' : 'border-slate-800 hover:border-emerald-500'}`}
                >
                  {attachment ? (
                    <div className="p-8 flex flex-col items-center gap-3">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl">
                        <FileIcon name={attachment.name} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px]">{attachment.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{(attachment.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAttachment(null);
                        }}
                        className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all z-20 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="ticket-attachment" className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-8">
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      ) : (
                        <>
                          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 group-hover/upload:border-emerald-500/30 transition-all mb-4">
                            <Upload className="w-8 h-8 text-slate-600 group-hover/upload:text-emerald-500 transition-colors" />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/upload:text-emerald-500 transition-colors">Select Attachment File</span>
                          <span className="text-[9px] text-slate-700 mt-2 uppercase font-bold tracking-widest text-center">Supports Images, PDFs, or Documents up to 5MB</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting || isUploading}
              className={`w-full ${submitting || isUploading ? 'bg-slate-850 text-slate-600 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]'} py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3`}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {submitting ? 'Creating Ticket...' : 'Open Support Ticket'}
            </button>
          </form>
        </div>

        {/* My Tickets */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
              <History className="w-6 h-6 text-emerald-500" />
              Conversation Threads
            </h3>
            <p className="text-slate-500 text-sm font-medium">Click on a ticket to open the live chat thread.</p>
          </div>

          <div className="space-y-4">
            {tickets.map(ticket => (
              <motion.div 
                key={ticket.id}
                whileHover={{ x: 8 }}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[28px] cursor-pointer hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h4 className="text-white font-black uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{ticket.subject}</h4>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Opened: {ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleDateString() : 'Pending'}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500 flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5" />
                    Support Team Online
                  </span>
                  <span className="text-emerald-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Thread <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
            {tickets.length === 0 && !loading && (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-[32px] p-20 text-center">
                 <Headphones className="w-12 h-12 text-slate-800 mx-auto mb-4 opacity-20" />
                 <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No active support threads</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---
const DashboardLayout = ({ user, userData }: { user: FirebaseUser | null, userData: UserProfile | null }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<ServiceOrder[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeDailyBudget, setActiveDailyBudget] = useState(0);
  const [chartData, setChartData] = useState<{ day: number; spending: number; payouts: number }[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const defaultWidgets = ['balance', 'spending', 'payouts', 'orders', 'fulfillment', 'ai_insights'];
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);

  useEffect(() => {
    if (userData?.dashboardWidgets) {
      setActiveWidgets(userData.dashboardWidgets);
    } else {
      setActiveWidgets(defaultWidgets);
    }
  }, [userData]);

  const toggleWidget = async (id: string) => {
    if (!user) return;
    const newWidgets = activeWidgets.includes(id) 
      ? activeWidgets.filter(w => w !== id)
      : [...activeWidgets, id];
    
    setActiveWidgets(newWidgets);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        dashboardWidgets: newWidgets
      });
    } catch (err) {
      console.error("Failed to save dashboard config", err);
    }
  };

  const moveWidget = async (id: string, direction: 'up' | 'down') => {
    if (!user) return;
    const index = activeWidgets.indexOf(id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeWidgets.length - 1) return;

    const newWidgets = [...activeWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[index]];

    setActiveWidgets(newWidgets);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        dashboardWidgets: newWidgets
      });
    } catch (err) {
      console.error("Failed to save dashboard order", err);
    }
  };

  const handleForceStartCampaign = async (campaignId: string) => {
    try {
      await updateDoc(doc(db, 'ad_campaigns', campaignId), {
        status: 'Active',
        updatedAt: serverTimestamp()
      });
      alert("Campaign activated successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ad_campaigns/${campaignId}`);
    }
  };

  const handleForceStopCampaign = async (campaignId: string) => {
    try {
      await updateDoc(doc(db, 'ad_campaigns', campaignId), {
        status: 'Stopped',
        updatedAt: serverTimestamp()
      });
      alert("Campaign force-stopped successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ad_campaigns/${campaignId}`);
    }
  };

  const handleDeleteCampaignGlobal = async (id: string, isUser: boolean = false) => {
    if (!window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'ad_campaigns', id));
      if (isUser) alert("Campaign deleted successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ad_campaigns/${id}`);
    }
  };

  useEffect(() => {
    if (!user || !user.uid) return;
    
    // Preparation for chart and summary data
    let orders: ServiceOrder[] = [];
    let payouts: PayoutRequest[] = [];

    const processChartAndStats = () => {
      // Calculate total spent
      const spent = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.price || 0), 0);
      setTotalSpent(spent);

      // Prepare chart data
      const days = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        spending: 0,
        payouts: 0
      }));

      const now = new Date();
      
      orders.forEach(o => {
        if (!o.createdAt || o.status === 'Cancelled') return;
        const date = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          const index = 30 - diffDays;
          if (index >= 0 && index < 30) {
            days[index].spending += o.price;
          }
        }
      });

      payouts.forEach(p => {
        if (!p.createdAt || p.status !== 'Approved') return;
        const date = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          const index = 30 - diffDays;
          if (index >= 0 && index < 30) {
            days[index].payouts += p.amount;
          }
        }
      });

      setChartData(days);
    };

    // Listen to orders
    const ordersQ = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubOrders = onSnapshot(ordersQ, (snapshot) => {
      orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder));
      processChartAndStats();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    // Listen to payouts
    const payoutsQ = query(collection(db, 'payouts'), where('userId', '==', user.uid));
    const unsubPayouts = onSnapshot(payoutsQ, (snapshot) => {
      payouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutRequest));
      processChartAndStats();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'payouts');
    });

    // Active orders count for badge
    const activeQ = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid),
      where('status', 'in', ['Pending', 'Processing'])
    );
    const unsubActive = onSnapshot(activeQ, (snapshot) => {
      setActiveOrdersCount(snapshot.size);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    });

    // Recent orders for dashboard list
    const recentQ = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubRecent = onSnapshot(recentQ, (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder)));
    }, (err) => {
      // If index is missing, fallback to unordered
      if (err.message.includes('index')) {
        const fallbackQ = query(collection(db, 'orders'), where('userId', '==', user.uid), limit(5));
        onSnapshot(fallbackQ, (snapshot) => {
          const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceOrder));
          setRecentOrders(o.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        }, (fallbackErr) => {
          handleFirestoreError(fallbackErr, OperationType.LIST, 'orders');
        });
      }
    });

    // Listen to ad campaigns for total daily budget
    const campaignsQ = query(
      collection(db, 'ad_campaigns'),
      where('userId', '==', user.uid),
      where('status', '==', 'Active')
    );
    const unsubCampaigns = onSnapshot(campaignsQ, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + (Number(doc.data().dailyBudget) || 0), 0);
      setActiveDailyBudget(total);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'ad_campaigns');
    });

    return () => {
      unsubOrders();
      unsubPayouts();
      unsubActive();
      unsubRecent();
      unsubCampaigns();
    };
  }, [user]);

  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning'; createdAt: any }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user || !userData) return;
    
    const welcomeId = `welcome-${user.uid}`;
    setNotifications(prev => {
      if (prev.some(n => n.id === welcomeId)) return prev;
      return [{
        id: welcomeId,
        message: `Welcome back, ${userData?.fullName || user.email?.split('@')[0]}! We're glad to see you again.`,
        type: 'info',
        createdAt: new Date()
      }, ...prev];
    });

    // Listen to user's deposits for status changes
    const depositsQ = query(collection(db, 'deposits'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), limit(5));
    const handleSnap = (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === 'modified') {
          const deposit = change.doc.data();
          const id = `deposit-${change.doc.id}-${deposit.status}`;
          
          if (deposit.status === 'Approved') {
            setNotifications(prev => {
              if (prev.some(n => n.id === id)) return prev;
              return [{
                id,
                message: "Success! Your deposit has been confirmed and added to your balance.",
                type: 'success',
                createdAt: new Date()
              }, ...prev];
            });
          } else if (deposit.status === 'Rejected') {
            setNotifications(prev => {
              if (prev.some(n => n.id === id)) return prev;
              return [{
                id,
                message: "Your deposit request was rejected. Please contact support.",
                type: 'warning',
                createdAt: new Date()
              }, ...prev];
            });
          }
        } else if (change.type === 'added') {
            const deposit = change.doc.data();
            if (deposit.status === 'Pending') {
                const id = `deposit-${change.doc.id}-pending`;
                setNotifications(prev => {
                    if (prev.some(n => n.id === id)) return prev;
                    return [{
                      id,
                      message: "Your deposit request is under review.",
                      type: 'info',
                      createdAt: new Date()
                    }, ...prev];
                });
            }
        }
      });
    };

    const unsub = onSnapshot(depositsQ, handleSnap, (err) => {
      if (err.message.includes('index')) {
        const fallbackQ = query(collection(db, 'deposits'), where('userId', '==', user.uid), limit(5));
        onSnapshot(fallbackQ, handleSnap, (fallbackErr) => {
          handleFirestoreError(fallbackErr, OperationType.LIST, 'deposits');
        });
      } else {
        handleFirestoreError(err, OperationType.LIST, 'deposits');
      }
    });

    return () => unsub();
  }, [user, userData]);

  const handleLogout = async () => {
    sessionStorage.removeItem('is2FAVerified');
    await signOut(auth);
    navigate('/');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Digital Products', icon: ShoppingBag },
    { id: 'ads', label: 'Ad Manager', icon: BarChart3 },
    { id: 'wallet', label: 'Transaction History', icon: History },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
    { id: 'withdraw', label: 'Payout', icon: ArrowUpCircle },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const adminSidebarItem = { id: 'admin', label: 'Admin Panel', icon: Lock };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-sm shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]">
                KG
              </div>
              <span className="font-bold tracking-tight text-lg text-white uppercase tracking-tighter">KIT GIZMO</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                  ${activeTab === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}
                `}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.label}
              </button>
            ))}

            {/* Admin Link (Conditional) */}
            {user && user.email === 'info.kitgizmo@gmail.com' && (
              <div className="pt-4 mt-4 border-t border-slate-800 space-y-1.5">
                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Internal Systems</p>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                    ${activeTab === 'admin' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}
                  `}
                >
                  <adminSidebarItem.icon className={`w-5 h-5 ${activeTab === 'admin' ? 'text-amber-400' : 'text-slate-500'}`} />
                  {adminSidebarItem.label}
                </button>
              </div>
            )}
          </nav>

          <div className="mt-8 pt-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Optimization</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mb-3">Enterprise Status Active</p>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex flex-col">
              <h1 className="text-xl font-black text-white uppercase tracking-tighter font-display leading-tight">
                {activeTab === 'ads' ? 'AI Ad campaigns' : 
                 activeTab === 'wallet' ? 'Transaction History' :
                 activeTab === 'deposit' ? 'Deposit Funds' :
                 activeTab === 'withdraw' ? 'Payout Requests' :
                 activeTab}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Global Sync Operational • Node {Math.floor(Math.random() * 99) + 1}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
              <RefreshCcw className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shopify Live Sync</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 rounded-xl relative hover:border-slate-700"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Notifications</h3>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-500 hover:text-emerald-400 font-bold uppercase transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <BellOff className="w-10 h-10 text-slate-800 mx-auto mb-2" />
                          <p className="text-xs text-slate-600 font-medium italic">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-4 hover:bg-slate-800/50 transition-colors group">
                              <div className="flex gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                  n.type === 'success' ? 'bg-emerald-500' : 
                                  n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                                <div>
                                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{n.message}</p>
                                  <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Just Now</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-800 mx-1" />

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 p-1 pr-4 rounded-2xl transition-all group ${activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 hover:border-slate-700'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm uppercase ${activeTab === 'settings' ? 'bg-slate-950 text-white' : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'}`}>
                {userData?.fullName ? userData.fullName.substring(0, 1) : (user?.email?.substring(0, 1) || 'G')}
              </div>
              <div className="text-left hidden sm:block">
                <p className={`text-[10px] font-black uppercase tracking-tight leading-none ${activeTab === 'settings' ? 'text-slate-950' : 'text-white'}`}>{userData?.fullName || 'GIZMO USER'}</p>
                <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-1 ${activeTab === 'settings' ? 'text-slate-800' : 'text-emerald-500'}`}>{userData?.isAdmin ? 'Admin Portal' : 'Scale Plan'}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' ? (
                <SettingsView user={user} />
              ) : (
                <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                        {activeTab === 'dashboard' ? 'System Overview' : 
                         activeTab === 'orders' ? 'Shopify Orders' : 
                         activeTab === 'ads' ? 'AI Ad Campaigns' :
                         activeTab === 'wallet' ? 'Transaction History' :
                         activeTab === 'deposit' ? 'Account Deposit' :
                         activeTab === 'withdraw' ? 'Payout Management' :
                         activeTab === 'orders' ? 'Digital Product Store' :
                         activeTab === 'services' ? 'SKU & Logistics' :
                         activeTab === 'support' ? 'Help & Support' : 'Overview'}
                      </h2>
                      <p className="text-slate-400 text-sm font-medium">
                        {activeTab === 'dashboard' ? 'Real-time data from USA Fulfillment Center' :
                         activeTab === 'orders' ? 'Elite training and high-conversion digital assets' :
                         activeTab === 'services' ? 'Manage your product inventory and global supply chain' :
                         'Securely manage your high-growth dropshipping operations'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm transition-all shadow-xl ${isEditMode ? 'text-emerald-500 border-emerald-500/50' : 'text-slate-400 hover:text-white'}`}
                      >
                        <Settings className="w-4 h-4" /> 
                        {isEditMode ? 'Save Layout' : 'Customize Board'}
                      </button>
                      {(activeTab === 'dashboard' || activeTab === 'wallet') && (
                        <button 
                          onClick={() => setActiveTab('deposit')}
                          className="bg-slate-900 border border-slate-800 text-white px-5 border-slate-700/50 hover:bg-slate-800 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm transition-all shadow-xl"
                        >
                          <Plus className="w-4 h-4" /> Deposit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Tab Content */}
                  {activeTab === 'dashboard' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">
                          Welcome back, {userData?.fullName || user?.email?.split('@')[0]}! We're glad to see you again.
                        </p>
                        <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-0.5">Scale node operational</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Dynamic Tab Content */}
                  {activeTab === 'dashboard' ? (
                    <>
                      {isEditMode && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] mb-8"
                        >
                          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Widget Library</h3>
                          <div className="flex flex-wrap gap-4">
                            {[
                              { id: 'balance', name: 'Total Balance', icon: Wallet },
                              { id: 'spending', name: 'Total Ad Spent', icon: CreditCard },
                              { id: 'payouts', name: 'Total Payout', icon: ArrowUpCircle },
                              { id: 'orders', name: 'Order Volume', icon: ShoppingBag },
                              { id: 'fulfillment', name: 'Fulfillment Rate', icon: Zap },
                              { id: 'ai_insights', name: 'AI Insights', icon: Sparkles }
                            ].map(w => (
                              <button
                                key={w.id}
                                onClick={() => toggleWidget(w.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border font-bold text-xs uppercase tracking-tight ${
                                  activeWidgets.includes(w.id) 
                                    ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                                }`}
                              >
                                <w.icon className="w-4 h-4" />
                                {w.name}
                                {activeWidgets.includes(w.id) ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                          {activeWidgets.map((widgetId, idx) => {
                            if (widgetId === 'balance') return (
                              <StatCard 
                                key="balance"
                                title="Total Balance" 
                                value={userData?.totalBalance ? `$${userData.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"} 
                                icon={Wallet} 
                                color="bg-emerald-500" 
                                subtitle="Available Funds"
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            if (widgetId === 'spending') return (
                              <StatCard 
                                key="spending"
                                title="Total Ad Spent" 
                                value={`$${activeDailyBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}/day`}
                                icon={CreditCard} 
                                color="bg-rose-500" 
                                subtitle="Active Budget Sync"
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            if (widgetId === 'payouts') return (
                              <StatCard 
                                key="payouts"
                                title="Total Payout" 
                                value={userData?.totalPayout ? `$${userData.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"} 
                                icon={ArrowUpCircle} 
                                color="bg-blue-500" 
                                subtitle="Withdrawn Total"
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            if (widgetId === 'orders') return (
                              <StatCard 
                                key="orders"
                                title="Shopify Orders" 
                                value={(userData?.shopifyOrders || 0).toString()} 
                                icon={ShoppingBag} 
                                color="bg-emerald-400" 
                                subtitle="Manual Store Sync"
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            if (widgetId === 'fulfillment') return (
                              <StatCard 
                                key="fulfillment"
                                title="Fulfillment Rate" 
                                value={userData?.ordersFulfilled && (userData.ordersFulfilled + (userData.ordersPending || 0)) > 0 
                                  ? `${Math.round((userData.ordersFulfilled / (userData.ordersFulfilled + (userData.ordersPending || 0))) * 100)}%` 
                                  : "100%"} 
                                icon={Zap} 
                                color="bg-amber-400" 
                                subtitle={`${userData?.ordersFulfilled || 0} Delivered`}
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            if (widgetId === 'ai_insights') return (
                              <StatCard 
                                key="ai_insights"
                                title="AI Insights" 
                                value="OPTIMAL" 
                                icon={Sparkles} 
                                color="bg-violet-500" 
                                subtitle="Campaigns performance high"
                                isEdit={isEditMode}
                                onRemove={() => toggleWidget(widgetId)}
                                onMoveUp={idx > 0 ? () => moveWidget(widgetId, 'up') : undefined}
                                onMoveDown={idx < activeWidgets.length - 1 ? () => moveWidget(widgetId, 'down') : undefined}
                              />
                            );
                            return null;
                          })}
                        </AnimatePresence>
                      </div>

                      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">30-Day Transaction Activity</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Scale Node Performance & Flux Graph</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Spending</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-slate-700/50 border border-slate-700 rounded-full" />
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Payouts</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-[400px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis 
                                dataKey="day" 
                                stroke="#475569" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => `D-${31-val}`}
                              />
                              <YAxis 
                                stroke="#475569" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => `$${val}`}
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="spending" 
                                stroke="#22c55e" 
                                fillOpacity={1} 
                                fill="url(#colorSpending)" 
                                strokeWidth={3}
                                animationDuration={1500}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="payouts" 
                                stroke="#475569" 
                                fillOpacity={0} 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </>
                  ) : activeTab === 'orders' ? (
                    <ServicesView user={user} totalBalance={userData?.totalBalance || 0} />
                  ) : activeTab === 'ads' ? (
                    <AdCampaignsView 
                      user={user} 
                      userData={userData} 
                      onForceStop={handleForceStopCampaign}
                      onForceStart={handleForceStartCampaign}
                    />
                  ) : activeTab === 'admin' && user && user.email === 'info.kitgizmo@gmail.com' ? (
                    <AdminPanelView 
                      user={user} 
                      onForceStop={handleForceStopCampaign}
                      onForceStart={handleForceStartCampaign}
                      onDeleteCampaign={handleDeleteCampaignGlobal}
                    />
                  ) : activeTab === 'wallet' ? (
                    <TransactionHistoryView user={user} />
                  ) : activeTab === 'deposit' ? (
                    <DepositRequestView user={user} />
                  ) : activeTab === 'withdraw' ? (
                    <PayoutView user={user} totalBalance={userData?.totalBalance || 0} />
                  ) : activeTab === 'support' ? (
                    <SupportView user={user} />
                  ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center">
                        {activeTab === 'orders' && <ShoppingCart className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'ads' && <BarChart3 className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'wallet' && <History className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'deposit' && <ArrowDownCircle className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'withdraw' && <ArrowUpCircle className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'services' && <Truck className="w-10 h-10 text-emerald-400" />}
                        {activeTab === 'support' && <Headphones className="w-10 h-10 text-emerald-400" />}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Module Integration Pending</h3>
                        <p className="text-slate-400 max-w-sm mx-auto">
                          Our AI is syncronizing data from the USA Fulfilment nodes. This section will be available once the initial handshake is complete.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Node Sync 82%</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user metadata for name reactively
        const docRef = doc(db, 'users', user.uid);
        
        // Clean up previous profile listener if any
        if (profileUnsubscribe) profileUnsubscribe();
        
        profileUnsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        if (profileUnsubscribe) profileUnsubscribe();
        setCurrentUser(null);
        setUserData(null);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage openAuth={openAuth} />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout user={currentUser} userData={userData} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            initialMode={authMode}
            onAuthSuccess={() => {}}
          />
        )}
      </AnimatePresence>
    </>
  );
}
