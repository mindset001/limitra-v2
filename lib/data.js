/* LIMITRA demo data — ES module port of legacy/data.js */
const naira = n => '₦ ' + n.toLocaleString('en-NG');

// category -> placeholder tint [stripe, base]
const TINTS = {
  phones:      ['rgba(47,75,219,.10)',  'rgba(47,75,219,.05)'],
  computing:   ['rgba(4,56,182,.10)',   'rgba(4,56,182,.05)'],
  electronics: ['rgba(151,71,255,.10)', 'rgba(151,71,255,.05)'],
  mens:        ['rgba(22,134,122,.11)', 'rgba(22,134,122,.05)'],
  womens:      ['rgba(214,52,124,.10)', 'rgba(214,52,124,.05)'],
  beauty:      ['rgba(214,52,124,.10)', 'rgba(214,52,124,.05)'],
  fragrance:   ['rgba(176,99,53,.12)',  'rgba(176,99,53,.05)'],
  home:        ['rgba(100,167,89,.12)', 'rgba(100,167,89,.06)'],
  kids:        ['rgba(245,166,35,.12)', 'rgba(245,166,35,.06)'],
  auto:        ['rgba(20,27,62,.10)',   'rgba(20,27,62,.05)'],
  sports:      ['rgba(229,72,77,.09)',  'rgba(229,72,77,.05)'],
  pets:        ['rgba(132,68,134,.11)', 'rgba(132,68,134,.05)'],
  adult:       ['rgba(120,40,80,.12)',  'rgba(120,40,80,.06)'],
};

const CATEGORIES = [
  { slug:'phones',      name:'Phones & Tablets',         count:1284, shot:'phone' },
  { slug:'computing',   name:'Computers & Accessories',  count:932,  shot:'laptop' },
  { slug:'electronics', name:'Electronics & Gadgets',    count:744,  shot:'gadget' },
  { slug:'mens',        name:'Men’s Fashion',            count:1376, shot:'apparel' },
  { slug:'womens',      name:'Women’s Fashion',          count:1502, shot:'apparel' },
  { slug:'beauty',      name:'Beauty & Personal Care',   count:1042, shot:'cosmetic' },
  { slug:'fragrance',   name:'Fragrance',                count:389,  shot:'perfume' },
  { slug:'home',        name:'Home & Kitchen Essentials',count:1118, shot:'kitchen' },
  { slug:'kids',        name:'Baby, Kids & Toys',        count:806,  shot:'toy' },
  { slug:'auto',        name:'Automobile Accessories',   count:472,  shot:'car part' },
  { slug:'sports',      name:'Sports & Fitness',         count:638,  shot:'fitness gear' },
  { slug:'pets',        name:'Pets',                     count:295,  shot:'pet supply' },
  { slug:'adult',       name:'Wellness & Intimacy',       count:214,  shot:'wellness product' },
];

const STORES = ['AeroTech','PixelHub','SoundLab','NovaStore','UrbanGear','CoreByte','Limitra Direct','VoltEdge','LuxeLocks','GlowMane','Velvet Beauty','Lumière'];

// Authoritative subcategory taxonomy per category (labels). Slugs derive via subSlugify.
const SUBCATS = {
  phones:      ['Smartphones','Tablets','Phone Cases','Screen Protectors','Chargers & Cables','Power Banks','Earbuds & Headphones','Smartwatches','Memory Cards','Tablet Accessories'],
  computing:   ['Laptops','Mini Laptops','Laptop Bags','Keyboards & Mice','Webcams','USB Hubs','Flash Drives','External Drives & SSD','Wi-Fi Routers','Laptop Stands','Printer Accessories'],
  electronics: ['Wireless Earbuds','Bluetooth Speakers','Smartwatches','Fitness Trackers','Cameras','Camera Accessories','Gaming Accessories','Streaming Devices','Smart Home','Portable Fans','Rechargeable Lamps','Adapters & Cables'],
  womens:      ['Dresses','Tops','Jeans','Skirts','Two-Piece Sets','Jackets','Heels','Sneakers','Sandals','Handbags','Watches','Sunglasses','Jewellery','Hair Accessories'],
  mens:        ['Shirts','T-Shirts','Polo Shirts','Jeans','Trousers','Shorts','Jackets','Shoes','Sneakers','Sandals','Watches','Belts','Sunglasses','Wallets','Caps & Hats'],
  beauty:      ['Makeup','Lipstick','Eye Makeup','Makeup Brushes','Skincare','Cleansers','Serums','Sunscreen','Hair Care','Wigs & Extensions','Hair Tools','Grooming & Shaving','Body Care'],
  fragrance:   ['Men’s Fragrance','Women’s Fragrance','Unisex Fragrance','Perfume Oils','Body Sprays','Mini & Travel Size','Gift Sets'],
  home:        ['Kitchen Tools','Storage Containers','Water Bottles','Lunch Boxes','Cutlery','Coffee & Tea','Home Decor','Bedsheets','Towels','Cleaning Tools','Bathroom Accessories','Closet Organizers','LED Lights'],
  kids:        ['Baby Clothing','Kids Clothing','Baby Shoes','Kids Shoes','Feeding Accessories','Baby Bags','Toys','Educational Toys','School Bags','Kids Watches'],
  auto:        ['Car Phone Holders','Car Chargers','Air Fresheners','Seat Accessories','Steering Wheel Covers','Car Lights','Tyre Gauges','Cleaning Accessories','Dash Cameras','Jump Starters'],
  sports:      ['Gym Gloves','Resistance Bands','Fitness Trackers','Yoga Mats','Water Bottles','Sports Bags','Waist Trainers','Jump Ropes','Football Accessories','Running Accessories'],
  pets:        ['Pet Collars','Pet Leashes','Pet Clothing','Pet Toys','Grooming Tools','Pet Bowls','Pet Beds','Travel Accessories'],
  adult:       ['Wellness','Couples','Massagers','Accessories'],
};

