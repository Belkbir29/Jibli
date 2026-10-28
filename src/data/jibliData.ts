export interface Dish {
  id: string | number;
  name: string;
  desc: string;
  price: number;
  oldPrice?: number;
  img: string;
  category: string;
  tags?: string[];
  rating: number;
  time: number;
  restaurant: string;
  calories?: number;
}

export interface CartItem extends Dish {
  qty: number;
  options?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  total: number;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
  items: CartItem[];
  driverName?: string;
  driverPhone?: string;
  customerAddress?: string;
}

export interface DriverOrder {
  id: string;
  customer: string;
  address: string;
  total: number;
  distance: string;
  items: number;
  time: string;
}

export interface VendorOrder {
  id: string;
  customer: string;
  items: string;
  total: number;
  status: 'pending' | 'preparing' | 'ready';
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  available: boolean;
}

export interface Coupon {
  code: string;
  desc: string;
  expires: string;
  color: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export const INITIAL_CATEGORIES = [
  { key: 'all', name: 'الكل', icon: 'fa-border-all', color: 'primary' },
  { key: 'traditional', name: 'تقليدي', icon: 'fa-bowl-food', color: 'primary' },
  { key: 'fast', name: 'سريع', icon: 'fa-burger', color: 'accent' },
  { key: 'pizza', name: 'بيتزا', icon: 'fa-pizza-slice', color: 'accent' },
  { key: 'drinks', name: 'مشروبات', icon: 'fa-mug-hot', color: 'primary' },
  { key: 'dessert', name: 'حلويات', icon: 'fa-ice-cream', color: 'accent' },
  { key: 'healthy', name: 'صحي', icon: 'fa-leaf', color: 'success' }
];

export const INITIAL_DISHES: Dish[] = [
  { 
    id: 1, 
    name: 'كسكس باللحم والخضار', 
    desc: 'كسكس تقليدي جزائري بالخضار الموسمية واللحم الطازج ومرق أحمر خاثر', 
    price: 1200, 
    oldPrice: 1800, 
    img: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', 
    category: 'traditional', 
    tags: ['top', 'offer', 'halal'], 
    rating: 4.9, 
    time: 25, 
    restaurant: 'دار الضيافة العاصمة', 
    calories: 550 
  },
  { 
    id: 2, 
    name: 'طاجين الزيتون الجزائري', 
    desc: 'طاجين دجاج محمر بالزيتون المنزوع الملوحة والجزر والليمون المصير', 
    price: 1350, 
    oldPrice: 1600,
    img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80', 
    category: 'traditional', 
    tags: ['top', 'offer', 'halal'], 
    rating: 4.9, 
    time: 30, 
    restaurant: 'المطبخ الأصيل', 
    calories: 480 
  },
  { 
    id: 3, 
    name: 'رشتة عاصمية بالقرفة والدجاج', 
    desc: 'رشتة تقليدية مصنوعة يدوياً بمرق أبيض دافئ ولفت وقرفة ودجاج محمر', 
    price: 1100, 
    img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&auto=format&fit=crop&q=80', 
    category: 'traditional', 
    tags: ['top', 'halal'], 
    rating: 4.8, 
    time: 25, 
    restaurant: 'دار الضيافة العاصمة', 
    calories: 520 
  },
  { 
    id: 4, 
    name: 'برغر كرسبي دجاج فاخر', 
    desc: 'برغر دجاج كرسبي مع صوص الجبن الخاصة وخبز بريوش طازج ومقرمش', 
    price: 650, 
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 
    category: 'fast', 
    tags: ['fast', 'top', 'halal'], 
    rating: 4.7, 
    time: 15, 
    restaurant: 'برغر هاوس الجزائر', 
    calories: 490 
  },
  { 
    id: 5, 
    name: 'بيتزا مارغريتا فورنو', 
    desc: 'بيتزا إيطالية على الحطب بجبنة الموزاريلا الفاخرة وصلصة الطماطم الإيطالية', 
    price: 850, 
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80', 
    category: 'pizza', 
    tags: ['fast', 'offer', 'vegetarian'], 
    rating: 4.8, 
    time: 20, 
    restaurant: 'بيتزا روما ديزاد', 
    calories: 610 
  },
  { 
    id: 6, 
    name: 'شاورما سبيسيال جبلي', 
    desc: 'شاورما لحم بلدي مع ثومية وثلاث أنواع أجبان مذابة وبطاطا مقلية', 
    price: 550, 
    img: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&auto=format&fit=crop&q=80', 
    category: 'fast', 
    tags: ['fast', 'halal'], 
    rating: 4.6, 
    time: 12, 
    restaurant: 'ملك الشاورما', 
    calories: 430 
  },
  { 
    id: 7, 
    name: 'مشاوي مشكلة عائلية', 
    desc: 'تشكيلة كباب، شيش طاووق، وريش غنم على الفحم مع خبز نان وصوصات', 
    price: 1950, 
    oldPrice: 2400, 
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', 
    category: 'traditional', 
    tags: ['top', 'offer', 'halal'], 
    rating: 4.9, 
    time: 35, 
    restaurant: 'مشويات القصبة', 
    calories: 780 
  },
  { 
    id: 8, 
    name: 'سلطة سيزار بالدجاج المشوي', 
    desc: 'خس روماني طازج مع صدور دجاج مشوية، بارميزان، وخبز محمص مقرمش', 
    price: 750, 
    img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80', 
    category: 'healthy', 
    tags: ['healthy', 'top'], 
    rating: 4.6, 
    time: 15, 
    restaurant: 'جرين لايف', 
    calories: 320 
  },
  { 
    id: 9, 
    name: 'عصير برتقال طبيعي معصور', 
    desc: 'عصير برتقال جزائري 100% طازج بدون سكر مضاف وغني بفيتامين C', 
    price: 250, 
    img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', 
    category: 'drinks', 
    tags: ['fast', 'healthy', 'vegetarian'], 
    rating: 4.9, 
    time: 5, 
    restaurant: 'عصائر الطبيعة', 
    calories: 110 
  },
  { 
    id: 10, 
    name: 'بقلاوة جزائرية بالعسل واللوز', 
    desc: 'طبقات مورقة مقرمشة محشوة باللوز الجزائري ومسقية بعسل البرتقال الصافي', 
    price: 450, 
    img: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80', 
    category: 'dessert', 
    tags: ['offer', 'vegetarian'], 
    rating: 4.8, 
    time: 10, 
    restaurant: 'حلويات النجمة الذهبية', 
    calories: 290 
  },
  { 
    id: 11, 
    name: 'سوشي بوكس ميكس', 
    desc: 'تشكيلة سالمون وتونة طازجة مع أرز ياباني، زنجبيل مخلل وواسابي', 
    price: 2300, 
    img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80', 
    category: 'healthy', 
    tags: ['top', 'healthy'], 
    rating: 4.8, 
    time: 25, 
    restaurant: 'طوكيو سوشي الجزائر', 
    calories: 380 
  },
  { 
    id: 12, 
    name: 'قهوة لاتيه مختصة كراميل', 
    desc: 'إسبريسو غني بحبوب بن أرابيكا مع حليب مبخر وصوص كراميل ناعم', 
    price: 320, 
    img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80', 
    category: 'drinks', 
    tags: ['fast', 'vegetarian'], 
    rating: 4.9, 
    time: 5, 
    restaurant: 'كافيه دي لالجيري', 
    calories: 140 
  }
];

export const INITIAL_DRIVER_ORDERS: DriverOrder[] = [
  { id: 'JB-101', customer: 'أمين بن علي', address: 'حي السعادة، الجزائر الوسطى', total: 1850, distance: '2.3 كم', items: 3, time: '15 د' },
  { id: 'JB-102', customer: 'سارة مرابط', address: 'باب الزوار، قرب الجامعة', total: 1250, distance: '4.1 كم', items: 2, time: '20 د' },
  { id: 'JB-103', customer: 'ياسين حمدي', address: 'حسين داي، شارع طرابلس', total: 2400, distance: '5.8 كم', items: 4, time: '25 د' },
  { id: 'JB-104', customer: 'فاطمة الزهراء', address: 'حيدرة، شارع أحمد واكد', total: 3100, distance: '3.4 كم', items: 5, time: '18 د' }
];

export const INITIAL_VENDOR_ORDERS: VendorOrder[] = [
  { id: 'JB-201', customer: 'كريم بوعلام', items: 'كسكس باللحم x2، عصير برتقال x1', total: 2650, status: 'pending' },
  { id: 'JB-202', customer: 'ليلى عثماني', items: 'شاورما سبيسيال x3', total: 1650, status: 'preparing' },
  { id: 'JB-203', customer: 'مراد سعيدي', items: 'بيتزا مارغريتا x1، سلطة سيزار x1', total: 1600, status: 'pending' }
];

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', name: 'توصيل مجاني لطلبك القادم', cost: 50, icon: 'fa-truck-fast', available: true },
  { id: 'r2', name: 'خصم 10% على كل الأصناف', cost: 100, icon: 'fa-percent', available: true },
  { id: 'r3', name: 'مشروب طبيعي مجاني', cost: 150, icon: 'fa-mug-hot', available: true },
  { id: 'r4', name: 'وجبة مجانية من اختيارك', cost: 500, icon: 'fa-bowl-food', available: false },
  { id: 'r5', name: 'خصم 30% على وجبة العائلة', cost: 300, icon: 'fa-tag', available: false }
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'JIBLI50', desc: 'خصم 50% على أول طلب في التطبيق', expires: '31 ديسمبر 2026', color: 'from-[#FF5B4A] to-[#E04836]', discountType: 'percentage', discountValue: 50 },
  { code: 'WELCOME20', desc: 'خصم 20% للعملاء والمستخدمين الجدد', expires: '30 نوفمبر 2026', color: 'from-[#FFB627] to-[#E5A020]', discountType: 'percentage', discountValue: 20 },
  { code: 'FREEDEL', desc: 'توصيل مجاني تماماً على أي طلب', expires: '15 ديسمبر 2026', color: 'from-[#00C48C] to-emerald-600', discountType: 'fixed', discountValue: 200 }
];

