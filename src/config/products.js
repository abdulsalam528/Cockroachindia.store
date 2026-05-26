const clothingIds = [
  'certified-cockroach-tee',
  'chal-be-hatt-tee',
  'eat-sleep-struggle-tee',
  'genz-never-giveup-tee',
  'mein-hu-genz-tee',
  'rozgar-pending-tee'
];

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

const rawProducts = [
  {
    id: "certified-cockroach-tee",
    name: "\"Certified Cockroach\" Oversized Graphic T-Shirt",
    price: 479,
    category: "Clothing",
    description: "Own the title. When they try to label an entire generation, we do what we do best—survive, multiply, and adapt. Inspired by the viral Cockroach Janta Party (CJP) movement sweeping across India, this tee is the ultimate badge of resilience for the modern youth.\n\nFeaturing a premium, bold arch print reading \"Certified Cockroach\" alongside the defiant slogan \"We Don't Die. We Adapt.\", this t-shirt is designed to make a statement, whether you’re scrolling through the discourse online or stepping out onto the streets.\n\nEngineered with an ultra-comfortable, relaxed streetwear drop-shoulder cut, it’s built to survive everything from the ultimate heatwaves to endless internet crackdowns.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779835052/certified_cockroach_black_1_ucw13e.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779835052/certified_cockroach_black_1_ucw13e.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779835052/certified_cockroach_white_1_brevcr.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779835052/certified_cockroach_black_2_stu2qb.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779835052/certified_cockroach_white_2_ofktw9.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "chal-be-hatt-tee",
    name: "\"Chal Be Hatt\" Graffiti Oversized Graphic T-Shirt",
    price: 479,
    category: "Clothing",
    description: "Flip the script. They called us pests, so we brought the ultimate repellent. The official \"Chal Be Hatt\" graphic tee is a loud, unapologetic masterpiece designed for the generation that refuses to keep quiet.\n\nFeaturing a premium, vibrant streetwear illustration, this shirt shows a drip-heavy, sneaker-wearing mascot spraying a can of \"GenZ Hit\" to clear out the old-school political noise. It’s bold, it’s chaotic, and it’s the ultimate statement piece for anyone backing the Cockroach Janta Party (CJP) movement.\n\nCut with a heavy-set drop-shoulder silhouette, this graphic tee brings absolute elite streetwear aesthetics straight to your wardrobe. Perfect for college fests, protests, or just chilling while making memes that shake up the timeline.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836474/chal_be_hatt_white_2_brkiml.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836474/chal_be_hatt_white_2_brkiml.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/chal_be_hatt_black_1_qvmd02.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836471/chal_be_hatt_white_1_l288tp.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "eat-sleep-struggle-tee",
    name: "\"Eat Sleep Struggle Adapt\" Checklist Oversized T-Shirt",
    price: 479,
    category: "Clothing",
    description: "The daily routine of a generation. They wanted a voice, so we gave them a checklist. The official \"Eat. Sleep. Struggle. Adapt. Repeat.\" oversized tee is a minimalist, hard-hitting tribute to the resilience of the modern Indian youth navigating the ultimate grind.\n\nTaking inspiration from the massive Cockroach Janta Party (CJP) movement, this clean typographic design perfectly balances subtle internet humor with a powerful statement on survival. Featuring a high-contrast checklist graphic on a heavy-knit drop-shoulder canvas, it's designed for those who face the chaos head-on every single day.\n\nWhether you're grinding through study hours, building your hustle, or pushing back against the system, this boxy-fit graphic tee delivers effortless, understated streetwear style.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/eat_sleep_struggle_adapt_repeat_black_1_wj3ir4.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/eat_sleep_struggle_adapt_repeat_black_1_wj3ir4.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/eat_sleep_struggle_adapt_repeat_white_1_ugiz3s.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "genz-never-giveup-tee",
    name: "\"GenZ Never Give Up\" Warrior Oversized Graphic T-Shirt",
    price: 479,
    category: "Clothing",
    description: "Battle-tested, timeline-approved. They shot their arrows, but we’re still standing. The official \"GenZ Never Give Up\" oversized graphic tee is a powerful, detailed visual statement celebrating the absolute refusal of today's generation to back down.\n\nAnchored heavily in the visual lore of the Cockroach Janta Party (CJP) movement, this premium tee features an intricate illustration of a cockroach survivor sporting an effortless streetwear look—complete with a hoodie, wallet chains, and cargo pants—unbothered by a massive arrow piercing through its shell. It’s the ultimate artistic metaphor for remaining completely unfazed by institutional pressure and systemic hurdles.\n\nCut with our signature relaxed drop-shoulder build, this t-shirt pairs a heavy graphic presence with premium, effortless daily comfort.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836471/genz_never_giveup_white_1_qb1it8.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836471/genz_never_giveup_white_1_qb1it8.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836470/genz_never_giveup_black_1_mrnjvl.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836471/genz_never_giveup_black_2_lhhjtq.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836470/genz_never_giveup_white_2_dpsiwg.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "mein-hu-genz-tee",
    name: "\"Main Hoon GenZ\" Podiums Oversized Graphic T-Shirt",
    price: 479,
    category: "Clothing",
    description: "The press conference they weren't prepared for. Take center stage with the official \"Main Hoon GenZ\" oversized graphic tee. Fusing traditional political rally aesthetics with raw internet culture, this shirt is made for those who stand tall and deliver reality checks.\n\nAs part of the historic Cockroach Janta Party (CJP) movement, this design features a bold Hindi typographic header \"में हूँ\" alongside a sunglasses-clad cockroach mascot addressing the nation from a podium microphone. It's the ultimate satirical take on standard political addresses—reimagined by and for the youth.\n\nCrafted on a heavy-weight, relaxed drop-shoulder canvas, this graphic tee brings bold contrast, flawless retro-modern aesthetics, and absolute comfort to your rotation.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/mein_hu_genz_black-1_c0xyki.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/mein_hu_genz_black-1_c0xyki.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836474/mein_hu_genz_white-1_vspvvk.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/mein_hu_genz_black-2_z73zfi.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836473/mein_hu_genz_white-2_azuimd.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  },
  {
    id: "rozgar-pending-tee",
    name: "\"Rozgar Pending\" Loading Bar Oversized Graphic T-Shirt",
    price: 479,
    category: "Clothing",
    description: "Still buffering. The official \"Rozgar Pending\" oversized tee is a sharp, unapologetic take on the defining struggle of our generation. Mixing sleek, retro digital interface aesthetics with hard-hitting social commentary, this piece speaks volumes without saying too much.\n\nA vital drop in the Cockroach Janta Party (CJP) satirical movement, the design showcases a bold typographic block reading \"ROZGAR PENDING\" right above a classic status-loading bar labeled \"LOADING SINCE 2014\". It’s the ultimate wearable reality check for everyone waiting on promises, degree verification, or that ever-elusive appointment letter.\n\nCrafted with a heavy-knit, relaxed drop-shoulder cut, this minimalist graphic tee brings an effortless edge to your daily fit—perfect for making your point clear on campus, at a protest, or across the timeline.",
    imageUrl: "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/rozgar_pending_white_1_u2vlym.png",
    images: [
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/rozgar_pending_white_1_u2vlym.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836471/rozgar_pending_black_1_jalwjf.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/rozgar_pending_white_2_rsqhod.png",
      "https://res.cloudinary.com/drro49vkm/image/upload/q_auto/f_auto/v1779836472/rozgar_pending_black_2_fh6ayi.png"
    ],
    stock: { S: 50, M: 100, L: 100, XL: 50 }
  }
];

export const products = rawProducts.map(p => ({
  ...p,
  variants: makeVariants(p.id, p.stock),
  images: p.images || [p.imageUrl],
  videoUrls: []
}));
