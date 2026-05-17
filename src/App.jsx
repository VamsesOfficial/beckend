import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Phone, Mail, Globe, MapPin, Menu, X, ChevronRight,
  Star, Shield, Leaf, Award, ArrowRight, Send,
  CheckCircle, Package, Sparkles, Heart, MessageCircle,
  Instagram, Facebook, Twitter, Linkedin, ExternalLink,
  Bath, Shirt, Scissors, Wind, Coffee, Droplets
} from "lucide-react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Products", href: "#products" },
  { label: "Why Choose Us", href: "#why" },
  { label: "Contact", href: "#contact" },
];

const PRODUCT_CATEGORIES = [
  {
    id: 1,
    icon: <Droplets size={32} />,
    name: "Personal Care Essentials",
    description:
      "Premium toothbrush kits, toothpaste, shampoo, conditioner, shower gel, and soap crafted for a luxurious in-room experience.",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    items: ["Toothbrush & Paste", "Shampoo", "Conditioner", "Shower Gel", "Bar Soap"],
    color: "#1a3a5c",
  },
  {
    id: 2,
    icon: <Shirt size={32} />,
    name: "Comfort Items",
    description:
      "Hotel-grade towels, plush bathrobes, and slippers designed to deliver superior softness and lasting durability.",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&q=80",
    items: ["Bath Towels", "Bathrobe", "Hotel Slippers", "Face Towel", "Bath Mat"],
    color: "#c9a84c",
  },
  {
    id: 3,
    icon: <Package size={32} />,
    name: "Convenience Goods",
    description:
      "Cotton buds, shower caps, combs, tissue, sewing kits, shoe shine, and all daily essentials guests expect.",
    image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&q=80",
    items: ["Cotton Buds", "Shower Cap", "Comb", "Tissue", "Sewing Kit", "Shoe Shine"],
    color: "#2c6e8a",
  },
  {
    id: 4,
    icon: <Leaf size={32} />,
    name: "Eco-Friendly Solutions",
    description:
      "Sustainable, biodegradable amenity lines made from responsibly sourced materials — guests love them, the planet does too.",
    image: "https://images.unsplash.com/photo-1542601906897-b03a9e6fc1b2?w=600&q=80",
    items: ["Bamboo Toothbrush", "Refillable Dispensers", "Recycled Packaging", "Natural Soap", "Organic Shampoo"],
    color: "#3a7d44",
  },
];