const subSlug = (s) => s.toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// base catalog — [category, sub, brand, name, shot, price, was, rating, reviews, badges, bestseller]
// `sub` MUST equal subSlug(label) of a category subcategory so subcategory pages resolve.
const SEED = [
  // ===== PHONES & TABLETS =====
  ['phones','smartphones','Apex','Apex 14 Pro 5G Smartphone, 256GB Titanium','phone',485000,560000,4.8,2143,['sale'],true],
  ['phones','smartphones','Nimbus','Nimbus Z9 Ultra 5G, 512GB Phantom Black','phone',612000,0,4.7,1320,['new'],true],
  ['phones','smartphones','Bolt','Bolt Lite 5G Smartphone, 128GB','phone',184000,0,4.3,512,[],false],
  ['phones','tablets','Apex','Apex Tab S11 11" Tablet with Stylus','tablet',398000,440000,4.6,876,['sale'],true],
  ['phones','tablets','Nimbus','Nimbus Pad Mini 8.4" Tablet, 128GB','tablet',236000,0,4.4,430,[],false],
  ['phones','phone-cases','UrbanGear','Rugged Armor Phone Case, Shockproof','accessory',12000,16000,4.5,2310,['sale'],false],
  ['phones','screen-protectors','CoreByte','Tempered Glass Screen Protector (3-Pack)','accessory',8000,11000,4.3,3120,['sale'],false],
  ['phones','chargers-cables','VoltEdge','Braided USB-C Charger & Cable Set, 2m','charger',18000,24000,4.4,5210,['sale'],false],
  ['phones','power-banks','VoltEdge','MagFlow Wireless Power Bank, 10,000mAh','charger',46000,0,4.5,1870,['new'],true],
  ['phones','earbuds-headphones','SoundLab','SoundLab Aura Pro Wireless ANC Headphones','headphones',156000,189000,4.8,3201,['sale','hot'],true],
  ['phones','earbuds-headphones','SoundLab','Aura Buds Lite Wireless Earbuds','headphones',39000,52000,4.4,1980,['sale'],false],
  ['phones','smartwatches','Apex','Apex Watch SE Smartwatch, 41mm','smartwatch',138000,0,4.5,760,['new'],false],
  ['phones','memory-cards','CoreByte','256GB microSD Memory Card, U3','accessory',22000,28000,4.6,2640,['sale'],false],
  ['phones','tablet-accessories','UrbanGear','Tablet Folio Keyboard Case, 11"','accessory',34000,0,4.4,410,[],false],

  // ===== COMPUTERS & ACCESSORIES =====
  ['computing','laptops','CoreByte','CoreByte ProBook 16" Laptop, M3 1TB SSD','laptop',1240000,1390000,4.9,684,['sale'],true],
  ['computing','laptops','NovaStore','Nova UltraSlim 14" Laptop, 16GB RAM','laptop',742000,0,4.5,398,['hot'],true],
  ['computing','mini-laptops','CoreByte','CoreByte Air 12" Mini Laptop, 8GB','laptop',398000,0,4.4,256,['new'],false],
  ['computing','laptop-bags','UrbanGear','Water-Resistant Laptop Backpack, 17"','bag',28000,36000,4.6,1240,['sale'],false],
  ['computing','keyboards-mice','CoreByte','MechWave RGB Keyboard & Mouse Combo','accessory',86000,99000,4.7,712,['sale'],false],
  ['computing','webcams','PixelHub','PixelHub 1080p Streaming Webcam','accessory',32000,0,4.5,540,['new'],false],
  ['computing','usb-hubs','VoltEdge','7-in-1 USB-C Hub Adapter','accessory',38000,46000,4.5,980,['sale'],false],
  ['computing','flash-drives','VoltEdge','128GB USB 3.2 Flash Drive','accessory',14000,0,4.5,1870,[],false],
  ['computing','external-drives-ssd','VoltEdge','2TB Portable SSD External Drive, USB-C','accessory',132000,0,4.6,910,['new'],false],
  ['computing','wi-fi-routers','NovaStore','AX3000 Wi-Fi 6 Dual-Band Router','smart device',74000,89000,4.6,640,['sale'],false],
  ['computing','laptop-stands','NovaStore','Adjustable Aluminium Laptop Stand','accessory',38000,0,4.7,920,[],false],
  ['computing','printer-accessories','PixelHub','Universal Ink Cartridge Set (4-Pack)','accessory',26000,0,4.3,380,[],false],

  // ===== ELECTRONICS & GADGETS =====
  ['electronics','wireless-earbuds','SoundLab','Aura Buds 3 True Wireless Earbuds','headphones',72000,0,4.5,2750,['new'],true],
  ['electronics','bluetooth-speakers','SoundLab','BoomBox Portable Bluetooth Speaker','headphones',58000,72000,4.6,1840,['sale'],true],
  ['electronics','smartwatches','Apex','Apex Watch Series 9 GPS Smartwatch, 45mm','smartwatch',268000,310000,4.8,1560,['sale'],true],
  ['electronics','fitness-trackers','Apex','PulseBand Fitness Tracker, AMOLED','smartwatch',42000,0,4.4,1320,['new'],false],
  ['electronics','cameras','PixelHub','PixelHub Z6 Mirrorless Camera Body','camera',1180000,0,4.9,312,['hot'],true],
  ['electronics','camera-accessories','AeroTech','60" Camera Tripod with Ball Head','accessory',34000,42000,4.5,420,['sale'],false],
  ['electronics','gaming-accessories','UrbanGear','Pro Wireless Game Controller, Carbon','console',54000,68000,4.6,980,['sale'],false],
  ['electronics','streaming-devices','NovaStore','4K HDR Streaming Stick','smart device',38000,0,4.5,1260,['new'],false],
  ['electronics','smart-home','NovaStore','PureAir Smart Air Purifier','smart device',210000,0,4.7,356,['new'],false],
  ['electronics','portable-fans','VoltEdge','Rechargeable Portable Neck Fan','accessory',16000,22000,4.3,1540,['sale'],false],
  ['electronics','rechargeable-lamps','VoltEdge','LED Rechargeable Desk Lamp, Dimmable','accessory',19000,0,4.5,720,[],false],
  ['electronics','adapters-cables','VoltEdge','Universal Travel Adapter, 65W GaN','charger',12000,16000,4.4,2110,['sale'],false],

  // ===== WOMEN'S FASHION =====
  ['womens','dresses','UrbanGear','Flowing Satin Maxi Dress','apparel',28000,0,4.6,720,['hot'],true],
  ['womens','tops','UrbanGear','Premium Oversized Cotton Top','apparel',18000,24000,4.4,1320,['sale'],false],
  ['womens','jeans','UrbanGear','High-Waist Skinny Jeans','apparel',22000,0,4.4,860,[],false],
  ['womens','skirts','UrbanGear','Pleated Midi Skirt','apparel',19000,25000,4.3,420,['sale'],false],
  ['womens','two-piece-sets','UrbanGear','Ribbed Knit Co-ord Two-Piece Set','apparel',32000,0,4.6,510,['new'],true],
  ['womens','jackets','UrbanGear','Cropped Denim Jacket','apparel',29000,38000,4.5,640,['sale'],false],
  ['womens','heels','GlowMane','Strappy Block-Heel Sandals','shoe',29000,36000,4.4,610,['sale'],false],
  ['womens','sneakers','NovaStore','Classic Low-Top Sneakers','shoe',34000,0,4.5,980,['hot'],false],
  ['womens','sandals','GlowMane','Comfort Slide Sandals','shoe',16000,21000,4.3,720,['sale'],false],
  ['womens','handbags','LuxeLocks','Quilted Leather Shoulder Bag','bag',64000,82000,4.7,510,['sale'],true],
  ['womens','watches','AeroTech','Rose-Gold Mesh Wristwatch','watch',48000,0,4.5,380,['new'],false],
  ['womens','sunglasses','UrbanGear','Oversized Cat-Eye Sunglasses','accessory',15000,20000,4.3,560,['sale'],false],
  ['womens','jewellery','Velvet Beauty','Gold-Plated Layered Necklace Set','jewellery',22000,0,4.5,640,['new'],false],
  ['womens','hair-accessories','Velvet Beauty','Satin Scrunchie & Claw Clip Set','accessory',8000,0,4.4,1240,[],false],

  // ===== MEN'S FASHION =====
  ['mens','shirts','UrbanGear','Tailored Oxford Cotton Shirt','apparel',24000,0,4.6,540,['new'],true],
  ['mens','t-shirts','UrbanGear','Premium Cotton Crew T-Shirt','apparel',12000,16000,4.5,1820,['sale'],false],
  ['mens','polo-shirts','UrbanGear','Classic Pique Polo Shirt','apparel',16000,0,4.4,760,[],false],
  ['mens','jeans','UrbanGear','Slim-Fit Stretch Jeans','apparel',28000,35000,4.5,920,['sale'],false],
  ['mens','trousers','UrbanGear','Slim-Fit Chino Trousers','apparel',32000,40000,4.5,720,['sale'],true],
  ['mens','shorts','UrbanGear','Tailored Cotton Shorts','apparel',18000,0,4.3,410,[],false],
  ['mens','jackets','UrbanGear','Lightweight Bomber Jacket','apparel',42000,54000,4.6,560,['sale'],false],
  ['mens','shoes','UrbanGear','Classic Leather Derby Shoes','shoe',46000,58000,4.6,540,['sale'],true],
  ['mens','sneakers','NovaStore','Everyday Knit Running Trainers','shoe',38000,0,4.5,1280,['hot'],false],
  ['mens','sandals','UrbanGear','Leather Slide Sandals','shoe',16000,0,4.3,480,[],false],
  ['mens','watches','AeroTech','Minimalist Steel Wristwatch','watch',58000,72000,4.6,410,['sale'],true],
  ['mens','belts','UrbanGear','Genuine Leather Belt & Wallet Set','accessory',26000,34000,4.5,930,['sale'],false],
  ['mens','sunglasses','UrbanGear','Polarised Aviator Sunglasses','accessory',17000,0,4.4,640,['new'],false],
  ['mens','wallets','UrbanGear','Slim RFID Leather Wallet','accessory',14000,19000,4.5,1120,['sale'],false],
  ['mens','caps-hats','UrbanGear','Adjustable Cotton Baseball Cap','accessory',9000,0,4.3,720,[],false],

  // ===== BEAUTY & PERSONAL CARE =====
  ['beauty','makeup','Velvet Beauty','Pro 35-Colour Eyeshadow Palette','cosmetic',31000,0,4.5,1180,['hot'],true],
  ['beauty','lipstick','Velvet Beauty','Velvet Matte Liquid Lipstick Set (6 Shades)','cosmetic',28000,36000,4.6,2100,['sale'],true],
  ['beauty','eye-makeup','Velvet Beauty','Waterproof Mascara & Liner Duo','cosmetic',14000,0,4.4,1640,['new'],false],
  ['beauty','makeup-brushes','Lumière','Pro 12-Piece Makeup Brush Set','brushes',19000,26000,4.5,1100,['sale'],false],
  ['beauty','skincare','Lumière','Hydra-Glow Moisturiser SPF30, 50ml','skincare',26000,0,4.7,1540,['new'],true],
  ['beauty','cleansers','Lumière','Gentle Foaming Facial Cleanser, 150ml','skincare',12000,16000,4.5,980,['sale'],false],
  ['beauty','serums','GlowMane','24K Gold Vitamin C Brightening Serum, 30ml','skincare',42000,52000,4.8,860,['sale','hot'],true],
  ['beauty','sunscreen','Lumière','Invisible Daily Sunscreen SPF50, 50ml','skincare',15000,0,4.6,1320,['new'],false],
  ['beauty','hair-care','GlowMane','Argan Oil Hair Repair Mask, 250ml','haircare',16000,21000,4.6,980,['sale'],false],
  ['beauty','wigs-extensions','LuxeLocks','Brazilian Body Wave HD Lace Front Wig, 22"','wig',148000,180000,4.8,940,['sale','hot'],true],
  ['beauty','wigs-extensions','GlowMane','Peruvian Straight Hair Bundles (3-Pack)','wig',96000,0,4.7,1230,['new'],false],
  ['beauty','hair-tools','GlowMane','Ceramic Hair Straightener, Fast-Heat','grooming',34000,42000,4.5,760,['sale'],false],
  ['beauty','grooming-shaving','GlowMane','Beard Grooming & Trimmer Kit','grooming',29000,0,4.4,860,['new'],false],
  ['beauty','body-care','Lumière','Shea Body Butter & Wash Gift Set','skincare',14000,0,4.5,640,[],false],

  // ===== FRAGRANCE (shippable only) =====
  ['fragrance','mens-fragrance','Lumière','Lumière Noir Eau de Parfum (Men), 100ml','perfume',58000,72000,4.8,1240,['sale','hot'],true],
  ['fragrance','womens-fragrance','Lumière','Velvet Bloom Eau de Parfum (Women), 75ml','perfume',52000,0,4.7,860,['new'],true],
  ['fragrance','unisex-fragrance','Lumière','Oud Royale Unisex Perfume, 75ml','perfume',86000,99000,4.7,540,['sale'],false],
  ['fragrance','perfume-oils','Velvet Beauty','Concentrated Perfume Oil Roll-On, 12ml','perfume',12000,0,4.4,720,[],false],
  ['fragrance','body-sprays','Velvet Beauty','Citrus Bloom Body Mist, 200ml','perfume',14000,0,4.4,860,['new'],false],
  ['fragrance','mini-travel-size','Lumière','Travel Perfume Trio (3 × 10ml)','perfume',22000,28000,4.6,510,['sale'],false],
  ['fragrance','gift-sets','Lumière','Luxury Fragrance Gift Set','perfume',64000,78000,4.7,420,['sale'],true],

  // ===== HOME & KITCHEN ESSENTIALS =====
  ['home','kitchen-tools','NovaStore','PureChef Non-Stick Cookware Set (10-Pc)','kitchen',88000,0,4.6,720,['new'],true],
  ['home','storage-containers','UrbanGear','Airtight Food Storage Container Set (12)','kitchen',18000,0,4.5,1240,[],false],
  ['home','water-bottles','VoltEdge','Insulated Stainless Water Bottle, 1L','kitchen',12000,16000,4.6,2110,['sale'],false],
  ['home','lunch-boxes','UrbanGear','Leakproof Bento Lunch Box Set','kitchen',9000,0,4.4,860,[],false],
  ['home','cutlery','NovaStore','24-Piece Stainless Cutlery Set','kitchen',22000,0,4.5,540,['new'],false],
  ['home','coffee-tea','UrbanGear','AeroBrew Smart Coffee Maker','kitchen',142000,168000,4.5,430,['sale'],true],
  ['home','home-decor','NovaStore','Decorative Wall Art Set (3-Piece)','kitchen',24000,0,4.4,380,[],false],
  ['home','bedsheets','UrbanGear','Cotton Bedsheet Set, Queen','kitchen',28000,36000,4.6,720,['sale'],false],
  ['home','towels','UrbanGear','Egyptian Cotton Towel Set (4-Pc)','kitchen',19000,0,4.5,610,[],false],
  ['home','cleaning-tools','NovaStore','Microfibre Cleaning Tool Kit','kitchen',11000,15000,4.4,980,['sale'],false],
  ['home','bathroom-accessories','UrbanGear','6-Piece Bathroom Accessory Set','kitchen',16000,0,4.4,420,[],false],
  ['home','closet-organizers','UrbanGear','Foldable Closet Organizer (Set of 6)','kitchen',14000,18000,4.5,860,['sale'],false],
  ['home','led-lights','VoltEdge','Smart LED Bulb Pack (4) RGB Wi-Fi','smart device',38000,46000,4.3,1290,['sale'],false],

  // ===== BABY, KIDS & TOYS =====
  ['kids','baby-clothing','NovaStore','Organic Cotton Baby Bodysuit Set (5-Pc)','apparel',14000,0,4.6,640,['new'],true],
  ['kids','kids-clothing','UrbanGear','Kids 2-Piece Casual Outfit','apparel',12000,16000,4.5,720,['sale'],false],
  ['kids','baby-shoes','GlowMane','Soft-Sole Baby Shoes','shoe',8000,0,4.5,420,[],false],
  ['kids','kids-shoes','NovaStore','Kids Light-Up Sneakers','shoe',14000,18000,4.5,860,['sale'],false],
  ['kids','feeding-accessories','AeroTech','Baby Nursing & Feeding Bottle Set (4-Pc)','toy',16000,21000,4.5,640,['sale'],false],
  ['kids','baby-bags','UrbanGear','Multi-Pocket Baby Diaper Bag','bag',24000,0,4.6,510,['new'],false],
  ['kids','toys','UrbanGear','Soft Plush Teddy Bear, 40cm','toy',12000,0,4.6,890,['new'],false],
  ['kids','educational-toys','NovaStore','Building Blocks Creative Toy Set (250 Pcs)','toy',24000,30000,4.7,1320,['sale'],true],
  ['kids','school-bags','UrbanGear','Ergonomic Kids School Backpack','bag',18000,0,4.5,720,[],false],
  ['kids','kids-watches','AeroTech','Kids Digital Sports Watch','watch',9000,12000,4.3,480,['sale'],false],

  // ===== AUTOMOBILE ACCESSORIES =====
  ['auto','car-phone-holders','VoltEdge','Magnetic Car Dashboard Phone Mount','car part',9000,13000,4.5,2100,['sale'],true],
  ['auto','car-chargers','VoltEdge','Dual USB-C 45W Car Charger','car part',8000,0,4.5,1640,[],false],
  ['auto','air-fresheners','UrbanGear','Car Air Freshener Vent Clips (3-Pack)','car part',5000,0,4.3,980,[],false],
  ['auto','seat-accessories','UrbanGear','Memory Foam Car Seat Cushion','car part',16000,21000,4.5,540,['sale'],false],
  ['auto','steering-wheel-covers','UrbanGear','Genuine Leather Steering Wheel Cover','car part',12000,0,4.4,420,['new'],false],
  ['auto','car-lights','VoltEdge','LED Interior Car Light Kit, App Control','car part',14000,18000,4.4,760,['sale'],false],
  ['auto','tyre-gauges','AeroTech','Digital Tyre Pressure Gauge','car part',8000,0,4.5,640,[],false],
  ['auto','cleaning-accessories','UrbanGear','Microfibre Car Cleaning Kit (8-Pc)','car part',18000,24000,4.4,810,['sale'],true],
  ['auto','dash-cameras','PixelHub','1080p Dash Camera with Night Vision','car part',44000,0,4.5,520,['new'],false],
  ['auto','jump-starters','VoltEdge','Portable Car Jump Starter, 2000A','car part',62000,78000,4.6,380,['sale'],false],

  // ===== SPORTS & FITNESS =====
  ['sports','gym-gloves','UrbanGear','Padded Anti-Slip Gym Gloves','fitness gear',7000,0,4.4,860,[],false],
  ['sports','resistance-bands','VoltEdge','Resistance Band Set (5 Levels)','fitness gear',11000,15000,4.6,1320,['sale'],true],
  ['sports','fitness-trackers','Apex','Sport Fitness Tracker, Waterproof','smartwatch',38000,0,4.4,980,['new'],false],
  ['sports','yoga-mats','UrbanGear','Non-Slip Yoga Mat with Carry Strap','fitness gear',14000,0,4.6,1320,['new'],true],
  ['sports','water-bottles','VoltEdge','Sport Shaker Water Bottle, 700ml','fitness gear',6000,8000,4.4,1640,['sale'],false],
  ['sports','sports-bags','UrbanGear','Water-Resistant Gym Duffel Bag','bag',19000,0,4.5,560,[],false],
  ['sports','waist-trainers','GlowMane','Adjustable Waist Trainer Belt','fitness gear',12000,16000,4.3,720,['sale'],false],
  ['sports','jump-ropes','AeroTech','Smart Skipping Rope with Counter','fitness gear',11000,15000,4.4,560,['sale'],false],
  ['sports','football-accessories','UrbanGear','Match Football, Size 5','fitness gear',14000,0,4.5,640,['new'],false],
  ['sports','running-accessories','UrbanGear','Running Armband & Waist Belt Set','fitness gear',8000,0,4.4,480,[],false],

  // ===== PETS (no food at launch) =====
  ['pets','pet-collars','NovaStore','Adjustable Padded Pet Collar','pet supply',6000,0,4.5,540,[],false],
  ['pets','pet-leashes','NovaStore','Retractable Dog Leash, 5m','pet supply',9000,12000,4.5,720,['sale'],true],
  ['pets','pet-clothing','UrbanGear','Cozy Fleece Pet Hoodie','pet supply',8000,0,4.4,420,['new'],false],
  ['pets','pet-toys','UrbanGear','Interactive Chew Toy Set (4-Pc)','pet supply',7000,0,4.5,860,[],false],
  ['pets','grooming-tools','GlowMane','Pet Grooming Brush & Deshedding Kit','pet supply',11000,15000,4.5,640,['sale'],false],
  ['pets','pet-bowls','NovaStore','Anti-Slip Double Pet Feeding Bowl','pet supply',8000,0,4.4,510,[],false],
  ['pets','pet-beds','NovaStore','Orthopedic Pet Bed, Large','pet supply',32000,42000,4.7,430,['sale'],true],
  ['pets','travel-accessories','UrbanGear','Breathable Pet Travel Carrier Bag','pet supply',24000,0,4.6,380,['new'],false],

  // ===== ADULT TOYS (discreet) =====
  ['adult','couples','Limitra Direct','Discreet Couples Wellness Kit','wellness product',38000,49000,4.6,520,['sale'],true],
  ['adult','massagers','Limitra Direct','Personal Massager, Rechargeable & Quiet','wellness product',29000,0,4.5,840,['new'],false],
  ['adult','wellness','Limitra Direct','Intimate Care & Wellness Essentials','wellness product',18000,0,4.4,360,[],false],
  ['adult','accessories','Limitra Direct','Body-Safe Care Accessory Set','wellness product',14000,0,4.3,290,[],false],
];

