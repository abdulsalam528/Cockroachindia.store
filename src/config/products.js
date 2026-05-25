const clothingIds = ['cjp-cotton-armour', 'voice-unemployed-tee', 'stronger-together-tee', 'survivalist-hoodie'];

function makeVariants(id, stockObj) {
  const isClothing = clothingIds.includes(id);
  const colors = isClothing ? ['Black', 'White'] : ['Default'];
  const sizes = ['S', 'M', 'L', 'XL'];
  const variants = [];
  colors.forEach(color => {
    sizes.forEach(size => {
      const stock = stockObj[size] || 50;
      variants.push({ color, size, stock });
    });
  });
  return variants;
}

function makeImages(id, name, imageUrl) {
  const isClothing = clothingIds.includes(id);
  if (isClothing) {
    return [
      imageUrl,
      imageUrl.replace("EAE5D9/000000", "1F2937/FFFFFF").replace("text=Cotton+Armour", "text=" + encodeURIComponent(name) + "+(Charcoal)")
              .replace("text=Unemployed+Tee", "text=" + encodeURIComponent(name) + "+(Charcoal)")
              .replace("text=Stronger+Tee", "text=" + encodeURIComponent(name) + "+(Charcoal)")
              .replace("text=Survivalist+Hoodie", "text=" + encodeURIComponent(name) + "+(Charcoal)")
    ];
  }
  return [imageUrl];
}

function makeVideoUrls(id) {
  // Cotton Armour gets a test vertical YouTube video (Shorts format)
  if (id === 'cjp-cotton-armour') {
    return ['https://www.youtube.com/shorts/501z-b4mO74'];
  }
  return [];
}

const rawProducts = [
  {
    id: "cjp-cotton-armour",
    name: "CIS Anti-Squash Cotton Armour",
    price: 999,
    description: "Heavyweight 240 GSM vintage cotton armor. Guaranteed to survive extreme social pressure, slipper throws, and corporate layoffs. Voice of the lazy and resilient.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Cotton+Armour",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "lazy-manifesto-mug",
    name: "The Lazy Manifesto Mug",
    price: 499,
    description: "Premium ceramic mug designed for sipping chai while the nation builds itself. Fits 500ml of sweet procrastination. Double-glazed in parchment color.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Manifesto+Mug",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "chronically-online-cap",
    name: "Chronically Online Campaign Cap",
    price: 399,
    description: "Distressed denim visor designed to block out sunlight and eye contact. Specially optimized for 18-hour Twitter and Reddit political arguments.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Campaign+Cap",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "cockroach-office-jug",
    name: "Comrade Cockroach Office Jug",
    price: 1299,
    description: "Double-walled vacuum insulated steel jug. Store your cold tears of unemployment or 1 liter of water to survive any administrative desert.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Office+Jug",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "voice-unemployed-tee",
    name: "Voice of the Unemployed Graphic Tee",
    price: 899,
    description: "Let your shirt do the talking. Heavy grotesque display lettering reading 'Lazy, Unemployed, Unsquashable'. Perfect for job interviews you don't want.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Unemployed+Tee",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "parliamentary-procrastinator-jug",
    name: "Parliamentary Procrastinator Jug",
    price: 1499,
    description: "Solid copper water storage for long-running family debates or legislative filibusters. Gives water a metallic, bureaucratic taste of authority.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Procrastinator+Jug",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "resilience-shield-cap",
    name: "The Resilience Shield Cap",
    price: 449,
    description: "Industrial strength canvas cap with a vintage brass buckle. Guaranteed to cover unwashed hair and deflect political pamphlets.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Resilience+Cap",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "propaganda-tote-bag",
    name: "Satirical Propaganda Tote Bag",
    price: 349,
    description: "Carry the heavy weight of failed resolutions and high fuel prices. Extra wide handles for minimal shoulder effort.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Propaganda+Tote",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "crawling-success-mascot",
    name: "Crawling to Success Mascot",
    price: 799,
    description: "A solid pewter heavy paperweight shaped like Comrade Cockroach. Put it on your unpaid utility bills to remind yourself who will survive.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Desk+Mascot",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "lazyboy-cushion-cover",
    name: "The Lazyboy Cushion Cover",
    price: 299,
    description: "Woven parchment canvas cover featuring a bold print: 'Protest in Comfort'. Fits standard sofa cushions. Hand wash only.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Cushion+Cover",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "bribed-by-caffeine-mug",
    name: "Bribed by Caffeine Mug",
    price: 479,
    description: "Official enamel mug for verified members. Matte sepia finish with an warning symbol. Ideal for drinking tea while nodding at things you don't understand.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Bribed+Mug",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "stronger-together-tee",
    name: "Stronger Together Oversized Tee",
    price: 1099,
    description: "Double oversized silhouette in a vintage sepia tint. Front print features two cockroaches shaking hands across a pile of breadcrumbs.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Stronger+Tee",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "filibuster-flask",
    name: "Filibuster Thermo Flask",
    price: 1599,
    description: "Rugged flask with carrying handle. Keeps coffee hot enough to sustain a 12-hour speech defending your right to do absolutely nothing.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Filibuster+Flask",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "unsquashable-socks",
    name: "The Unsquashable Socks",
    price: 199,
    description: "Reinforced heel and toe fibers. Designed to handle heavy boots and dirty slippers. Walk with the confidence of an insect that has outlived dinosaurs.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Unsquashable+Socks",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "lazy-manifesto-notepad",
    name: "Official Protests Notepad & Pen",
    price: 249,
    description: "Includes a recycled paper notepad and a black ink pen. Perfect for drafting grand manifestos that you will lose before the first meeting starts.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Protest+Notepad",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "vip-lazy-member-badge",
    name: "VIP Lazy Member Brass Pin",
    price: 299,
    description: "Solid stamped brass badge with safety pin backing. Features the CIS emblem. Looks highly official, acts as a freepass to avoid manual labor.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Member+Badge",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "bureaucracy-mug",
    name: "The Bureaucracy Three-Handle Mug",
    price: 699,
    description: "Satirical design with three handles. Impossible to hold with one hand, requires dual authorization and a signed slip. A tribute to national red tape.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Bureaucracy+Mug",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "survivalist-hoodie",
    name: "CIS Satirical Survivalist Hoodie",
    price: 1899,
    description: "Heavy fleece parchment-colored hoodie. Fits loose. Built-in deep hood designed to obscure face during family questions about marriage or jobs.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Survivalist+Hoodie",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "sticker-pack",
    name: "CIS Satirical Sticker Pack",
    price: 149,
    description: "20 die-cut waterproof vinyl stickers featuring Comrade Cockroach, manifesto quotes, and slogans like 'Let Me Sleep' or 'Resilient & Unemployed'.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Sticker+Pack",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "propaganda-wall-poster",
    name: "Comrade Cockroach Wall Poster",
    price: 249,
    description: "A3 vintage sepia-toned lithograph print. Features the grand image of Comrade Cockroach standing tall. Place in study room to deter productivity.",
    imageUrl: "https://placehold.co/600x600/EAE5D9/000000?text=Propaganda+Poster",
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  }
];

export const products = rawProducts.map(p => ({
  ...p,
  variants: makeVariants(p.id, p.stock),
  images: makeImages(p.id, p.name, p.imageUrl),
  videoUrls: makeVideoUrls(p.id)
}));
