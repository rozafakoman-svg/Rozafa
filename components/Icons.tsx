
import React from 'react';
import { 
  Search, BookOpen, Volume2, ArrowRight, Share2, Info, Loader2, Sparkles, X,
  CheckCircle, XCircle, GraduationCap, AlignLeft, Globe, HelpCircle, MapPin, Repeat, MessageCircle, Image, GitCompare,
  Grid3X3, Gamepad2, Type, ArrowLeft, RefreshCw, ScrollText, ShieldAlert, Headphones, Mic, Upload, PlayCircle, PauseCircle,
  FileText, Calendar, User, Clock, ArrowUpRight, Heart, Award, Crown, Zap, Shield, Star, CreditCard,
  Flag, Edit3, Medal, Trophy, TrendingUp, AlertTriangle, PlusCircle, ThumbsUp, Filter,
  ShoppingBag, DollarSign, BarChart3, TrendingDown, Package, ShoppingCart, Lock, Unlock, Mail, Megaphone, Save,
  ArrowBigUp, ArrowBigDown, MessageSquare, MoreHorizontal, Pin, Send, Trash2, Circle, Download, Book, Menu, Sun, Moon,
  Github, Twitter, Facebook, Instagram, Linkedin, Youtube,
  Mountain, Home, CloudRain, Briefcase, Coffee,
  Flame, Hash, Anchor, Users, LogOut, Eye, EyeOff,
  MousePointer2, Target, Plus, Tag, Settings, Wallet, Map,
  ShieldCheck, Key, Fingerprint, Activity, FileLock2, Server, Terminal,
  Castle, Landmark, Waves,
  Play, StopCircle,
  Smartphone,
  ChevronDown,
  Bold, Italic, List, Link,
  Diamond,
  Database,
  Box,
  LogIn,
  Quote
} from 'lucide-react';

// Custom Styled 'Illuminated B' for the Blog
const BlogB = (props: any) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M7 4C7 4 15 3 15 8C15 10.5 13 12 11 12C14 12 16 13.5 16 18C16 22 10 21 7 21V4Z" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M7 12H10" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M10 7C10 7 11.5 6 13 8C14.5 10 12 11 11 11" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeOpacity="0.5"
    />
    <circle cx="7" cy="4" r="1.5" fill="currentColor" />
    <circle cx="7" cy="21" r="1.5" fill="currentColor" />
  </svg>
);

// Custom Plain Question Mark for FAQ - Redrawn for larger visual footprint
const QuestionMark = (props: any) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M7 9a5 5 0 0 1 10 0c0 3-5 4-5 7" />
    <line x1="12" y1="21" x2="12.01" y2="21" />
  </svg>
);

/**
 * Custom Greek Pillars / Ancient Landmark icon for History
 */
const AncientColumns = (props: any) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 21h20" />
    <path d="M2 7h20v2H2z" />
    <path d="M12 3l10 4H2l10-4z" />
    <path d="M6 9v12" />
    <path d="M12 9v12" />
    <path d="M18 9v12" />
  </svg>
);

/**
 * Custom Heritage Mic for Podcast - Thicker and more "Broadcast" feeling
 */
const HeritageMic = (props: any) => (
  <svg 
    {...props} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

export { 
  Search, BookOpen, Volume2, ArrowRight, Share2, Info, Loader2, Sparkles, X,
  CheckCircle, XCircle, GraduationCap, AlignLeft, Globe, HelpCircle, MapPin, Repeat, MessageCircle, Image, GitCompare,
  Grid3X3, Gamepad2, Type, ArrowLeft, RefreshCw, ScrollText, ShieldAlert, Headphones, Mic, Upload, PlayCircle, PauseCircle,
  FileText, Calendar, User, Clock, ArrowUpRight, Heart, Award, Crown, Zap, Shield, Star, CreditCard,
  Flag, Edit3, Medal, Trophy, TrendingUp, AlertTriangle, PlusCircle, ThumbsUp, Filter,
  ShoppingBag, DollarSign, BarChart3, TrendingDown, Package, ShoppingCart, Lock, Unlock, Mail, Megaphone, Save,
  ArrowBigUp, ArrowBigDown, MessageSquare, MoreHorizontal, Pin, Send, Trash2, Circle, Download, Book, Menu, Sun, Moon,
  Github, Twitter, Facebook, Instagram, Linkedin, Youtube,
  Mountain, Home, CloudRain, Briefcase, Coffee,
  Flame, Hash, Anchor, Users, LogOut, Eye, EyeOff,
  MousePointer2, Target, Plus, Tag, Settings, Wallet, Map,
  ShieldCheck, Key, Fingerprint, Activity, FileLock2, Server, Terminal,
  Castle, Landmark, Waves,
  Play, StopCircle,
  Smartphone,
  ChevronDown,
  Bold, Italic, List, Link,
  Diamond,
  Database,
  Box,
  LogIn,
  BlogB,
  Quote,
  QuestionMark,
  AncientColumns,
  HeritageMic
};