// sensible colour/shade options per product type
const SHADES = {
  wig:      [{name:'Natural Black',hex:'#1B1410'},{name:'Dark Brown',hex:'#3B2417'},{name:'Honey Blonde',hex:'#B07B43'},{name:'Burgundy',hex:'#5E1B26'}],
  cosmetic: [{name:'Rosewood',hex:'#A14A52'},{name:'Nude Beige',hex:'#C99877'},{name:'Classic Red',hex:'#C0202E'},{name:'Plum',hex:'#5E2A4E'}],
  apparel:  [{name:'Black',hex:'#1C1C1E'},{name:'Ivory',hex:'#EDE6D8'},{name:'Olive',hex:'#5A5A33'},{name:'Terracotta',hex:'#B5562F'}],
  shoe:     [{name:'Black',hex:'#1C1C1E'},{name:'White',hex:'#F2F0EB'},{name:'Tan',hex:'#B07B43'},{name:'Navy',hex:'#22305A'}],
  bag:      [{name:'Black',hex:'#1C1C1E'},{name:'Tan',hex:'#B07B43'},{name:'Cream',hex:'#EDE6D8'},{name:'Burgundy',hex:'#5E1B26'}],
};

const VARIANTS = {
  color: [
    { name:'Titanium', hex:'#8E8E93' },
    { name:'Phantom Black', hex:'#1C1C1E' },
    { name:'Sky Blue', hex:'#5AA9E6' },
    { name:'Sunset Orange', hex:'#F67208' },
  ],
  storage: ['128GB','256GB','512GB','1TB'],
};