const PRODUCTS = [
  { id: 1, name: "Toothbrush & Paste Kit", category: "Personal Care", description: "Individually wrapped premium toothbrush with mint toothpaste, hotel-standard quality.", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=500&q=80" },
  { id: 2, name: "Luxury Shampoo", category: "Personal Care", description: "Nourishing formula with natural botanical extracts. Available in 30ml & 50ml.",  image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&q=80" },
  { id: 3, name: "Hotel Bathrobe", category: "Comfort Items", description: "Ultra-soft 100% cotton terry bathrobe. One-size-fits-all, custom embroidery available.", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80" },
  { id: 4, name: "Plush Hotel Slippers", category: "Comfort Items", description: "Closed-toe or open-toe slippers with non-slip sole, elegant and durable.", image: "https://images.unsplash.com/photo-1603778611925-b5a1f6e5e24e?w=500&q=80" },
  { id: 5, name: "Shower Cap", category: "Convenience Goods", description: "Waterproof PE shower cap, individually wrapped in elegant packaging.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80" },
  { id: 6, name: "Shower Gel", category: "Personal Care", description: "Moisturising shower gel with refreshing fragrance, pH-balanced formula.", image: "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=500&q=80" },
  { id: 7, name: "Premium Bath Towel", category: "Comfort Items", description: "600 GSM 100% Egyptian cotton bath towels with hotel-grade absorbency.", image: "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&q=80" },
  { id: 8, name: "Conditioner", category: "Personal Care", description: "Deep-conditioning formula enriched with argan oil. Leaves hair silky smooth.", image: "https://images.unsplash.com/photo-1597854710174-65a545bceda9?w=500&q=80" },
  { id: 9, name: "Eco Bamboo Kit", category: "Eco-Friendly", description: "Bamboo toothbrush + biodegradable packaging — the sustainable amenity guest love.", image: "https://images.unsplash.com/photo-1542601906897-b03a9e6fc1b2?w=500&q=80" },
  { id: 10, name: "Cotton Buds", category: "Convenience Goods", description: "100% pure cotton buds, safely designed and individually sealed.", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=500&q=80" },
  { id: 11, name: "Body Soap Bar", category: "Personal Care", description: "Gentle pH-balanced soap bar enriched with moisturising ingredients.", image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=500&q=80" },
  { id: 12, name: "Comb & Hair Kit", category: "Convenience Goods", description: "Foldable pocket comb with nail file, packaged in elegant organza bag.", image: "https://images.unsplash.com/photo-1626808642875-0aa545482dfb?w=500&q=80" },
];

const WHY_ITEMS = [
  { icon: <Award size={28} />, title: "Local Expertise", desc: "Deeply rooted in Bali's hospitality industry, we understand what hotels and resorts truly need to impress their guests." },
  { icon: <Sparkles size={28} />, title: "Clever Innovation", desc: "We continuously develop new amenity solutions — from refillable dispenser systems to eco packaging — staying ahead of industry trends." },
  { icon: <Shield size={28} />, title: "Exceptional Service", desc: "Dedicated account managers, flexible MOQ, fast delivery across Bali and all of Indonesia. Your deadlines are our priority." },
  { icon: <Leaf size={28} />, title: "Sustainable Commitment", desc: "We offer a full eco-friendly product line and partner with manufacturers who share our commitment to environmental responsibility." },
  { icon: <Star size={28} />, title: "Quality Assurance", desc: "Every product is quality-checked before delivery. We supply 5-star resorts, boutique hotels, and villa complexes across Bali." },
  { icon: <Heart size={28} />, title: "Trusted Partnership", desc: "We build long-term relationships — not just transactions. Our clients return because we genuinely care about their success." },
];

const STATS = [
  { value: "500+", label: "Hotels Served" },
  { value: "50+", label: "Product Lines" },
  { value: "10+", label: "Years Experience" },
  { value: "99%", label: "Client Satisfaction" },
];

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// ─── REUSABLE SECTION WRAPPER ─────────────────────────────────────────────────

function Section({ id, className = "", children }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function SectionLabel({ text }) {
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 justify-center mb-4">
      <div className="h-px w-8 bg-amber-500" />
      <span className="text-amber-600 text-xs font-bold tracking-[0.25em] uppercase">{text}</span>
      <div className="h-px w-8 bg-amber-500" />
    </motion.div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href) => {
    setActive(href);
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-lg shadow-navy-900/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => handleNav("#home")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a3a5c] to-[#2c6e8a] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-amber-400 font-black text-lg leading-none">K</span>
            </div>
            <div className="text-left">
              <p className={`font-black text-base leading-none tracking-tight transition-colors ${scrolled ? "text-[#1a3a5c]" : "text-white"}`}>
                Kawan Baik
              </p>
              <p className={`text-[10px] font-medium tracking-widest uppercase transition-colors ${scrolled ? "text-amber-600" : "text-amber-300"}`}>
                Bali
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l.href)}
                className={`text-sm font-medium transition-colors relative group ${
                  scrolled ? (active === l.href ? "text-[#1a3a5c]" : "text-slate-500 hover:text-[#1a3a5c]")
                           : (active === l.href ? "text-white" : "text-white/70 hover:text-white")
                }`}
              >
                {l.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-amber-500 transition-all duration-300 ${active === l.href ? "w-full" : "w-0 group-hover:w-full"}`} />
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://wa.me/6281234567890?text=Hello%20PT%20Kawan%20Baik%20Bali%2C%20I%20would%20like%20to%20request%20a%20quote."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold shadow-md hover:shadow-amber-500/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <MessageCircle size={15} />
              Request Quote
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-[#1a3a5c] hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 shadow-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => handleNav(l.href)}
                  className="text-left px-4 py-3 rounded-xl text-[#1a3a5c] font-medium hover:bg-slate-50 transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-center px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold"
              >
                Request Quote
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=85"
          alt="Luxury hotel"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2137]/90 via-[#1a3a5c]/75 to-[#1a3a5c]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d2137]/60 via-transparent to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-32 right-10 lg:right-32 w-64 h-64 rounded-full border border-amber-400/20 animate-pulse" />
      <div className="absolute top-40 right-20 lg:right-40 w-40 h-40 rounded-full border border-amber-400/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-12 bg-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">PT Kawan Baik Bali</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
          >
            Premium Hotel
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              Amenities
            </span>
            <br />
            Supplier in Bali
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg lg:text-xl text-white/75 leading-relaxed mb-10 max-w-xl"
          >
            Enhancing guest experiences with quality, luxury, and sustainability — trusted by 500+ hotels across Bali and Indonesia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-xl shadow-amber-900/30 hover:shadow-amber-500/50 hover:-translate-y-1 transition-all duration-300"
            >
              View Products <ArrowRight size={17} />
            </button>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/40 text-white font-bold hover:bg-white/10 hover:border-white/70 hover:-translate-y-1 transition-all duration-300"
            >
              Contact Us
            </button>
          </motion.div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="bg-white/10 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-2xl lg:text-3xl font-black text-amber-400">{s.value}</p>
                  <p className="text-white/60 text-xs font-medium mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <Section id="about" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div variants={fadeUp} className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80"
                alt="Hotel amenities"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/60 via-transparent" />
            </div>
            {/* Floating card */}
            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-2xl shadow-2xl p-5 max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-black text-[#1a3a5c] text-lg leading-none">ISO</p>
                  <p className="text-xs text-slate-500">Certified</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">Quality-assured products for every property.</p>
            </motion.div>
            {/* Decorative */}
            <div className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-[#1a3a5c]/5 -z-10" />
          </motion.div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <SectionLabel text="About Us" />
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#1a3a5c] leading-tight mb-6">
              Bali's Most Trusted Hotel
              <span className="text-amber-500"> Amenities Partner</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                <strong className="text-[#1a3a5c]">PT Kawan Baik Bali</strong> is a leading hospitality supply company headquartered in Bali, Indonesia. We specialise in providing comprehensive hotel amenities and hospitality equipment for hotels, resorts, villas, serviced apartments, and spas across the archipelago.
              </p>
              <p>
                Founded with a commitment to quality and partnership, we have grown to serve over 500 properties — from boutique guesthouses to 5-star international resorts. Our extensive product portfolio covers every guest touchpoint: bathroom amenities, in-room comfort items, laundry supplies, and eco-friendly alternatives.
              </p>
              <p>
                We believe the right amenities tell your guests: <em>"We care."</em> Our mission is to help every property in Indonesia deliver that experience — affordably, reliably, and beautifully.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: "Our Mission", desc: "Deliver quality hospitality products that elevate guest experiences." },
                { label: "Our Vision", desc: "To be Indonesia's No.1 hotel amenities partner by 2030." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <p className="font-bold text-[#1a3a5c] text-sm">{item.label}</p>
                  </div>
                  <p className="text-slate-500 text-sm leading-snug">{item.desc}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8">
              <button
                onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 text-[#1a3a5c] font-bold text-sm group"
              >
                Get in Touch
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── PRODUCT CATEGORIES ───────────────────────────────────────────────────────

function ProductCategories() {
  return (
    <Section id="categories" className="py-24 lg:py-32 bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel text="What We Offer" />
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-[#1a3a5c] leading-tight">
            Product Categories
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-slate-500 max-w-xl mx-auto">
            Four core categories covering every hotel amenity need — from personal care to sustainable alternatives.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={fadeUp}
              custom={i}
              className="group rounded-3xl overflow-hidden bg-white shadow-md shadow-slate-200/80 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div
                  className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.icon}
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="font-black text-[#1a3a5c] text-base mb-2 leading-tight">{cat.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{cat.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {cat.items.slice(0, 3).map((item) => (
                    <span key={item} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                  {cat.items.length > 3 && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      +{cat.items.length - 3} more
                    </span>
                  )}
                </div>

                <button
                  onClick={() => document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-1.5 text-[#1a3a5c] text-sm font-bold group/btn"
                >
                  Learn More
                  <ChevronRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── FEATURED PRODUCTS ────────────────────────────────────────────────────────

function FeaturedProducts() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  const filtered = filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <Section id="products" className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="Our Products" />
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-[#1a3a5c] leading-tight">
            Featured Products
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-slate-500 max-w-xl mx-auto">
            Quality amenities trusted by leading hotels. Filter by category to explore our full range.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                filter === cat
                  ? "bg-[#1a3a5c] text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
              >
                <div className="relative h-52 overflow-hidden bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold bg-white/90 backdrop-blur-sm text-[#1a3a5c] px-2.5 py-1 rounded-full shadow">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#1a3a5c] text-sm mb-1 leading-tight">{product.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-3">{product.description}</p>
                  <a
                    href={`https://wa.me/6281234567890?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group/link"
                  >
                    Enquire Now <ArrowRight size={12} className="transition-transform group-hover/link:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <a
            href="https://wa.me/6281234567890?text=Hello%2C%20I%20would%20like%20to%20see%20your%20full%20product%20catalogue."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#1a3a5c] text-[#1a3a5c] font-bold hover:bg-[#1a3a5c] hover:text-white transition-all duration-300"
          >
            <MessageCircle size={17} />
            Request Full Catalogue
          </a>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── WHY CHOOSE US ────────────────────────────────────────────────────────────

function WhyChooseUs() {
  return (
    <Section id="why" className="py-24 lg:py-32 bg-[#1a3a5c] relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/[0.02] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/5 translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div variants={fadeUp} className="flex items-center gap-3 justify-center mb-4">
            <div className="h-px w-8 bg-amber-400/60" />
            <span className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase">Why Choose Us</span>
            <div className="h-px w-8 bg-amber-400/60" />
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-white leading-tight">
            The Kawan Baik
            <span className="text-amber-400"> Difference</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-white/50 max-w-xl mx-auto">
            We don't just supply products — we build partnerships that help your property shine.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i}
              className="group p-6 rounded-2xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] hover:border-amber-400/30 transition-all duration-400"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:bg-amber-500/30 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-black text-white text-lg mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <Section id="cta" className="py-24 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-white leading-tight mb-4">
          Ready to Transform Your
          <br />Guest Experience?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
          Contact us today for a personalised quote. Fast response, no obligation — just a friendly conversation about your needs.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://wa.me/6281234567890?text=Hello%20PT%20Kawan%20Baik%20Bali%2C%20I%20would%20like%20to%20discuss%20hotel%20amenities%20supply."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-amber-600 font-black shadow-2xl shadow-amber-900/30 hover:-translate-y-1 hover:shadow-3xl transition-all duration-300 text-base"
          >
            <MessageCircle size={20} />
            Chat on WhatsApp
          </a>
          <button
            onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full border-2 border-white text-white font-black hover:bg-white hover:text-amber-600 transition-all duration-300 text-base"
          >
            Send Enquiry
          </button>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", hotel: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Hello PT Kawan Baik Bali,%0AName: ${form.name}%0AEmail: ${form.email}%0APhone: ${form.phone}%0AHotel/Property: ${form.hotel}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/6281234567890?text=${msg}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  const CONTACT_INFO = [
    { icon: <Phone size={20} />, label: "Phone", value: "+62 812-3456-7890", href: "tel:+6281234567890" },
    { icon: <Mail size={20} />, label: "Email", value: "hello@kawanbaikbali.com", href: "mailto:hello@kawanbaikbali.com" },
    { icon: <Globe size={20} />, label: "Website", value: "www.kawanbaikbali.com", href: "https://kawanbaikbali.com" },
    { icon: <MapPin size={20} />, label: "Address", value: "Jl. Sunset Road No. 88, Kuta, Badung, Bali 80361", href: "#" },
  ];

  return (
    <Section id="contact" className="py-24 lg:py-32 bg-[#f8f9fc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel text="Get In Touch" />
          <motion.h2 variants={fadeUp} className="text-3xl lg:text-5xl font-black text-[#1a3a5c]">
            Contact Us
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-slate-500 max-w-xl mx-auto">
            Ready to elevate your guest experience? Our team responds within 24 hours.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 mb-8">
              {CONTACT_INFO.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c] shrink-0 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{c.label}</p>
                    <p className="font-semibold text-[#1a3a5c] text-sm mt-0.5">{c.value}</p>
                  </div>
                </a>
              ))}
            </motion.div>

            {/* Map placeholder */}
            <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden shadow-md h-56 bg-slate-200">
              <iframe
                title="PT Kawan Baik Bali Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3944.2541934!2d115.167858!3d-8.720983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd2439b00a7edd3%3A0xd6b0ec44c427bd09!2sKuta%2C%20Badung%20Regency%2C%20Bali!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>

          {/* Form */}
          <motion.div variants={fadeUp} className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8">
            <h3 className="font-black text-[#1a3a5c] text-xl mb-6">Send Us a Message</h3>

            {sent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
              >
                <CheckCircle size={18} /> Message sent! We'll get back to you soon.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Full Name", placeholder: "John Smith", type: "text" },
                { name: "email", label: "Email Address", placeholder: "john@hotel.com", type: "email" },
                { name: "phone", label: "Phone Number", placeholder: "+62 812-xxxx-xxxx", type: "tel" },
                { name: "hotel", label: "Hotel / Property Name", placeholder: "The Grand Bali Resort", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.name === "name" || field.name === "email"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your amenity requirements..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#2c6e8a] text-white font-bold shadow-lg shadow-[#1a3a5c]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <Send size={16} />
                Send via WhatsApp
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  const QUICK_LINKS = ["Home", "About Us", "Products", "Why Choose Us", "Contact"];
  const PRODUCTS_LINKS = ["Personal Care", "Comfort Items", "Convenience Goods", "Eco-Friendly"];
  const SOCIAL = [
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
  ];

  return (
    <footer className="bg-[#0d2137] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a3a5c] to-[#2c6e8a] border border-white/10 flex items-center justify-center">
                <span className="text-amber-400 font-black text-lg">K</span>
              </div>
              <div>
                <p className="font-black text-base leading-none">Kawan Baik Bali</p>
                <p className="text-amber-400 text-[10px] tracking-widest uppercase font-medium">PT</p>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Bali's trusted hotel amenities supplier — delivering quality, luxury, and sustainability to properties across Indonesia.
            </p>
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-white/80 mb-5 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase().replace(" ", "-")}`} className="text-white/40 text-sm hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-sm text-white/80 mb-5 uppercase tracking-wider">Our Products</h4>
            <ul className="space-y-3">
              {PRODUCTS_LINKS.map((l) => (
                <li key={l}>
                  <a href="#categories" className="text-white/40 text-sm hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm text-white/80 mb-5 uppercase tracking-wider">Contact Info</h4>
            <div className="space-y-4">
              {[
                { icon: <Phone size={15} />, text: "+62 812-3456-7890", href: "tel:+6281234567890" },
                { icon: <Mail size={15} />, text: "hello@kawanbaikbali.com", href: "mailto:hello@kawanbaikbali.com" },
                { icon: <MapPin size={15} />, text: "Kuta, Badung, Bali 80361", href: "#" },
              ].map((c) => (
                <a key={c.text} href={c.href} className="flex items-start gap-3 text-white/40 text-sm hover:text-white/70 transition-colors group">
                  <span className="mt-0.5 text-amber-400/60 shrink-0">{c.icon}</span>
                  {c.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} PT Kawan Baik Bali. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((l) => (
              <a key={l} href="#" className="text-white/30 text-xs hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── SCROLL TO TOP ────────────────────────────────────────────────────────────

function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl hover:shadow-amber-500/40 hover:-translate-y-1 transition-all flex items-center justify-center"
        >
          <ChevronRight size={20} className="-rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen font-sans antialiased" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #fff; }
        ::selection { background: #c9a84c; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f0f0; }
        ::-webkit-scrollbar-thumb { background: #1a3a5c; border-radius: 10px; }
      `}</style>
      <Header />
      <main>
        <Hero />
        <About />
        <ProductCategories />
        <FeaturedProducts />
        <WhyChooseUs />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