export const TRANSLATIONS = {
  ar: {
    hero_badge: 'أكثر من 500 مطعم متاح في الجزائر',
    hero_title: 'اطلب طعامك المفضل واستمتع بتجربة فاخرة',
    hero_desc: 'اكتشف أرقى المطاعم والأطباق الجزائرية مع توصيل فائق السرعة، تتبع مباشر، ودعم على مدار الساعة.',
    cta_start: 'ابدأ الآن',
    cta_guest: 'تصفح كضيف',
    greeting: 'ماذا تريد أن تأكل اليوم؟',
    categories: 'تصنيفات سريعة',
    suggested: 'مقترح لك اليوم'
  },
  fr: {
    hero_badge: 'Plus de 500 restaurants disponibles',
    hero_title: 'Commandez votre plat préféré avec JIBLI',
    hero_desc: 'Découvrez les meilleurs restaurants avec livraison ultra-rapide et suivi en temps réel.',
    cta_start: 'Commencer',
    cta_guest: 'Naviguer comme invité',
    greeting: 'Que souhaitez-vous manger aujourd’hui ?',
    categories: 'Catégories rapides',
    suggested: 'Suggéré pour vous'
  },
  en: {
    hero_badge: '500+ restaurants available in Algeria',
    hero_title: 'Order your favorite food with JIBLI',
    hero_desc: 'Discover Algeria’s top restaurants with rapid delivery, live tracking, and 24/7 customer care.',
    cta_start: 'Start Now',
    cta_guest: 'Browse as Guest',
    greeting: 'What would you like to eat today?',
    categories: 'Quick Categories',
    suggested: 'Suggested for you'
  }
};