const GENERIC_SPECS = [['Brand','Verified seller'],['Quality','Premium grade'],['In the box','Product + manual'],['Delivery','Nationwide, 10–14 days'],['Warranty','12 months'],['Returns','7-day guarantee']];

const SPECS = {
  phone:[['Display','6.7" LTPO AMOLED, 120Hz'],['Chipset','Octa-core 3.4GHz'],['Camera','108MP + 12MP + 10MP'],['Battery','5000mAh, 65W fast charge'],['OS','Android 15 / LimOS'],['Warranty','24 months']],
  tablet:[['Display','11" 2K LCD, 90Hz'],['Chipset','Octa-core 2.8GHz'],['Storage','256GB expandable'],['Battery','8200mAh'],['Stylus','Included'],['Warranty','24 months']],
  laptop:[['Display','16" 3.2K OLED, 120Hz'],['Processor','M3 8-core'],['Memory','16GB unified'],['Storage','1TB NVMe SSD'],['Battery','Up to 18 hrs'],['Warranty','24 months']],
  desktop:[['Processor','Ryzen 7 8-core'],['Memory','16GB DDR5'],['Storage','1TB NVMe SSD'],['Graphics','Integrated Radeon'],['Ports','USB-C, HDMI, RJ45'],['Warranty','24 months']],
  monitor:[['Panel','27" 4K UHD IPS'],['Refresh','144Hz'],['Response','1ms'],['Ports','HDMI 2.1, DP, USB-C'],['HDR','HDR400'],['Warranty','24 months']],
  headphones:[['Type','Over-ear / in-ear'],['ANC','Hybrid adaptive'],['Battery','40 hrs (ANC on)'],['Driver','40mm dynamic'],['Codec','LDAC, AAC'],['Warranty','12 months']],
  'smart device':[['Connectivity','Wi-Fi 6 + BLE'],['App','LimHome'],['Voice','Alexa & Google'],['Power','AC adapter'],['Warranty','12 months']],
  console:[['Storage','1TB SSD'],['Resolution','Up to 4K 120fps'],['Connectivity','Wi-Fi 6, BT 5.2'],['Ports','HDMI 2.1, USB-C'],['Warranty','12 months']],
  smartwatch:[['Display','1.9" AMOLED always-on'],['Health','ECG, SpO2, HR'],['Battery','Up to 36 hrs'],['Water','5ATM'],['GPS','Dual-band'],['Warranty','12 months']],
  camera:[['Sensor','24.5MP full-frame'],['ISO','100–51200'],['Video','4K 60fps'],['Mount','Z-mount'],['Stabilization','5-axis IBIS'],['Warranty','24 months']],
  tv:[['Panel','55" 4K QLED'],['Refresh','120Hz'],['Smart OS','LimOS TV'],['HDR','Dolby Vision'],['Ports','4× HDMI 2.1'],['Warranty','24 months']],
  charger:[['Output','Up to 65W'],['Ports','2× USB-C, 1× USB-A'],['Tech','GaN II'],['Safety','OVP, OCP'],['Warranty','18 months']],
  accessory:[['Material','Premium build'],['Compatibility','Universal fit'],['In the box','Accessory + guide'],['Quality','Verified seller'],['Warranty','12 months']],
  wig:[['Hair type','100% virgin human hair'],['Texture','As shown, can be restyled'],['Lace','HD transparent lace'],['Density','180%'],['Cap size','Adjustable, average'],['Care','Wash & deep-condition gently']],
  cosmetic:[['Finish','As described'],['Skin type','All skin types'],['Cruelty-free','Yes'],['Shade range','Multiple shades'],['Volume','As listed'],['Shelf life','24 months unopened']],
  skincare:[['Skin type','All skin types'],['Key actives','As described'],['Cruelty-free','Yes'],['Volume','As listed'],['Dermatologist tested','Yes'],['Shelf life','24 months unopened']],
  haircare:[['Hair type','All hair types'],['Key actives','Argan & keratin'],['Sulphate-free','Yes'],['Volume','As listed'],['Use','2–3× weekly'],['Shelf life','24 months']],
  nails:[['Includes','Polish + UV lamp'],['Finish','Glossy gel'],['Wear','Up to 21 days'],['Cruelty-free','Yes'],['Shades','Multiple'],['Warranty','6 months (lamp)']],
  brushes:[['Pieces','12-piece set'],['Bristles','Vegan synthetic'],['Handle','Aluminium ferrule'],['Use','Face & eyes'],['Care','Wash weekly'],['Warranty','12 months']],
  grooming:[['Includes','Trimmer + combs + oil'],['Battery','Up to 90 min cordless'],['Blades','Stainless steel'],['Waterproof','IPX6'],['Charging','USB-C'],['Warranty','12 months']],
  watch:[['Case','40mm stainless steel'],['Movement','Quartz'],['Glass','Sapphire-coated'],['Water','5ATM'],['Strap','Interchangeable'],['Warranty','24 months']],
  bag:[['Material','Genuine / vegan leather'],['Closure','Zip + magnetic'],['Strap','Adjustable, detachable'],['Lining','Soft microfibre'],['Care','Wipe clean'],['Returns','7-day guarantee']],
  jewellery:[['Material','18K gold-plated brass'],['Finish','Tarnish-resistant'],['Stones','Cubic zirconia'],['Hypoallergenic','Yes'],['Includes','Gift box'],['Warranty','12 months']],
  perfume:[['Type','Eau de Parfum'],['Family','As described'],['Longevity','8–10 hrs'],['Volume','As listed'],['Gender','As listed'],['Authenticity','Verified genuine']],
  kitchen:[['Material','Food-grade / stainless'],['Power','As listed'],['Use','Everyday kitchen'],['Cleaning','Easy-clean'],['Energy','Efficient'],['Warranty','12 months']],
  toy:[['Age','As listed on box'],['Material','Non-toxic, BPA-free'],['Safety','CE / EN71 certified'],['Pieces','As listed'],['Care','Wipe / wash clean'],['Warranty','6 months']],
  'car part':[['Material','Durable ABS / metal'],['Fit','Universal'],['Install','Tool-free / easy'],['In the box','Unit + fittings'],['Quality','Verified seller'],['Warranty','12 months']],
  'fitness gear':[['Material','Premium, durable'],['Use','Home & gym'],['Level','All levels'],['In the box','Gear + guide'],['Care','Wipe clean'],['Warranty','12 months']],
  'pet supply':[['Material','Pet-safe, washable'],['Size','As listed'],['Use','Indoor / outdoor'],['Cleaning','Machine washable'],['Quality','Verified seller'],['Warranty','6 months']],
  'wellness product':[['Material','Body-safe silicone'],['Power','USB rechargeable'],['Discretion','Plain, unbranded packaging'],['Waterproof','IPX7'],['Noise','Whisper-quiet'],['Warranty','12 months']],
  apparel:[['Material','Premium blend fabric'],['Fit','True to size'],['Sizes','XS – XXL'],['Care','Machine wash cold'],['Origin','Ethically made'],['Returns','7-day fit guarantee']],
  shoe:[['Upper','Premium leather / knit'],['Sole','Cushioned rubber outsole'],['Fit','True to size'],['Sizes','EU 38 – 46'],['Care','Wipe clean, air dry'],['Returns','7-day fit guarantee']],
};

const slugify = (s) => s.toLowerCase().replace(/[’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const PRODUCTS = SEED.map((s, i) => {
  const [category, sub, brand, name, shot, price, was, rating, reviews, badges, bestseller] = s;
  const baseSlug = slugify(name.split(',')[0]);
  return {
    id: 'p' + (i + 1),
    slug: baseSlug + '-' + (i + 1),
    category, sub, brand, name, shot, price, was, rating, reviews,
    badges, bestseller,
    store: STORES[i % STORES.length],
    tint: TINTS[category] || TINTS.phones,
    off: was ? Math.round((1 - price / was) * 100) : 0,
    specs: SPECS[shot] || GENERIC_SPECS,
    stock: [12, 4, 28, 7, 53, 9, 2][i % 7],
    desc: `${name.split(',')[0]} from ${brand}. Engineered for everyday performance with a premium finish, backed by Limitra's verified-seller guarantee and fast nationwide delivery.`,
    colors: (SHADES[shot] || VARIANTS.color).slice(0, 4),
  };
});

// ---- iPhone 17 Pro Max (featured, real per-colour photography) ----
const IPHONE = {
  id: 'iphone17promax',
  slug: 'iphone-17-pro-max-256gb',
  category: 'phones', sub: 'smartphones', brand: 'Apple',
  name: 'iPhone 17 Pro Max 256GB', shot: 'phone',
  price: 2399000, was: 0, rating: 4.9, reviews: 1876,
  badges: ['new', 'hot'], bestseller: true,
  store: 'Apple Store · Limitra', tint: TINTS.phones, off: 0,
  stock: 9,
  desc: 'iPhone 17 Pro Max. The most powerful iPhone ever. Brilliant 6.9-inch display, aluminium unibody design, A19 Pro chip, all 48MP rear cameras and best-ever battery life.',
  colors: [
    { name: 'Cosmic Orange', hex: '#C85A24' },
    { name: 'Deep Blue', hex: '#2B3A5B' },
    { name: 'Silver', hex: '#D8D8D4' },
  ],
  specs: [
    ['Display', '6.9" Super Retina XDR OLED, ProMotion 120Hz'],
    ['Chip', 'A19 Pro, 6-core CPU / 6-core GPU'],
    ['Rear camera', '48MP Fusion + 48MP Ultra Wide + 48MP Telephoto'],
    ['Front camera', '18MP Center Stage'],
    ['Storage', '256GB'],
    ['Design', 'Aluminium unibody, Ceramic Shield 2'],
    ['Battery', 'Best-ever, up to 39 hrs video playback'],
    ['OS', 'iOS 26'],
    ['Connectivity', '5G, Wi-Fi 7, Bluetooth 6'],
    ['Durability', 'IP68 water & dust resistant'],
    ['Warranty', '12 months Apple warranty'],
  ],
};
PRODUCTS.unshift(IPHONE);

// per-colour, per-angle real photography for products that have it
const PRODUCT_GALLERY = {
  iphone17promax: {
    'Cosmic Orange': ['/assets/img/ip17-orange-front.webp', '/assets/img/ip17-orange-design.webp', '/assets/img/ip17-orange-side.webp', '/assets/img/ip17-orange-cam.webp'],
    'Deep Blue':     ['/assets/img/ip17-blue-front.webp', '/assets/img/ip17-blue-cam.webp', '/assets/img/ip17-blue-side.webp'],
    'Silver':        ['/assets/img/ip17-silver-front.webp', '/assets/img/ip17-silver-cam.webp', '/assets/img/ip17-silver-side.webp'],
  },
};
// give the featured phone a card thumbnail
const REAL_IMG_EXTRA = { iphone17promax: '/assets/img/ip17-orange-front.webp' };

const byId   = id => PRODUCTS.find(p => p.id === id);
const bySlug = s => PRODUCTS.find(p => p.slug === s || p.id === s);
const byCat  = c  => PRODUCTS.filter(p => p.category === c);

const REVIEWS = [
  { name:'Chidinma O.', rate:5, date:'2 weeks ago', verified:true, title:'Exactly as described', body:'Arrived quick, sealed and genuine. The quality feels premium and it works exactly as promised. Limitra packaging was excellent.' },
  { name:'Tunde A.', rate:4, date:'1 month ago', verified:true, title:'Great value', body:'Solid quality for the price. Lost one star because delivery took a day longer than expected, but overall very happy.' },
  { name:'Aisha M.', rate:5, date:'1 month ago', verified:true, title:'Highly recommend', body:'My third order from this store on Limitra. Always authentic, always fast. Customer support answered within minutes.' },
  { name:'Emeka I.', rate:5, date:'2 months ago', verified:false, title:'Worth every naira', body:'Beautifully made and exactly what I wanted. Would buy again.' },
];

const ORDERS = [
  { id:'LMT-92481', date:'24 May 2026', status:'In transit', total:641000, items:2, eta:'31 May' },
  { id:'LMT-91022', date:'12 May 2026', status:'Delivered', total:156000, items:1, eta:'15 May' },
  { id:'LMT-88761', date:'28 Apr 2026', status:'Delivered', total:1240000, items:1, eta:'2 May' },
  { id:'LMT-87340', date:'09 Apr 2026', status:'Cancelled', total:38000, items:1, eta:'—' },
];

const ADDRESSES = [
  { id:1, label:'Home', name:'Lucy Limitra', line:'14 Admiralty Way, Lekki Phase 1', city:'Lagos', state:'Lagos', phone:'+234 802 345 6789', primary:true },
  { id:2, label:'Office', name:'Lucy Limitra', line:'Plot 7, Central Business District', city:'Abuja', state:'Abuja (FCT)', phone:'+234 805 998 1234', primary:false },
];

const CARDS = [
  { id:1, brand:'Visa', last:'4242', exp:'08/28', name:'Lucy Limitra', primary:true },
  { id:2, brand:'Mastercard', last:'8851', exp:'11/26', name:'Lucy Limitra', primary:false },
];

const USER = { name:'Lucy Limitra', username:'lucylimitra', email:'lucy@limitra.ng', phone:'+234 802 345 6789', initials:'LL', since:'Member since 2024' };

// role-based access — super admin recognised on login, redirected to /admin
const ADMINS = {
  'adefioyeemman@gmail.com': { name: 'Emmanuel Adefioye', role: 'Super Admin', initials: 'EA' },
  'saintjohnus@gmail.com': { name: 'Saint John', role: 'Super Admin', initials: 'SJ' },
};
// role registry keyed by email — role determines dashboard redirect
const USER_ROLES = {
  'adefioyeemman@gmail.com': { name: 'Emmanuel Adefioye', role: 'Super Admin', initials: 'EA', dest: '/admin' },
  'saintjohnus@gmail.com': { name: 'Saint John', role: 'Super Admin', initials: 'SJ', dest: '/admin' },
  'bjquyum@gmail.com': { name: 'Bolaji Quyum', role: 'Affiliate', initials: 'BQ', dest: '/affiliate/dashboard' },
};
const roleFor = (email) => USER_ROLES[(email || '').trim().toLowerCase()] || { role: 'Customer', dest: 'account' };
const ROLES = ['Super Admin', 'Admin', 'Manager', 'Customer Support', 'Affiliate Manager', 'Customer'];

const SOCIAL_GLYPHS = {
  X: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z',
  Facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  Instagram: 'M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.058-.976.045-1.505.207-1.858.344-.466.182-.8.4-1.15.748-.35.35-.566.684-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.041 0 2.67.01 2.986.058 4.04.045.977.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058 2.67 0 2.987-.01 4.04-.058.977-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.684.748-1.15.137-.353.3-.881.344-1.857.048-1.055.058-1.37.058-4.041 0-2.67-.01-2.986-.058-4.04-.045-.977-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.881-.3-1.857-.344-1.055-.048-1.37-.058-4.041-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z',
  WhatsApp: 'M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.871 9.871 0 0 0 1.518 5.26l-.999 3.648 3.74-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.094 1.094 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z',
  TikTok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .585.045.855.128V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.45a4.85 4.85 0 0 1-1.04-.07z',
};

// detect card brand from the first digit(s) of a PAN
const cardBrand = (num) => {
  const n = (num || '').replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^(50|65|6)/.test(n)) return 'Verve';
  if (/^3[47]/.test(n)) return 'Amex';
  return 'Card';
};

const REFERRAL = {
  code: 'LIM5000',
  credit: 5000,
  referrals: [
    { name: 'Chidinma O.', date: '2 weeks ago', status: 'Completed', reward: 5000 },
    { name: 'Tunde A.', date: 'Pending first order', status: 'Pending', reward: 0 },
  ],
};

export {
  naira, CATEGORIES, SUBCATS, PRODUCTS, PRODUCT_GALLERY, STORES, REVIEWS, ORDERS,
  ADDRESSES, CARDS, USER, ADMINS, USER_ROLES, roleFor, ROLES, REFERRAL, SOCIAL_GLYPHS,
  VARIANTS, byId, bySlug, byCat, cardBrand, REAL_IMG_EXTRA,
};
